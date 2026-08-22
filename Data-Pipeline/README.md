# LegalAI — Data Engineering Pipeline (SIH 2026)
**Author:** Sourabh (Data Engineer)  
**Branch:** `feature/sourabh-data-engineering`

This directory contains the complete end-to-end data engineering pipeline for LegalAI: downloading Indian court datasets, extracting legal embeddings using Indian Court RoBERTa, indexing into ChromaDB vector stores, Document OCR risk analysis, and relational SQL database seeding.

---

## 📁 Directory Layout

```text
Data-Pipeline/
├── requirements.txt                   # Python dependencies
├── 01_download_legal_datasets.py      # Downloads & cleans Indian Supreme Court data
├── 02_load_legal_model_embeddings.py  # Loads MHGanainy/roberta-base-legal-indian-courts
├── 03_build_vector_store.py           # Precedents ChromaDB Vector Database for RAG
├── 04_document_ocr_pipeline.py        # PDF OCR parser & contract clause risk detector
├── 05_statutory_acts_data.py          # Indian Bare Acts dataset & Statutory ChromaDB collection
├── data/
│   ├── raw/                           # Raw downloaded datasets
│   ├── cleaned/                       # Cleaned CSV & JSON datasets (Precedents, Bare Acts)
│   ├── samples/                       # Sample legal agreements & PDF contracts
│   └── ocr_results/                   # Structured JSON output from OCR pipeline
├── database/
│   └── schema_and_seed.sql            # One-click MySQL/PostgreSQL schema & seed script
└── vector_store/
    └── chroma_db/                     # Persistent Vector Database for RAG
```

---

## 🚀 Execution Guide

### Phase 1: Precedents & Vector Store
```powershell
cd "C:\Users\user\OneDrive\Desktop\SIH2026\LegalAI\Data-Pipeline"
pip install -r requirements.txt

# Step 1: Download and clean Indian Supreme Court Judgments
python 01_download_legal_datasets.py

# Step 2: Test Indian Court RoBERTa Legal Embeddings
python 02_load_legal_model_embeddings.py

# Step 3: Build Precedents ChromaDB Vector Store
python 03_build_vector_store.py
```

### Phase 2: Document OCR, Statutory Acts & Database Seed
```powershell
# Step 4: Run Document OCR & Contract Risk Analyzer
python 04_document_ocr_pipeline.py

# Step 5: Generate Indian Bare Acts & Statutory Vector Store
python 05_statutory_acts_data.py
```

---

## 🤝 Hand-Off to Team Members

1. **For Database Member**:
   - Give them [`database/schema_and_seed.sql`](file:///C:/Users/user/OneDrive/Desktop/SIH2026/LegalAI/Data-Pipeline/database/schema_and_seed.sql) to run in MySQL/PostgreSQL.
   - Datasets also available as standalone CSVs: `data/cleaned/cleaned_judgments.csv` and `data/cleaned/indian_statutory_acts.csv`.
2. **For AI & Backend Members**:
   - The persistent vector database is in `vector_store/chroma_db/` containing two collections:
     - `indian_legal_precedents` (For Precedent & Ratio Decidendi retrieval)
     - `indian_statutory_acts` (For Section & Law retrieval)
   - The OCR module in `04_document_ocr_pipeline.py` can be plugged directly into the FastAPI endpoint `POST /api/v1/documents/ocr`.
