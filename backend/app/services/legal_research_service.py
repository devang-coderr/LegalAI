"""
Legal Research service -- RAG orchestration for POST /api/v1/legal/research.

Pipeline: query -> embed -> Qdrant search -> filter by score threshold ->
citations built from RETRIEVED METADATA (not LLM-invented) -> LLM
synthesizes an explanation grounded in that retrieved context -> response.

The core citation-grounding decision: `Citation` objects are built directly
from what Qdrant returns (title, court, date, excerpt -- all stored at
ingestion time), never from LLM free text. The LLM's only job is to write
`ai_explanation`, referencing the retrieved context it's given. This means
a citation can never be something the LLM made up -- it can only ever be
something that was actually retrieved. If nothing relevant is retrieved,
citations come back empty rather than the LLM inventing a plausible-looking
one -- exactly the "never fabricate citations" rule from the product docs.
"""
import re
from app.ai import qdrant_client
from app.ai.embeddings import embed_text
from app.ai.llm_client import generate_json
from app.core.config import settings
from app.schemas.legal import Citation, LegalResearchResult

_SYSTEM_INSTRUCTION = """You are a legal research assistant. You will be given a user's legal
question and a set of retrieved source excerpts. Using ONLY the provided sources -- never your
own general knowledge for specific legal claims -- respond with ONLY a JSON object:

{
  "aiExplanation": "string, 2-4 sentences synthesizing what the retrieved sources say about the query",
  "legalIssues": [{"id": "string", "title": "string", "description": "string", "severity": "HIGH|MEDIUM|LOW"}],
  "applicableLaws": [{"actName": "string", "section": "string", "title": "string", "explanation": "string"}]
}

If the retrieved sources don't actually address the question, say so plainly in aiExplanation
rather than answering from general knowledge -- an ungrounded answer is worse than an honest
"the available sources don't cover this."""


def _extract_legal_references(query: str) -> tuple[list[str], list[str]]:
    query_clean = query.lower()
    section_patterns = [
        r"\b(?:section|sec\.?|s\.)\s*([0-9]+[a-z]?)\b",
        r"\b(?:article|art\.?)\s*([0-9]+[a-z]?)\b",
        r"\b(?:order|o\.)\s*([0-9ivxlcdm]+)\b",
    ]
    sections = []
    for pat in section_patterns:
        for m in re.finditer(pat, query_clean):
            sections.append(m.group(0))
            sections.append(m.group(1))

    act_keywords = []
    known_act_terms = [
        "contract", "tenancy", "consumer", "property", "specific relief",
        "industrial disputes", "civil procedure", "cpc", "nyaya", "bns",
        "nagarik suraksha", "bnss", "constitution"
    ]
    for term in known_act_terms:
        if term in query_clean:
            act_keywords.append(term)

    return list(set(sections)), list(set(act_keywords))


def _calculate_boost(payload: dict, sections: list[str], act_keywords: list[str]) -> float:
    if not sections and not act_keywords:
        return 0.0

    title_lower = (payload.get("title") or "").lower()
    citation_lower = (payload.get("citation_number") or "").lower()
    excerpt_lower = (payload.get("excerpt") or "").lower()

    boost = 0.0

    # Section match
    for sec in sections:
        sec_clean = sec.strip()
        if not sec_clean:
            continue
        if sec_clean in title_lower or sec_clean in citation_lower:
            boost += 0.35
            break
        elif sec_clean in excerpt_lower:
            boost += 0.15
            break

    # Act match
    for act in act_keywords:
        if act in title_lower or act in citation_lower:
            boost += 0.20
            break

    return boost


def _determine_source_type(category: str | None, title: str) -> str:
    cat_lower = (category or "").lower()
    if cat_lower in ("statute", "constitution"):
        return "Statute"
    if cat_lower == "judgment":
        return "Judgment"
    title_lower = title.lower()
    if any(k in title_lower for k in ["act", "section", "article", "order", "rule", "code", "sanhita", "sannhita"]):
        return "Statute"
    return "Statute"


