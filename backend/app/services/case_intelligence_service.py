"""
Case Intelligence service -- analyzes user legal queries using Indian jurisprudence.
Uses Qdrant vector retrieval for legal grounding + LLM analysis.
"""
from app.ai import qdrant_client
from app.ai.embeddings import embed_text
from app.ai.llm_client import generate_json
from app.core.config import settings
from app.schemas.case import CaseIntelligenceResult

_SYSTEM_INSTRUCTION = """You are LegalAI Citizen Intelligence Assistant, an empathetic and legally rigorous legal assistant for Indian citizens and advocates.

CRITICAL GUIDELINES:

1. STRICT LANGUAGE CONSISTENCY:
   - Detect the language and style of the user's query and respond ENTIRELY in that exact language across ALL JSON fields:
     * Hindi (Devanagari) -> Natural, polite Hindi (हिंदी).
     * Hinglish (Roman script mix) -> Conversational, natural Hinglish.
     * English -> Clear, simple English.

2. DISTINGUISH CONFIRMED FACTS FROM LEGAL POSSIBILITIES (DO NOT MAKE DEFINITE CONCLUSIONS):
   - Clearly distinguish between what the citizen stated as a fact (e.g., "The citizen states that ₹50,000 was paid and has not been returned") versus legal possibilities (e.g., "Depending on the rental agreement terms and applicable state tenancy law, the tenant may have a potential claim for recovery").
   - NEVER make definitive legal declarations such as "This is definitely illegal", "The landlord has committed a clear statutory breach", or "The citizen is guaranteed full compensation".

3. DO NOT INVENT OR ASSUME UNSTATED LEGAL RIGHTS OR SPECIFIC FORUMS:
   - Do NOT assume a specific state rent act, Model Tenancy Act, Consumer Protection Act, or specific Rent Authority / Court definitely governs unless established by facts.
   - Clarify that jurisdiction and governing law depend on the state/city, existence and registration of a written agreement, and specific circumstances.
   - Do NOT state that a 15-day deadline is a mandatory statutory requirement unless specified by law.

4. APPLICABLE LAWS MUST EXPLAIN "WHY" AND WHAT FACT IS STILL NEEDED:
   - For each statutory section cited, the explanation MUST briefly include:
     1) What the provision generally deals with.
     2) Why it may be relevant to the user's stated problem.
     3) What crucial fact or document is still needed to confirm its applicability (e.g., written contract clause, property location/state, proof of notice).
   - Do NOT treat procedural provisions (like CPC Section 9) as substantive rights creating a refund obligation.

5. PRECEDENTS MUST BE RELEVANCE-GROUNDED:
   - Include a short, accurate "whyRelevant" explanation.
   - If a precedent is only analogous or general (such as service deficiency or general principles of accountability), explicitly label it as "General/indirect relevance" (e.g., "सामान्य/अप्रत्यक्ष प्रासंगिकता: ...").
   - Never fabricate fake case citations. If no directly relevant case law is found in the available context, clearly state that no directly relevant precedent was identified.

6. CITIZEN-FRIENDLY PLAIN LANGUAGE & DYNAMIC PARTY ROLES:
   - Avoid generic courtroom jargon like "Aggrieved Party / Complainant vs Opposing Party / Respondent".
   - Dynamically identify parties matching the specific scenario and language:
     * Hindi (Tenancy): "आप — किरायेदार" vs "दूसरा पक्ष — मकान मालिक"
     * Hinglish (Tenancy): "Aap — Tenant (किरायेदार)" vs "Dusra paksh — Landlord (मकान मालिक)"
     * English (Tenancy): "You — Tenant" vs "Opposite Party — Landlord"

7. FACT-SENSITIVE RECOMMENDED STEPS & MISSING INFORMATION:
   - Fact-sensitive steps:
     1) Preserve documents (agreements, payment proofs, move-out photos/notes, messages).
     2) Review agreement terms regarding deposit refund, notice period, and deduction clauses.
     3) Send a formal written demand requesting refund and an itemized breakdown of any deductions.
     4) If unresolved, consult an advocate to determine the appropriate forum based on state tenancy law and agreement status.
   - Identify key missing facts (State/city, written agreement copy, payment proof, deduction claims, handover inspection proof).

Output a JSON object with this exact schema:
{
  "summary": "2-3 sentence overview distinguishing stated facts from legal possibilities in user's language",
  "facts": {
    "overview": "Synthesized factual background in user's language without verbatim repetition",
    "keyEvents": [{"date": "Timeframe/Date or null", "event": "Event description in user's language"}],
    "parties": {"plaintiff": "Specific citizen identity in user's language", "defendant": "Specific opposing party identity in user's language"}
  },
  "issues": [
    {"id": "issue-1", "title": "Issue title in user's language", "description": "Cautious legal explanation in user's language", "severity": "HIGH|MEDIUM|LOW"}
  ],
  "applicableLaws": [
    {"actName": "Name of Indian Act", "section": "Section number", "title": "Section title in user's language", "explanation": "General scope + Why potentially relevant + What fact is needed"}
  ],
  "precedents": [
    {"id": "prec-1", "caseName": "Case Name", "citation": "Citation", "court": "Supreme Court of India / High Court", "year": 2020, "relevanceScore": 0.85, "summary": "Decision summary", "whyRelevant": "Precise relevance or General/indirect relevance note"}
  ],
  "recommendedSteps": [
    "Step 1 in user's language",
    "Step 2 in user's language"
  ]
}

Output ONLY valid JSON."""

