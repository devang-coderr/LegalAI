"""
LegalAI Data Pipeline - Step 2: Legal AI Model & Embedding Generation
Author: Sourabh (Data Engineer) - SIH 2026

This script demonstrates:
1. Loading the Indian Court Legal AI model (`MHGanainy/roberta-base-legal-indian-courts`)
2. Generating dense legal vector embeddings for legal texts and case facts.
"""

import torch
from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "MHGanainy/roberta-base-legal-indian-courts"

def test_legal_model():
    print("=" * 60)
    print(f"Step 2: Loading Legal AI Model: {MODEL_NAME}")
    print("=" * 60)

    try:
        # 1. Load Tokenizer and Model from Hugging Face
        print("Downloading / Loading tokenizer and model weights...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModel.from_pretrained(MODEL_NAME)
        model.eval()
        print(" Model loaded successfully!")

        # 2. Sample Indian Legal Texts
        sample_queries = [
            "Tenant disputing unlawful withholding of security deposit under Section 108(m) of Transfer of Property Act.",
            "Arbitrator ineligibility under Section 12(5) of Arbitration and Conciliation Act 1996.",
            "Grounds for setting aside ex-parte decree under Order 9 Rule 13 Code of Civil Procedure."
        ]

        print("\n--- Generating Embeddings for Sample Legal Queries ---")
        for i, text in enumerate(sample_queries, 1):
            # Tokenize text
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            
            with torch.no_grad():
                outputs = model(**inputs)
                # Mean pooling to get sentence-level embedding vector
                embeddings = outputs.last_hidden_state.mean(dim=1)

            print(f"\nQuery {i}: {text[:75]}...")
            print(f"  -> Vector Dimension: {embeddings.shape[1]}")
            print(f"  -> First 5 Vector Values: {embeddings[0][:5].tolist()}")

        print("\n Legal embedding pipeline is working properly!")

    except Exception as e:
        print(f"\n Error loading model: {e}")
        print("Tip: Make sure you have installed `pip install transformers torch`.")

if __name__ == "__main__":
    test_legal_model()