async def research(query: str, court: str = "ALL", source_type: str | None = None) -> LegalResearchResult:
    query_vector = embed_text(query)
    sections, act_keywords = _extract_legal_references(query)

    try:
        # Fetch candidate points with court filtering if court is a real court filter
        fetch_limit = max(settings.RETRIEVAL_TOP_K * 3, 10)
        raw_results = await qdrant_client.search(query_vector, limit=fetch_limit, court_filter=court)
    except Exception:
        return LegalResearchResult(
            query=query,
            ai_explanation=(
                "The legal knowledge base is temporarily unreachable, so no sources could be "
                "retrieved for this query. Check QDRANT_URL/QDRANT_API_KEY in .env and that your "
                "Qdrant instance (Cloud or local) is running -- see /health for current status."
            ),
            legal_issues=[], applicable_laws=[], citations=[], precedents=[],
        )

    scored_candidates = []
    for r in raw_results:
        payload = r.payload or {}
        boost = _calculate_boost(payload, sections, act_keywords)
        final_score = r.score + boost
        if final_score >= settings.RETRIEVAL_MIN_SCORE:
            cat = payload.get("category", "statute")
            stype = _determine_source_type(cat, payload.get("title", ""))

            # If source_type filter is specified, filter candidates
            if source_type and source_type != "all" and source_type != "ALL":
                if stype.lower() != source_type.lower():
                    continue

            scored_candidates.append({
                "id": str(r.id),
                "title": payload.get("title", "Untitled source"),
                "citation_number": payload.get("citation_number", "N/A"),
                "court": payload.get("court", "Unknown"),
                "judgment_date": payload.get("judgment_date", "Unknown"),
                "excerpt": payload.get("excerpt", ""),
                "source_url": payload.get("source_url"),
                "ratio_decidendi": payload.get("excerpt", "")[:200],
                "category": cat,
                "source_type": stype,
                "final_score": final_score,
            })

    scored_candidates.sort(key=lambda x: x["final_score"], reverse=True)
    top_candidates = scored_candidates[:settings.RETRIEVAL_TOP_K]

    citations = [
        Citation(
            id=c["id"],
            title=c["title"],
            citation_number=c["citation_number"],
            court=c["court"],
            judgment_date=c["judgment_date"],
            excerpt=c["excerpt"],
            source_url=c["source_url"],
            ratio_decidendi=c["ratio_decidendi"],
            category=c["category"],
            source_type=c["source_type"],
        )
        for c in top_candidates
    ]

    if not citations:
        return LegalResearchResult(
            query=query,
            ai_explanation=(
                "No sources in the legal knowledge base met the relevance threshold for this query. "
                "This usually means the knowledge base doesn't yet cover this topic, not that no "
                "answer exists -- the knowledge base is still being built out (see scripts/seed_legal_knowledge.py)."
            ),
            legal_issues=[], applicable_laws=[], citations=[], precedents=[],
        )

    context = "\n\n".join(f"[Source: {c.title}, {c.court}]\n{c.excerpt}" for c in citations)
    prompt = f"User's question: {query}\n\nRetrieved sources:\n{context}"
    raw, used_fallback = await generate_json(prompt, _SYSTEM_INSTRUCTION)

    if used_fallback:
        msg = (
            f"Found {len(citations)} potentially relevant source(s) below. AI synthesis is not configured "
            "(LLM_API_KEY missing in .env) -- citations and extracted statutory references are real retrieval results."
            if not settings.LLM_API_KEY else
            f"Found {len(citations)} potentially relevant source(s) below. AI synthesis was temporarily unavailable "
            "from the LLM provider -- citations and extracted statutory references are real retrieval results."
        )
        return LegalResearchResult(
            query=query,
            ai_explanation=msg,
            legal_issues=[], applicable_laws=[], citations=citations, precedents=[],
        )

    return LegalResearchResult(
        query=query,
        ai_explanation=raw.get("aiExplanation", ""),
        legal_issues=raw.get("legalIssues", []),
        applicable_laws=raw.get("applicableLaws", []),
        citations=citations,
        precedents=[],
    )
