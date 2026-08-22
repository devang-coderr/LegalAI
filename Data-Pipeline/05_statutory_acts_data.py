"""
LegalAI Data Pipeline - Step 5: Indian Statutory Acts & Sections Knowledge Base
Author: Sourabh (Data Engineer) - SIH 2026

This script:
1. Compiles structured Section-by-Section legal knowledge for key Indian Bare Acts:
   - Transfer of Property Act, 1882
   - Indian Contract Act, 1872
   - Code of Civil Procedure, 1908 (CPC)
   - Arbitration and Conciliation Act, 1996
   - Consumer Protection Act, 2019
   - Bharatiya Nyaya Sanhita, 2023 (BNS) / Indian Penal Code
2. Exports clean JSON & CSV files for the SQL Database.
3. Indexes sections into ChromaDB collection ('indian_statutory_acts') for instant AI statutory retrieval.
"""

import os
import json
import pandas as pd
import chromadb
from chromadb.utils import embedding_functions

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
CLEANED_DIR = os.path.join(DATA_DIR, "cleaned")
VECTOR_DB_DIR = os.path.join(BASE_DIR, "vector_store", "chroma_db")

os.makedirs(CLEANED_DIR, exist_ok=True)
os.makedirs(VECTOR_DB_DIR, exist_ok=True)

INDIAN_STATUTORY_ACTS = [
    {
        "id": "ACT-TPA-108M",
        "act_name": "Transfer of Property Act, 1882",
        "section_number": "Section 108(m)",
        "section_title": "Duty of Lessee to Restore Property (Reasonable Wear & Tear)",
        "legal_domain": "Property & Tenancy Law",
        "statutory_text": "The lessee is bound to keep, and on the termination of the lease to restore, the property in as good condition as it was in at the time when he was put in possession, subject only to the changes caused by reasonable wear and tear or irresistible force.",
        "plain_explanation": "A tenant is only responsible for returning the rented property in reasonable condition. Landlords cannot withhold security deposit for routine wear and tear without proving physical damage.",
        "relevant_disputes": "Security deposit forfeiture, landlord tenant disputes, apartment handover."
    },
    {
        "id": "ACT-ICA-73",
        "act_name": "Indian Contract Act, 1872",
        "section_number": "Section 73",
        "section_title": "Compensation for Loss or Damage Caused by Breach of Contract",
        "legal_domain": "Contract Law",
        "statutory_text": "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things.",
        "plain_explanation": "Any party suffering financial loss due to breach of agreement (e.g. non-payment of refund or breach of service terms) can claim compensatory damages.",
        "relevant_disputes": "Contract breach, supplier default, unpaid deposits, service deficiency."
    },
    {
        "id": "ACT-ICA-27",
        "act_name": "Indian Contract Act, 1872",
        "section_number": "Section 27",
        "section_title": "Agreement in Restraint of Trade Void",
        "legal_domain": "Employment & Corporate Law",
        "statutory_text": "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.",
        "plain_explanation": "Post-employment non-compete clauses restricting an employee from joining a competitor are generally void and unenforceable in India under Section 27.",
        "relevant_disputes": "Employment contract non-compete, employee resignation, restraint of trade."
    },
    {
        "id": "ACT-CPC-O9R13",
        "act_name": "Code of Civil Procedure, 1908",
        "section_number": "Order 9 Rule 13",
        "section_title": "Setting Aside Decree Passed Ex-Parte Against Defendant",
        "legal_domain": "Civil Procedure & Litigation",
        "statutory_text": "In any case in which a decree is passed ex parte against a defendant, he may apply to the Court by which the decree was passed for an order to set it aside; and if he satisfies the Court that the summons was not duly served, or that he was prevented by any sufficient cause from appearing, the Court shall make an order setting aside the decree.",
        "plain_explanation": "If a civil court passed a judgment in your absence without proper summons or because you were sick/prevented by genuine reason, you can apply to set aside the order.",
        "relevant_disputes": "Ex-parte decree, missed court hearing date, improper summons service."
    },
    {
        "id": "ACT-ARB-12",
        "act_name": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 12(5)",
        "section_title": "Ineligibility of Arbitrator & Seventh Schedule Bar",
        "legal_domain": "Commercial Arbitration",
        "statutory_text": "Notwithstanding any prior agreement to the contrary, any person whose relationship with the parties or counsel falls under any of the categories specified in the Seventh Schedule shall be ineligible to be appointed as an arbitrator.",
        "plain_explanation": "An employee, advisor, or interested person of a company cannot be appointed as a sole arbitrator to resolve that company's commercial dispute.",
        "relevant_disputes": "Unilateral arbitrator appointment, commercial contract arbitration, arbitrator bias."
    },
    {
        "id": "ACT-CPA-35",
        "act_name": "Consumer Protection Act, 2019",
        "section_number": "Section 35",
        "section_title": "Manner in which Complaint shall be made to District Commission",
        "legal_domain": "Consumer Protection Law",
        "statutory_text": "A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer or any recognized consumer association.",
        "plain_explanation": "A consumer who received defective products or deficient services (e-commerce, airlines, real estate, medical) can directly file a complaint before the District Consumer Commission.",
        "relevant_disputes": "Defective goods, e-commerce refund refusal, medical negligence, builder delay."
    },
    {
        "id": "ACT-BNS-316",
        "act_name": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 316",
        "section_title": "Criminal Breach of Trust (Corresponding to IPC Section 405/406)",
        "legal_domain": "Criminal Law",
        "statutory_text": "Whoever, being in any manner entrusted with property, dishonestly misappropriates or converts to his own use that property, commits criminal breach of trust.",
        "plain_explanation": "Dishonestly misusing or refusing to return money, goods, or assets entrusted to someone in trust or under contract constitutes criminal breach of trust.",
        "relevant_disputes": "Financial fraud, misappropriation of funds, fraudulent asset retention."
    }
]