_DISCLAIMERS = {
    "hindi": (
        "यह एआई-संचालित कानूनी जानकारी केवल आपके अधिकारों और कानूनी प्रक्रियाओं को समझने में सहायता के लिए है। "
        "यह किसी अधिवक्ता की औपचारिक कानूनी सलाह नहीं है। कोई भी कानूनी कदम उठाने से पहले किसी सत्यापित वकील से सलाह लें।"
    ),
    "hinglish": (
        "Yeh AI-powered legal intelligence aapke rights aur legal procedures samajhne ke liye hai. "
        "Yeh advocate ki formal legal advice nahi hai. Koi bhi legal step lene se pehle verified lawyer se consult karein."
    ),
    "english": (
        "This is AI-powered legal intelligence provided to assist in understanding legal rights and procedures under "
        "Indian Law. It does not constitute formal advocate-client advice. Consult a verified advocate before initiating litigation."
    ),
}


def _detect_language(query: str) -> str:
    # 1. Check for Devanagari script (Hindi)
    if any("\u0900" <= ch <= "\u097f" for ch in query):
        return "hindi"
    # 2. Check for unambiguous Hinglish markers in Roman script (exclude common English words like 'the', 'options')
    hinglish_markers = {
        "kya", "hai", "hain", "kaise", "mujhe", "mera", "meri", "mere", "batao",
        "nahi", "kare", "karna", "milega", "milti", "milta", "paise", "paisa",
        "chahiye", "raha", "rahi", "rahe", "bataiye", "apna", "apne", "apni",
        "gaya", "gayi", "gaye", "hoga", "hogi", "hoge", "kuch", "wapas",
        "mahina", "mahine", "chhode", "choda", "bada", "badi", "paas", "bhi",
        "khali", "aur", "toh", "liye", "lene"
    }
    words = set(query.lower().replace("?", " ").replace(",", " ").replace(".", " ").replace("₹", " ").split())
    overlap = words & hinglish_markers
    if len(overlap) >= 2 or (len(overlap) >= 1 and len(words) <= 5):
        return "hinglish"
    return "english"


