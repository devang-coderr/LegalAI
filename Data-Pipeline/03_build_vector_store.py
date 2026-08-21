"""
LegalAI Data Pipeline - Step 3: Build ChromaDB Vector Database for RAG
Author: Sourabh (Data Engineer) - SIH 2026

This script:
1. Loads cleaned Indian judgments from `data/cleaned/cleaned_judgments.json`
2. Generates embeddings using sentence-transformers
3. Persists them in ChromaDB vector database so the backend can search precedents.
"""

import os
import json
import chromadb
from chromadb.utils import embedding_functions

BASE_DIR = os.path.dirname(__file__)
CLEANED_JSON = os.path.join(BASE_DIR, "data", "cleaned", "cleaned_judgments.json")
VECTOR_DB_DIR = os.path.join(BASE_DIR, "vector_store", "chroma_db")

os.makedirs(VECTOR_DB_DIR, exist_ok=True)

def build_vector_database():
    print("=" * 60)
    print("Step 3: Indexing Legal Data into ChromaDB Vector Store")
    print("=" * 60)

    # 1. Initialize persistent ChromaDB Client
    client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
    
    # 2. Setup Embedding function (SentenceTransformer)
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    # 3. Create or Get Collection
    collection_name = "indian_legal_precedents"
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"description": "Indian Supreme Court Judgments for LegalAI RAG"}
    )

    # 4. Load dataset
    if not os.path.exists(CLEANED_JSON):
        print(f"⚠️ Cleaned dataset not found at {CLEANED_JSON}. Please run `python 01_download_legal_datasets.py` first.")
        return

    with open(CLEANED_JSON, "r", encoding="utf-8") as f:
        cases = json.load(f)

    print(f"Indexing {len(cases)} judgments into vector collection '{collection_name}'...")

    ids = []
    documents = []
    metadatas = []

    for c in cases:
        case_id = c["id"]
        doc_text = f"Case: {c.get('case_name', 'Supreme Court Judgment')}\nCitation: {c.get('citation', '')}\nStatute: {c.get('act_and_section', '')}\nIssue: {c.get('legal_issue', '')}\nRatio Decidendi: {c.get('ratio_decidendi', '')}\nFacts: {c.get('facts', '')}\nFull Text: {c.get('text', '')[:600]}"
        
        ids.append(case_id)
        documents.append(doc_text)
        metadatas.append({
            "id": case_id,
            "case_name": c.get("case_name", "Supreme Court Judgment"),
            "citation": c.get("citation", ""),
            "court": c.get("court", "Supreme Court of India"),
            "year": int(c.get("year", 2020)),
            "act": c.get("act_and_section", "")
        })

    # Upsert into ChromaDB
    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    print(" Ingestion complete! Total items indexed in ChromaDB:", collection.count())

    # 5. Test Semantic Vector Search
    print("\n" + "=" * 60)
    print("--- Testing Semantic Vector Similarity Search ---")
    print("=" * 60)
    
    test_queries = [
        "Landlord refusing to refund security deposit after 30 days notice",
        "Can an ineligible arbitrator appoint or nominate another sole arbitrator?",
        "Grounds to set aside ex-parte decree when defendant was sick on hearing date"
    ]

    for q in test_queries:
        print(f"\n🔍 Search Query: '{q}'")
        results = collection.query(
            query_texts=[q],
            n_results=1
        )
        
        top_meta = results["metadatas"][0][0]
        top_id = results["ids"][0][0]
        top_dist = results["distances"][0][0] if "distances" in results and results["distances"] else 0
        
        print(f"   Top Matched Precedent: {top_meta.get('case_name')} [{top_meta.get('citation')}]")
        print(f"   Court: {top_meta.get('court')} ({top_meta.get('year')})")
        print(f"   Statute: {top_meta.get('act')}")

    print("\n" + "=" * 60)
    print(f" Vector Database saved persistently to:\n {VECTOR_DB_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    build_vector_database()
