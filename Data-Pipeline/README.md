# LegalAI — Data Engineering Pipeline (SIH 2026)
**Author:** Sourabh (Data Engineer)  
**Branch:** `feature/sourabh-data-engineering`

This directory contains the complete data engineering pipeline for LegalAI: downloading Indian court datasets, extracting legal embeddings using Indian Court RoBERTa, and indexing into a persistent ChromaDB vector store for AI/RAG search.

---

## 📁 Directory Layout

```text
Data-Pipeline/
├── requirements.txt                   # Python dependencies
├── 01_download_legal_datasets.py      # Downloads & cleans Indian Supreme Court (ILDC) data
├── 02_load_legal_model_embeddings.py  # Loads MHGanainy/roberta-base-legal-indian-courts
├── 03_build_vector_store.py           # Embeds & stores data into ChromaDB vector database
├── data/
│   ├── raw/                           # Raw downloaded datasets
│   └── cleaned/                       # Standardized CSV & JSON ready for SQL database
└── vector_store/
    └── chroma_db/                     # Persistent Vector Database for RAG
```

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
In your terminal / PowerShell:
```powershell
cd "C:\Users\user\OneDrive\Desktop\SIH2026\LegalAI\Data-Pipeline"
pip install -r requirements.txt
```

### Step 2: Download & Clean Judgments Dataset
```powershell
python 01_download_legal_datasets.py
```
*Output: Generates `data/cleaned/cleaned_judgments.json` and `data/cleaned/cleaned_judgments.csv`.*

### Step 3: Test Legal AI Model (`MHGanainy/roberta-base-legal-indian-courts`)
```powershell
python 02_load_legal_model_embeddings.py
```
*Output: Loads the fine-tuned Indian court model and tests vector dimension output.*

### Step 4: Build ChromaDB Vector Store for RAG Search
```powershell
python 03_build_vector_store.py
```
*Output: Indexes case judgments into ChromaDB and tests semantic search.*

---

## 🤝 Hand-Off to Other Team Members

1. **For Database Member**: Give them `data/cleaned/cleaned_judgments.csv` to seed MySQL / PostgreSQL tables.
2. **For AI/Backend Member**: Give them the `vector_store/chroma_db/` folder to run RAG queries directly against the vector database.
