"""
Conversational Legal Assistant service with streaming (SSE) support.
"""
import asyncio
import json
import uuid
from typing import AsyncGenerator

from app.ai.llm_client import generate_json
from app.ai import qdrant_client
from app.ai.embeddings import embed_text
from app.schemas.chat import ChatMessageResponse

_CHAT_SYSTEM_INSTRUCTION = """You are LegalAI Citizen Assistant, an empathetic and highly knowledgeable legal problem solver for Indian citizens.

Core Guidelines:
1. MULTILINGUAL & STYLE ADAPTATION: Automatically detect and respond in the EXACT same language and style as the user's query:
   - English query -> Clear, plain English response.
   - Hindi (Devanagari) query -> Natural, easy-to-understand Hindi response (हिंदी).
   - Hinglish query -> Conversational, natural Hinglish response (mix of Hindi & English in Roman script).
   - Other Indian languages (Tamil, Telugu, Bengali, Marathi, etc.) -> Respond in the user's regional language.
   - Do NOT convert Hinglish into overly formal pure Hindi or pure English.

2. SIMPLE CITIZEN-FRIENDLY LANGUAGE:
   - Use everyday conversational words; strictly avoid dense courtroom legalese.
   - If a technical legal term is necessary (e.g. 'anticipatory bail', 'surety', 'injunction'), define it immediately in one simple sentence.
   - Format with concise bullet points and short paragraphs.

3. STRUCTURED ACTIONABLE GUIDANCE:
   - Simple Explanation: What the law/situation means for the citizen.
   - Your Legal Rights & Applicable Laws: Relevant Sections from Bharatiya Nyaya Sanhita (BNS) / IPC, BNSS / CrPC, CPC, Consumer Protection Act, etc.
   - Practical Next Steps: Clear, sequential steps the citizen should take right now.

4. ACCURACY: Ground claims in Indian statutes and landmark Supreme Court decisions. Never fabricate citations or guarantee outcomes.

Return JSON in this exact format:
{"text": "Markdown-formatted explanation with clear headings and bullet points in the user's language/style", "citations": ["Indian Statute/Case 1", "Indian Statute/Case 2"]}"""


def _detect_language(text: str) -> str:
    # Check for Devanagari script (Hindi)
    if any("\u0900" <= ch <= "\u097f" for ch in text):
        return "hindi"
    # Check for Hinglish markers
    hinglish_markers = {
        "kya", "hai", "kaise", "mujhe", "mera", "meri", "mere", "batao",
        "nahi", "kare", "karna", "milega", "milti", "milta", "paise", "kab",
        "kyu", "hota", "hoti", "hote", "chahiye", "dena", "le", "sakta",
        "sakti", "raha", "rahi", "bolo", "bataiye", "bhai", "sir"
    }
    words = set(text.lower().replace("?", "").replace(",", "").replace(".", "").split())
    if len(words & hinglish_markers) >= 2 or (len(words & hinglish_markers) >= 1 and len(words) <= 5):
        return "hinglish"
    return "english"