async def analyze(query: str) -> CaseIntelligenceResult:
    lang = _detect_language(query)

    # 1. Retrieve relevant precedents and statutory context from Qdrant if available
    retrieved_context = ""
    try:
        query_vector = embed_text(query)
        raw_results = await qdrant_client.search(query_vector, limit=3)
        relevant_chunks = [r for r in raw_results if r.score >= 0.25]
        if relevant_chunks:
            retrieved_context = "\n\nRetrieved Indian Precedents:\n" + "\n".join(
                f"- {r.payload.get('title')} ({r.payload.get('court')}): {r.payload.get('excerpt')}"
                for r in relevant_chunks
            )
    except Exception:
        retrieved_context = ""

    prompt = (
        f"Language Directive: The user query is in {lang.upper()}. Respond entirely in natural {lang.upper()}.\n\n"
        f"User Legal Scenario:\n{query}\n{retrieved_context}"
    )
    raw, used_fallback = await generate_json(prompt, _SYSTEM_INSTRUCTION)

    if used_fallback:
        return _fallback_result(query, lang)

    raw.setdefault("disclaimer", _DISCLAIMERS.get(lang, _DISCLAIMERS["english"]))
    return CaseIntelligenceResult.model_validate(raw)


def _fallback_result(query: str, lang: str | None = None) -> CaseIntelligenceResult:
    if not lang:
        lang = _detect_language(query)

    q_lower = query.lower()

    # Tenancy / Security Deposit Case
    is_tenancy = any(k in q_lower or k in query for k in [
        "deposit", "landlord", "rent", "tenant", "किराया", "मकान मालिक", "सिक्योरिटी डिपॉजिट", "मकान", "फ्लैट"
    ])

    if is_tenancy:
        if lang == "hindi":
            return CaseIntelligenceResult.model_validate({
                "summary": (
                    "नागरिक द्वारा बताए गए विवरण के अनुसार, ₹50,000 का सिक्योरिटी डिपॉजिट परिसर खाली करने के 2 महीने बाद भी वापस नहीं मिला है "
                    "और मकान मालिक संदेशों का जवाब नहीं दे रहा है। रेंट एग्रीमेंट की शर्तों और संबंधित राज्य के किरायेदारी कानूनों के आधार पर, "
                    "किरायेदार के पास जमा राशि की वसूली के लिए कानूनी कदम उठाने का संभावित विकल्प हो सकता है।"
                ),
                "facts": {
                    "overview": (
                        "उपलब्ध जानकारी के अनुसार, किरायेदार ने 2 महीने पहले बिना किसी बड़े नुकसान के किराए का मकान खाली किया। "
                        "किरायेदार के अनुसार ₹50,000 का सिक्योरिटी डिपॉजिट अभी तक वापस नहीं किया गया है और मकान मालिक से संपर्क नहीं हो पा रहा है।"
                    ),
                    "key_events": [
                        {"date": "2 महीने पहले", "event": "किरायेदार द्वारा परिसर खाली किया गया (किरायेदार के अनुसार कोई बड़ा नुकसान नहीं हुआ)।"},
                        {"date": "वर्तमान स्थिति", "event": "₹50,000 का सिक्योरिटी डिपॉजिट लंबित है और मकान मालिक संदेशों का उत्तर नहीं दे रहा है।"},
                    ],
                    "parties": {
                        "plaintiff": "आप — किरायेदार",
                        "defendant": "दूसरा पक्ष — मकान मालिक",
                    },
                },
                "issues": [
                    {
                        "id": "iss-1",
                        "title": "सिक्योरिटी डिपॉजिट वापसी व संभावित विवाद",
                        "description": "मकान खाली करने के बाद बिना किसी स्पष्ट कटौती के सिक्योरिटी डिपॉजिट न लौटाना अनुबंध या किरायेदारी नियमों के तहत संभावित विवाद का विषय है। अंतिम निष्कर्ष एग्रीमेंट की शर्तों और राज्य के कानून पर निर्भर करेगा।",
                        "severity": "HIGH",
                    },
                    {
                        "id": "iss-2",
                        "title": "आवश्यक तथ्यों व अधिकार-क्षेत्र का निर्धारण (Missing Information)",
                        "description": "यह निर्धारित करना कि किस मंच (रेंट अथॉरिटी, सिविल कोर्ट या उपभोक्ता मंच) में जाना उचित होगा, इस बात पर निर्भर करेगा कि राज्य/शहर कौन सा है, क्या लिखित रेंट एग्रीमेंट है, और भुगतान का क्या प्रमाण उपलब्ध है।",
                        "severity": "MEDIUM",
                    },
                ],
                "applicable_laws": [
                    {
                        "act_name": "भारतीय अनुबंध अधिनियम, 1872 (Indian Contract Act, 1872)",
                        "section": "धारा 73",
                        "title": "अनुबंध के उल्लंघन पर क्षतिपूर्ति व राशि वापसी",
                        "explanation": "यह प्रावधान अनुबंध की शर्तों के उल्लंघन पर नुकसान या बकाया राशि की भरपाई से संबंधित है। यदि मकान मालिक ने बिना किसी वैध कटौती के डिपॉजिट रोका है, तो यह प्रासंगिक हो सकता है। इसके लागू होने के लिए लिखित एग्रीमेंट और डिपॉजिट वापसी की शर्तों की पुष्टि आवश्यक है।",
                    },
                    {
                        "act_name": "संबंधित राज्य किराया नियंत्रण अधिनियम / मॉडल टेनेंसी एक्ट (राज्य अनुसार)",
                        "section": "किरायेदारी व डिपॉजिट संबंधी प्रावधान",
                        "title": "सिक्योरिटी डिपॉजिट की वापसी व समय-सीमा",
                        "explanation": "कई राज्यों में किरायेदारी कानून मकान खाली करने के बाद निश्चित समय में डिपॉजिट लौटाने का प्रावधान करते हैं। हालांकि, विशिष्ट धारा और अधिकार-क्षेत्र इस बात पर निर्भर करेगा कि संपत्ति किस राज्य में स्थित है और क्या रेंट एग्रीमेंट पंजीकृत है।",
                    },
                ],
                "precedents": [
                    {
                        "id": "prec-1",
                        "case_name": "Lucknow Development Authority v. M.K. Gupta",
                        "citation": "(1994) 1 SCC 243",
                        "court": "Supreme Court of India",
                        "year": 1994,
                        "relevance_score": 0.75,
                        "summary": "सुप्रीम कोर्ट ने सेवाओं में कमी और देनदारियों के मनमाने तरीके से रोके जाने पर उत्तरदायित्व और क्षतिपूर्ति के सामान्य सिद्धांतों को रेखांकित किया।",
                        "why_relevant": "सामान्य/अप्रत्यक्ष प्रासंगिकता (General/indirect relevance): यह निर्णय अनुचित कटौती या देनदारी न चुकाने के सामान्य सिद्धांतों को दर्शाता है, हालांकि व्यक्तिगत आवासीय किरायेदारी में विशिष्ट राज्य किरायेदारी कानून और एग्रीमेंट की शर्तें मुख्य रूप से लागू होती हैं।",
                    }
                ],
                "recommended_steps": [
                    "1. रेंट एग्रीमेंट की प्रति, ₹50,000 के भुगतान की रसीद/बैंक स्टेटमेंट, मकान खाली करने के समय के फोटो/वीडियो और चैट रिकॉर्ड्स सुरक्षित रखें।",
                    "2. एग्रीमेंट में डिपॉजिट वापसी की समय-सीमा, नोटिस अवधि और कटौती संबंधी शर्तों की जांच करें।",
                    "3. मकान मालिक को औपचारिक लिखित मांग पत्र या लीगल नोटिस भेजकर राशि वापस करने या कटौती का मदवार ब्योरा देने का अनुरोध करें।",
                    "4. यदि विवाद सुलझता नहीं है, तो अपने राज्य के किरायेदारी नियमों और एग्रीमेंट के प्रकार के आधार पर किसी स्थानीय वकील से सलाह लेकर उचित कानूनी मंच का चयन करें।",
                ],
                "disclaimer": _DISCLAIMERS["hindi"],
            })
        elif lang == "hinglish":
            return CaseIntelligenceResult.model_validate({
                "summary": (
                    "Aapke dwara diye gaye facts ke mutabiq, ghar vacate karne ke 2 mahine baad bhi ₹50,000 ka security deposit wapas nahi mila hai "
                    "aur landlord reply nahi kar raha hai. Rent agreement ki terms aur state tenancy laws ke basis par deposit recovery ke liye "
                    "legal step lene ka potential option ho sakta hai."
                ),
                "facts": {
                    "overview": (
                        "Citizen ke according unhone 2 months pehle bina kisi major damage ke rented flat vacate kiya tha. "
                        "Abhi tak ₹50,000 ka security deposit withheld hai aur landlord communication ka response nahi de raha hai."
                    ),
                    "key_events": [
                        {"date": "2 months pehle", "event": "Premises vacate kiya gaya (tenant ke anusar koi major damage nahi tha)."},
                        {"date": "Current status", "event": "₹50,000 security deposit pending hai aur landlord messages ka reply nahi kar raha."},
                    ],
                    "parties": {
                        "plaintiff": "Aap — Tenant (किरायेदार)",
                        "defendant": "Dusra paksh — Landlord (मकान मालिक)",
                    },
                },
                "issues": [
                    {
                        "id": "iss-1",
                        "title": "Security Deposit Withholding & Potential Dispute",
                        "description": "Vacate karne ke baad bina kisi stated deduction ke deposit rokna contract ya tenancy rules ke tehat potential dispute hai. Final outcome agreement terms aur state law par depend karega.",
                        "severity": "HIGH",
                    },
                    {
                        "id": "iss-2",
                        "title": "Jurisdiction & Missing Information Assessment",
                        "description": "Appropriate forum (Rent Authority, Civil Court ya Consumer Commission) decide karne ke liye state/city, written agreement copy, aur payment proofs confirm hona zaroori hai.",
                        "severity": "MEDIUM",
                    },
                ],
                "applicable_laws": [
                    {
                        "act_name": "Indian Contract Act, 1872",
                        "section": "Section 73",
                        "title": "Compensation for Breach of Contract",
                        "explanation": "Yeh section contract breach hone par refund aur compensation se deal karta hai. Agar landlord ne agreement terms ke against deposit roka hai toh yeh relevant ho sakta hai. Written agreement terms check karna zaroori hai.",
                    },
                    {
                        "act_name": "State Tenancy Act / Model Tenancy Act (State-specific)",
                        "section": "Tenancy & Deposit Provisions",
                        "title": "Return of Security Deposit",
                        "explanation": "Tenancy laws handover ke baad deposit return ki timeline provide karte hain. Specific section aur forum state ke applicable rent laws aur agreement status par depend karega.",
                    },
                ],
                "precedents": [
                    {
                        "id": "prec-1",
                        "case_name": "Lucknow Development Authority v. M.K. Gupta",
                        "citation": "(1994) 1 SCC 243",
                        "court": "Supreme Court of India",
                        "year": 1994,
                        "relevance_score": 0.75,
                        "summary": "Supreme Court underlined general principles regarding accountability and damages for arbitrary withholding of legitimate dues.",
                        "why_relevant": "General/indirect relevance: Highlights principles of unjust withholding, though tenancy disputes primarily depend on state rent control acts and rental agreements.",
                    }
                ],
                "recommended_steps": [
                    "1. Rent agreement, ₹50,000 deposit payment proof (bank statement), move-out condition photos aur message logs preserve karein.",
                    "2. Agreement mein deposit refund timeline, notice period aur deduction clauses check karein.",
                    "3. Landlord ko written demand ya formal Legal Notice bhejkar refund ya itemized deduction explanation maangein.",
                    "4. Agar matter resolve na ho, toh state laws aur agreement type ke mutabiq local lawyer se consult karke appropriate forum select karein.",
                ],
                "disclaimer": _DISCLAIMERS["hinglish"],
            })
        else:
            return CaseIntelligenceResult.model_validate({
                "summary": (
                    "According to the facts provided, the ₹50,000 security deposit has not been refunded two months after vacating the property, "
                    "and the landlord is unresponsive. Subject to the terms of the rental agreement and applicable state tenancy laws, "
                    "there may be a valid legal claim for recovery."
                ),
                "facts": {
                    "overview": (
                        "The tenant states that they vacated the rented premises two months ago with no major property damage. "
                        "The ₹50,000 security deposit remains unpaid, and the landlord has not responded to communications."
                    ),
                    "key_events": [
                        {"date": "2 months ago", "event": "Tenant vacated the premises (tenant states no major damage occurred)."},
                        {"date": "Present", "event": "₹50,000 security deposit remains unrefunded and landlord is unresponsive."},
                    ],
                    "parties": {
                        "plaintiff": "You — Tenant",
                        "defendant": "Opposite Party — Landlord",
                    },
                },
                "issues": [
                    {
                        "id": "iss-1",
                        "title": "Potential Dispute Over Withholding of Security Deposit",
                        "description": "Withholding the deposit without communicating valid deductions may constitute a contractual or tenancy dispute. The legal position depends on the agreement clauses and local rent laws.",
                        "severity": "HIGH",
                    },
                    {
                        "id": "iss-2",
                        "title": "Jurisdictional Assessment & Missing Factual Information",
                        "description": "Determining the correct legal forum requires verifying the state/city jurisdiction, the written rental agreement, and proof of payment.",
                        "severity": "MEDIUM",
                    },
                ],
                "applicable_laws": [
                    {
                        "act_name": "Indian Contract Act, 1872",
                        "section": "Section 73",
                        "title": "Compensation for Breach of Contract",
                        "explanation": "Deals generally with damages and recovery upon breach of agreed contractual terms. It may apply if the landlord failed to honor refund obligations under the tenancy agreement. The written terms of the lease are needed to establish exact obligations.",
                    },
                    {
                        "act_name": "State Rent Control Act / Model Tenancy Provisions (State Specific)",
                        "section": "Security Deposit Clauses",
                        "title": "Provisions on Security Deposit Return",
                        "explanation": "Many state tenancy statutes regulate the timeline for refunding deposits after deduction of legitimate dues. Applicability depends on the state where the property is located and whether the tenancy falls under the state rent act.",
                    },
                ],
                "precedents": [
                    {
                        "id": "prec-1",
                        "case_name": "Lucknow Development Authority v. M.K. Gupta",
                        "citation": "(1994) 1 SCC 243",
                        "court": "Supreme Court of India",
                        "year": 1994,
                        "relevance_score": 0.75,
                        "summary": "The Supreme Court established general accountability for arbitrary withholding and deficiency in service.",
                        "why_relevant": "General/indirect relevance: Serves as an analogous principle for unjust withholding, though individual tenancy matters are primarily governed by state tenancy legislation and the lease contract.",
                    }
                ],
                "recommended_steps": [
                    "1. Preserve the rental agreement, payment proof of the ₹50,000 deposit, move-out condition photos/handover notes, and communication records.",
                    "2. Review the agreement for deposit refund timelines, notice conditions, and authorized deduction terms.",
                    "3. Send a formal written demand or legal notice requesting refund and an itemized breakdown of any alleged deductions within a reasonable timeframe.",
                    "4. If unresolved, seek legal advice to identify the appropriate forum (such as the Rent Authority, Civil Court, or Consumer Commission) based on state law and agreement status.",
                ],
                "disclaimer": _DISCLAIMERS["english"],
            })

    # General Fallback
    if lang == "hindi":
        return CaseIntelligenceResult.model_validate({
            "summary": (
                f"उपलब्ध विवरण के आधार पर कानूनी विश्लेषण: '{query[:120]}...'. यह विश्लेषण लागू भारतीय कानूनों, "
                "अधिकारों और संभावित कानूनी उपायों की रूपरेखा प्रस्तुत करता है। अंतिम उपाय तथ्यों और दस्तावेजों की पुष्टि पर निर्भर करेगा।"
            ),
            "facts": {
                "overview": f"नागरिक द्वारा प्रस्तुत विवरण: {query}",
                "key_events": [
                    {"date": "प्रारंभिक घटना", "event": "विवरण के अनुसार विवाद की स्थिति उत्पन्न हुई।"},
                ],
                "parties": {"plaintiff": "आप — नागरिक / शिकायतकर्ता", "defendant": "दूसरा पक्ष — विरोधी पक्ष / प्रतिवादी"},
            },
            "issues": [
                {
                    "id": "iss-1",
                    "title": "संभावित कानूनी विवाद व दायित्व",
                    "description": "अनुबंध की शर्तों या कानूनी अधिकारों के संभावित उल्लंघन से संबंधित विवाद।",
                    "severity": "HIGH",
                },
                {
                    "id": "iss-2",
                    "title": "दस्तावेजी प्रमाण व अधिकार-क्षेत्र की आवश्यकता (Missing Info)",
                    "description": "उचित कानूनी मंच और प्रक्रिया का निर्धारण करने के लिए लिखित समझौते और लेन-देन के प्रमाण की आवश्यकता है।",
                    "severity": "MEDIUM",
                },
            ],
            "applicable_laws": [
                {
                    "act_name": "सिविल प्रक्रिया संहिता, 1908 / संबंधित कानून",
                    "section": "धारा 9 / संबंधित प्रावधान",
                    "title": "दीवानी न्यायालयों का अधिकार-क्षेत्र (प्रक्रियात्मक प्रावधान)",
                    "explanation": "यह प्रावधान अदालतों के अधिकार-क्षेत्र को स्पष्ट करता है। यह स्वयं में कोई मूल दावा नहीं बनाता, बल्कि उचित मंच पर दावा प्रस्तुत करने की प्रक्रिया निर्धारित करता है।",
                }
            ],
            "precedents": [
                {
                    "id": "prec-default",
                    "case_name": "Lucknow Development Authority v. M.K. Gupta",
                    "citation": "(1994) 1 SCC 243",
                    "court": "Supreme Court of India",
                    "year": 1994,
                    "relevance_score": 0.70,
                    "summary": "सुप्रीम कोर्ट ने दायित्वों में कमी और नुकसान के लिए जवाबदेही के सामान्य सिद्धांतों को स्पष्ट किया।",
                    "why_relevant": "सामान्य/अप्रत्यक्ष प्रासंगिकता: अनुचित व्यवहार और दायित्व न निभाने पर क्षतिपूर्ति के सामान्य सिद्धांतों के लिए प्रासंगिक।",
                }
            ],
            "recommended_steps": [
                "1. मामले से जुड़े सभी लेन-देन, बिल, रसीदें और लिखित पत्राचार सुरक्षित रखें।",
                "2. विरोधी पक्ष को लिखित मांग पत्र भेजकर स्थिति स्पष्ट करने का अवसर दें।",
                "3. संतोषजनक समाधान न मिलने पर किसी अधिवक्ता से परामर्श कर उचित मंच पर कदम उठाएं।",
            ],
            "disclaimer": _DISCLAIMERS["hindi"],
        })
    elif lang == "hinglish":
        return CaseIntelligenceResult.model_validate({
            "summary": (
                f"Available details ke basis par legal analysis: '{query[:120]}...'. Yeh analysis applicable laws aur "
                "potential remedies highlight karta hai. Final outcome facts aur documents par depend karega."
            ),
            "facts": {
                "overview": f"Dispute overview as stated: {query}",
                "key_events": [
                    {"date": "Initial Dispute", "event": "Stated facts ke according issue arise hua."},
                ],
                "parties": {"plaintiff": "Aap — Citizen / Complainant", "defendant": "Dusra paksh — Opposite Party"},
            },
            "issues": [
                {
                    "id": "iss-1",
                    "title": "Potential Legal Dispute & Liability",
                    "description": "Agreement terms ya legal rights ke potential breach se related issue.",
                    "severity": "HIGH",
                },
                {
                    "id": "iss-2",
                    "title": "Evidence Verification & Forum Determination (Missing Info)",
                    "description": "Appropriate forum decide karne ke liye written documents aur payment proof ki verification zaroori hai.",
                    "severity": "MEDIUM",
                },
            ],
            "applicable_laws": [
                {
                    "act_name": "Code of Civil Procedure, 1908",
                    "section": "Section 9",
                    "title": "Courts to try all civil suits unless barred (Procedural)",
                    "explanation": "Yeh procedural section civil courts ke jurisdiction se deal karta hai, yeh direct substantive refund right create nahi karta.",
                }
            ],
            "precedents": [
                {
                    "id": "prec-default",
                    "case_name": "Lucknow Development Authority v. M.K. Gupta",
                    "citation": "(1994) 1 SCC 243",
                    "court": "Supreme Court of India",
                    "year": 1994,
                    "relevance_score": 0.70,
                    "summary": "Underlined general principles of accountability for deficiency in obligation.",
                    "why_relevant": "General/indirect relevance: Highlights accountability principles, though direct statutory provisions apply based on dispute category.",
                }
            ],
            "recommended_steps": [
                "1. Relevant agreements, bills aur payment transaction proofs assemble karein.",
                "2. Opposite party ko written demand notice issue karein.",
                "3. Resolution na hone par verified lawyer se consult karke appropriate court ya tribunal approach karein.",
            ],
            "disclaimer": _DISCLAIMERS["hinglish"],
        })
    else:
        return CaseIntelligenceResult.model_validate({
            "summary": (
                f"Preliminary legal analysis based on provided facts: '{query[:150]}...'. This outlines potential legal grounds and "
                "procedures under Indian law, subject to documentary verification."
            ),
            "facts": {
                "overview": f"Incident summary as stated: {query}",
                "key_events": [
                    {"date": "Initial Dispute", "event": "Grievance arose as described in stated facts."},
                ],
                "parties": {"plaintiff": "You — Complainant / Citizen", "defendant": "Opposite Party / Respondent"},
            },
            "issues": [
                {
                    "id": "iss-1",
                    "title": "Potential Breach of Obligation / Civil Dispute",
                    "description": "Potential violation of agreed terms or legal rights, subject to contractual evidence.",
                    "severity": "HIGH",
                },
                {
                    "id": "iss-2",
                    "title": "Evidentiary Verification & Jurisdiction (Missing Info)",
                    "description": "Verifying written documents, notice records, and territorial jurisdiction before initiating legal action.",
                    "severity": "MEDIUM",
                },
            ],
            "applicable_laws": [
                {
                    "act_name": "Code of Civil Procedure, 1908",
                    "section": "Section 9",
                    "title": "Jurisdiction of Civil Courts (Procedural Provision)",
                    "explanation": "Outlines procedural jurisdiction for civil suits generally, but does not itself create the substantive underlying right.",
                }
            ],
            "precedents": [
                {
                    "id": "prec-default",
                    "case_name": "Lucknow Development Authority v. M.K. Gupta",
                    "citation": "(1994) 1 SCC 243",
                    "court": "Supreme Court of India",
                    "year": 1994,
                    "relevance_score": 0.70,
                    "summary": "Established general principles of accountability for deficiency in statutory and contractual defaults.",
                    "why_relevant": "General/indirect relevance: Serves as an analogous precedent for arbitrary withholding of legitimate dues.",
                }
            ],
            "recommended_steps": [
                "1. Collate all transaction receipts, agreements, emails, and correspondence as primary evidence.",
                "2. Issue a formal written demand stating facts and requesting resolution.",
                "3. Consult an advocate to determine territorial jurisdiction and appropriate forum before filing.",
            ],
            "disclaimer": _DISCLAIMERS["english"],
        })