def build_statutory_knowledge_base():
    print("=" * 60)
    print("Step 5: Indian Statutory Acts Knowledge Base & ChromaDB Indexing")
    print("=" * 60)

    # 1. Export Clean JSON & CSV for Database
    json_path = os.path.join(CLEANED_DIR, "indian_statutory_acts.json")
    csv_path = os.path.join(CLEANED_DIR, "indian_statutory_acts.csv")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(INDIAN_STATUTORY_ACTS, f, indent=2, ensure_ascii=False)

    df_acts = pd.DataFrame(INDIAN_STATUTORY_ACTS)
    df_acts.to_csv(csv_path, index=False, encoding="utf-8")

    print(f" Saved Statutory Datasets:")
    print(f"  📄 JSON: {json_path}")
    print(f"  📊 CSV:  {csv_path}")

    # 2. Index into ChromaDB Vector Store
    print("\n--- Indexing Statutory Sections into ChromaDB ('indian_statutory_acts') ---")
    client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
    
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    collection = client.get_or_create_collection(
        name="indian_statutory_acts",
        embedding_function=embedding_fn,
        metadata={"description": "Indian Statutory Acts and Sections for LegalAI Case Solver"}
    )

    ids = [act["id"] for act in INDIAN_STATUTORY_ACTS]
    documents = [
        f"Act: {act['act_name']}\nSection: {act['section_number']}\nTitle: {act['section_title']}\nDomain: {act['legal_domain']}\nPlain Meaning: {act['plain_explanation']}\nStatute: {act['statutory_text']}\nDisputes: {act['relevant_disputes']}"
        for act in INDIAN_STATUTORY_ACTS
    ]
    metadatas = [
        {
            "id": act["id"],
            "act_name": act["act_name"],
            "section": act["section_number"],
            "title": act["section_title"],
            "domain": act["legal_domain"]
        }
        for act in INDIAN_STATUTORY_ACTS
    ]

    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    print(f" Ingestion complete! Total Statutory Sections in ChromaDB: {collection.count()}")

    # 3. Test Semantic Retrieval for Statutory Sections
    print("\n" + "=" * 60)
    print("--- Testing Semantic Statutory Section Matching ---")
    print("=" * 60)

    test_scenarios = [
        "Company made me sign an agreement saying I cannot join another competitor company after quitting.",
        "Landlord deducting entire deposit for repainting and normal wall marks.",
        "Flight company cancelled ticket and refuses refund."
    ]

    for scenario in test_scenarios:
        print(f"\n🔍 Scenario: '{scenario}'")
        res = collection.query(query_texts=[scenario], n_results=1)
        top_meta = res["metadatas"][0][0]
        print(f"   ⚖️ Matched Act: {top_meta['act_name']}")
        print(f"   📌 Section: {top_meta['section']} - {top_meta['title']}")
        print(f"   🏛️ Domain: {top_meta['domain']}")

    print("\n" + "=" * 60)
    print(" Statutory Acts pipeline and vector collection ready!")
    print("=" * 60)

if __name__ == "__main__":
    build_statutory_knowledge_base()