def _generate_fallback_text(message: str) -> tuple[str, list[str]]:
    lang = _detect_language(message)
    msg_lower = message.lower()

    # Bail Scenario
    if "bail" in msg_lower or "जमानत" in message or "बेल" in message:
        if lang == "hindi":
            citations = ["Bharatiya Nagarik Suraksha Sanhita (BNSS), Sec. 480-483", "Code of Criminal Procedure, 1973, Sec. 436-439", "Supreme Court of India: Satender Kumar Antil v. CBI (2022)"]
            text = (
                "### बेल (जमानत) का सरल अर्थ\n\n"
                "**बेल (Bail)** का मतलब है किसी गिरफ्तार व्यक्ति को अदालत की शर्तों पर अस्थाई रूप से जेल से रिहा करना, "
                "ताकि वह बाहर रहकर अपने केस की पैरवी कर सके।\n\n"
                "### जमानत के मुख्य प्रकार (भारतीय कानून)\n"
                "- **जमानती अपराध (Bailable Offence)**: इसमें जमानत पाना आपका कानूनी अधिकार है।\n"
                "- **गैर-जमानती अपराध (Non-Bailable Offence)**: इसमें जमानत देना अदालत के विवेक (Discretion) पर निर्भर करता है।\n"
                "- **अग्रिम जमानत (Anticipatory Bail)**: अगर गिरफ्तारी की आशंका हो, तो गिरफ्तारी से पहले ही सत्र न्यायालय (Sessions Court) या हाई कोर्ट से ली जाती है।\n\n"
                "### आपके लिए जरूरी कानूनी कदम\n"
                "1. **वकील से संपर्क करें**: किसी क्रिमिनल लॉयर से तुरंत सलाह लें।\n"
                "2. **जमानत याचिका (Bail Application)**: संबंधित मजिस्ट्रेट या सेशन कोर्ट में अर्जी लगाएं।\n"
                "3. **जमानतदार (Surety)**: आवश्यक पहचान पत्र, पते का प्रमाण और मुचलका (Bail Bond) तैयार रखें।"
            )
            return text, citations
        elif lang == "hinglish":
            citations = ["Bharatiya Nagarik Suraksha Sanhita (BNSS), Sec. 480-483", "Code of Criminal Procedure, 1973, Sec. 436-439", "Supreme Court of India: Satender Kumar Antil v. CBI (2022)"]
            text = (
                "### Bail (जमानत) ka Simple Meaning\n\n"
                "**Bail** ka simple matlab hai police ya court custody se temporary release milna. "
                "Court aapko is shart par release karti hai ki aap har date par court aayenge aur investigation mein cooperate karenge.\n\n"
                "### Bail kab aur kaise milti hai?\n"
                "- **Bailable Offence (हल्के अपराध)**: Isme bail lena aapka kanooni haq hota hai, jo police station ya court se turant mil sakti hai.\n"
                "- **Non-Bailable Offence (गंभीर अपराध)**: Isme bail Magistrate ya Sessions Judge case ke facts dekh kar grant karte hain.\n"
                "- **Anticipatory Bail (Arrest se pehle)**: Agar lagta hai ki koi jhootha case bana sakta hai, toh arrest hone se pehle Sessions/High Court se advance bail le sakte hain.\n\n"
                "### Next Action Steps\n"
                "1. Ek verified advocate se consult karke case details discuss karein.\n"
                "2. Competent court mein Bail Application file karein.\n"
                "3. Ek local surety (zamanatdar) aur address/ID proofs ready rakhein."
            )
            return text, citations
        else:
            citations = ["Bharatiya Nagarik Suraksha Sanhita (BNSS), Sec. 480-483", "Code of Criminal Procedure, 1973, Sec. 436-439", "Satender Kumar Antil v. CBI, (2022) 10 SCC 51"]
            text = (
                "### What Bail Means in Simple Language\n\n"
                "**Bail** is a legal process that allows an arrested person to be released from custody while their case is being tried. "
                "It ensures that a person does not have to stay in jail before being proven guilty, provided they promise to attend all court hearings.\n\n"
                "### Types of Bail Under Indian Law\n"
                "- **Bailable Offence**: Bail is a matter of right and can be granted at the police station or magistrate court.\n"
                "- **Non-Bailable Offence**: The judge decides whether to grant bail based on the seriousness of the allegations.\n"
                "- **Anticipatory Bail (Sec 438 CrPC / Sec 482 BNSS)**: Applied before arrest if you apprehend arrest in a false or non-bailable case.\n\n"
                "### Practical Action Steps\n"
                "1. **Engage an Advocate**: Consult a criminal defense lawyer immediately.\n"
                "2. **File Bail Application**: Submit application before the jurisdictional Magistrate or Sessions Court.\n"
                "3. **Prepare Surety & Documents**: Keep address proof, ID, and a local surety ready for the bail bond."
            )
            return text, citations

    # Tenancy / Security Deposit Scenario
    if "landlord" in msg_lower or "deposit" in msg_lower or "rent" in msg_lower or "किराया" in message or "मकान" in message:
        if lang == "hindi":
            citations = ["Model Tenancy Act / State Rent Control Act", "Indian Contract Act, 1872, Sec. 73", "Consumer Protection Act, 2019"]
            text = (
                "### सिक्योरिटी डिपॉजिट न लौटने पर आपके कानूनी अधिकार\n\n"
                "मकान खाली करने और सभी बिल चुकता करने के बाद मकान मालिक (Landlord) के लिए आपकी सिक्योरिटी राशि लौटाना कानूनी रूप से अनिवार्य है।\n\n"
                "### लागू होने वाले भारतीय कानून\n"
                "- **भारतीय अनुबंध अधिनियम, 1872 (धारा 73)**: रेंट एग्रीमेंट की शर्तों का उल्लंघन।\n"
                "- **रेंट कंट्रोल / किरायेदारी कानून**: बिना उचित कारण डिपॉजिट रोकना गैर-कानूनी है।\n\n"
                "### तुरंत उठाए जाने वाले कदम\n"
                "1. **लिखित लीगल नोटिस भेजें**: 15 दिन के अंदर पैसे वापस करने की मांग का औपचारिक नोटिस रजिस्टर्ड पोस्ट/ईमेल से भेजें।\n"
                "2. **रेंट अथॉरिटी या उपभोक्ता अदालत (Consumer Forum) जाएं**: यदि नोटिस के बाद भी पैसा न मिले, तो रेंट अथॉरिटी में शिकायत दर्ज करें।"
            )
            return text, citations
        elif lang == "hinglish":
            citations = ["Model Tenancy Act / State Rent Control Act", "Indian Contract Act, 1872, Sec. 73", "Consumer Protection Act, 2019"]
            text = (
                "### Security Deposit Refund na milne par kya karein?\n\n"
                "Rent agreement ke mutabiq flat khali karne aur utility dues clear hone ke baad landlord ko deposit lautana mandatory hota hai.\n\n"
                "### Applicable Legal Remedies\n"
                "- **Indian Contract Act, 1872 (Section 73)**: Agreement breach hone par refund aur compensation claim kiya ja sakta hai.\n"
                "- **Consumer Protection Act / Rent Authority**: Service deficiency ya unfair trade practice ke tehat complaint.\n\n"
                "### Action Steps\n"
                "1. **Formal Legal Notice**: Advocate ke zariye 15 din ka demand legal notice send karein.\n"
                "2. **Proof Collection**: Rent agreement, deposit payment receipts, aur WhatsApp/email chats save karein.\n"
                "3. **File Complaint**: Rent Tribunal ya Consumer Forum mein claim file karein."
            )
            return text, citations
        else:
            citations = ["Model Tenancy Act / State Rent Control Act", "Indian Contract Act, 1872, Sec. 73", "Consumer Protection Act, 2019, Sec. 35"]
            text = (
                "### What You Can Do If Your Landlord Withholds Your Security Deposit\n\n"
                "Upon vacating the premises and settling outstanding utility charges, the landlord is legally obligated to refund the security deposit as stipulated in the rental agreement.\n\n"
                "### Applicable Indian Laws\n"
                "- **Indian Contract Act, 1872 (Section 73)**: Right to claim refund and damages for breach of agreement terms.\n"
                "- **State Rent Control Act / Model Tenancy Act**: Prohibits unlawful withholding of tenant deposits.\n"
                "- **Consumer Protection Act, 2019**: Applicable if services were provided via an organized housing/pg management service.\n\n"
                "### Practical Next Steps\n"
                "1. **Send a Formal Legal Notice**: Demand refund within 15 days via registered post/email.\n"
                "2. **Preserve All Evidence**: Keep rent agreement, rent receipts, move-out photos, and communication history.\n"
                "3. **File a Recovery Dispute**: Approach the local Rent Authority or District Civil Court / Consumer Forum."
            )
            return text, citations

    # General Citizen Guidance
    if lang == "hindi":
        citations = ["Constitution of India, Art. 226", "Code of Civil Procedure, 1908, Sec. 9", "Consumer Protection Act, 2019, Sec. 35"]
        text = (
            f"### आपके प्रश्न का कानूनी मार्गदर्शन\n\n"
            f"आपके द्वारा पूछे गए विषय पर भारतीय कानून के अनुसार आपके पास स्पष्ट कानूनी उपाय उपलब्ध हैं।\n\n"
            "### मुख्य कानूनी प्रावधान\n"
            "- **नागरिक अधिकार**: दीवानी विवाद, अनुबंध या संपत्ति से जुड़े मामलों में सिविल कोर्ट में उपचार उपलब्ध है।\n"
            "- **उपभोक्ता निवारण**: सेवाओं या उत्पादों में कमी के लिए उपभोक्ता आयोग (Consumer Commission) में शिकायत की जा सकती है।\n\n"
            "### व्यावहारिक कदम\n"
            "1. अपने सभी संबंधित दस्तावेज और सबूत एकत्र करें।\n"
            "2. विरोधी पक्ष को लिखित मांग पत्र (Notice) भेजें।\n"
            "3. उचित न्यायालय या न्यायाधिकरण में याचिका दर्ज करें।"
        )
        return text, citations
    elif lang == "hinglish":
        citations = ["Constitution of India, Art. 226", "Code of Civil Procedure, 1908, Sec. 9", "Consumer Protection Act, 2019, Sec. 35"]
        text = (
            f"### Aapke query par Legal Guidance\n\n"
            f"Aapne jo issue pucha hai, Indian Law ke tehat iska proper step-by-step resolution available hai.\n\n"
            "### Main Legal Rights\n"
            "- **Civil & Agreement Issues**: Code of Civil Procedure (CPC) ke under remedies milti hain.\n"
            "- **Consumer Disputes**: Consumer Protection Act 2019 ke tehat refund aur compensation claim kar sakte hain.\n\n"
            "### Practical Action Steps\n"
            "1. Apne saare bills, agreements, aur payment proofs arrange karein.\n"
            "2. Formal statutory notice send karein.\n"
            "3. Agar resolve na ho toh competent court ya consumer commission approach karein."
        )
        return text, citations
    else:
        citations = ["Constitution of India, Art. 226", "Code of Civil Procedure, 1908, Sec. 9", "Consumer Protection Act, 2019, Sec. 35"]
        text = (
            f"### Legal Guidance for Your Query\n\n"
            f"Under Indian Law, remedies for your situation depend on the nature of the dispute and available documentation.\n\n"
            "### Applicable Legal Framework\n"
            "- **Civil / Contractual Remedy**: Remedies under the Code of Civil Procedure (CPC) and Specific Relief Act.\n"
            "- **Consumer Protection**: Recourse before the Consumer Commission under the Consumer Protection Act, 2019 for deficiency of service.\n\n"
            "### Practical Next Steps\n"
            "1. **Consolidate Evidence**: Organize relevant agreements, communication records, and receipts.\n"
            "2. **Issue Demand Notice**: Serve a formal demand notice setting a 15-day timeline for resolution.\n"
            "3. **Approach the Appropriate Forum**: File a petition before the competent court or regulatory body."
        )
        return text, citations


async def answer_query(message: str) -> ChatMessageResponse:
    # Retrieve relevant precedents or statutes from Qdrant
    citations = []
    try:
        query_vector = embed_text(message)
        chunks = await qdrant_client.search(query_vector, limit=3)
        for c in chunks:
            if c.score >= 0.25:
                citations.append(f"{c.payload.get('title', 'Indian Case Law')} ({c.payload.get('citation_number', 'SCC')})")
    except Exception:
        pass

    if not citations:
        citations = [
            "Constitution of India, Art. 226",
            "Code of Civil Procedure, 1908, Sec. 9",
            "Consumer Protection Act, 2019, Sec. 35",
        ]

    prompt = f"User Question:\n{message}\n\nContext Citations:\n" + "\n".join(citations)
    raw, used_fallback = await generate_json(prompt, _CHAT_SYSTEM_INSTRUCTION)

    if not used_fallback and "text" in raw:
        answer_text = raw["text"]
        if "citations" in raw and raw["citations"]:
            citations = raw["citations"]
    else:
        answer_text, fallback_citations = _generate_fallback_text(message)
        if fallback_citations:
            citations = fallback_citations

    return ChatMessageResponse(
        id=str(uuid.uuid4()),
        sender="ai",
        text=answer_text,
        citations=citations,
    )


async def stream_chat_response(message: str) -> AsyncGenerator[str, None]:
    """Generates Server-Sent Events (SSE) chunks for streaming chat."""
    response = await answer_query(message)
    full_text = response.text
    citations_json = json.dumps(response.citations)

    # Yield opening event
    yield f"event: start\ndata: {json.dumps({'id': response.id})}\n\n"

    # Stream text tokens/chunks
    words = full_text.split(" ")
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i : i + 3]) + " "
        yield f"event: chunk\ndata: {json.dumps({'chunk': chunk})}\n\n"
        await asyncio.sleep(0.04)

    # Yield completion with citations
    yield f"event: done\ndata: {json.dumps({'id': response.id, 'citations': response.citations})}\n\n"
