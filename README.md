# LegalAI — AI-Powered Enterprise Legal Assistance & Litigation Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_Search-DC2626.svg?style=flat&logo=qdrant)](https://qdrant.tech/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0_Async-D71F00.svg?style=flat&logo=sqlalchemy)](https://www.sqlalchemy.org/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg?style=flat&logo=python)](https://www.python.org/)

---

## 1. Project Overview

**LegalAI** is an advanced AI-powered legal assistance and practice management platform engineered specifically for the Indian legal ecosystem. The platform bridges the divide between citizens seeking accessible legal support and practicing advocates managing active litigation pipelines.

Operating on a high-integrity **dual-workspace architecture**, LegalAI delivers:
1. **Citizen Workspace**: Simplifies complex legal notices, provides plain-language bilingual legal guidance, assesses financial aid / pro-bono eligibility, and matches citizens with verified advocates.
2. **Lawyer Professional Workspace**: Provides enterprise litigation management, multi-tier OCR document parsing, multi-query case intelligence, chronological timeline reconstruction, court hearing calendar management, and grounded semantic legal research across Indian jurisprudence.

The platform is built on an **offline-resilient, grounded AI philosophy**: every vector search and LLM extraction layer utilizes deterministic fallback mechanisms and strict citation constraints to eliminate hallucinations.

---

## 2. Problem Statement & Context

The Indian judicial system faces systemic challenges:
* **Massive Case Backlog**: Over 45+ million cases pending across District Courts, High Courts, and the Supreme Court.
* **Information Asymmetry**: Complex statutory legal language (IPC, CrPC, BNS, CPC) and procedural hurdles prevent citizens from understanding their rights or assessing legal risk.
* **Manual Practice Overhead for Advocates**: Advocates spend 40%+ of their working hours manually reviewing physical briefs, indexing dates/clauses, searching case law ratios, and tracking fragmented hearing dates.
* **Lack of Accessible Legal Aid**: Eligible citizens often fail to navigate Legal Services Authorities Act provisions due to lack of transparent legal triage.

**LegalAI** addresses these core issues by automating structured document parsing, synthesizing litigation intelligence, and democratizing access to verified legal knowledge.

---

## 3. Dual-Workspace Architecture

```
                                  ┌───────────────────────────┐
                                  │      LegalAI Platform     │
                                  └─────────────┬─────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │      Citizen Workspace      │                   │  Lawyer Professional Portal │
        ├─────────────────────────────┤                   ├─────────────────────────────┤
        │ • Document Vault & Simplifier │                 │ • Active Case Management    │
        │ • Plain-Language Advice     │                   │ • Case Intelligence Synthesizer │
        │ • Pro-Bono Aid Assessment   │                   │ • Grounded Legal Research   │
        │ • Advocate Matching Engine  │                   │ • AI Document Intelligence  │
        │ • Case Status & Timeline    │                   │ • Court Hearing Calendar    │
        │ • Secure Document Vault     │                   │ • Client & Request Manager  │
        └─────────────────────────────┘                   └─────────────────────────────┘
```

---

## 4. Key Features & Modules

### A. Citizen Workspace
* **Document Vault & Simplifier**: Upload legal notices, rent agreements, or summons (PDF/images) to receive structured, plain-language summaries and risk breakdowns.
* **Legal Triage & AI Chat**: Conversational interface to understand procedural rights under Indian law.
* **Financial Aid Eligibility**: Automated questionnaire evaluating criteria under the Legal Services Authorities Act, 1987.
* **Advocate Matchmaker**: Multi-attribute filtering (specialization, jurisdiction, language, court tier) to connect with verified lawyers.
* **Request & Timeline Tracking**: Real-time tracking of sent legal requests, active cases, and key procedural milestones.

### B. Lawyer Professional Workspace
* **Litigation Command Center**: Unified dashboard tracking active cases, pending citizen requests, upcoming court hearings, and unread notifications.
* **Case Intelligence**: Deep synthesized analysis for every case:
  * **Case Facts**: Core material facts chronologically organized.
  * **Statutory Provisions**: Directly applicable statutory sections with legal implications.
  * **Judicial Precedents**: Landmark Supreme Court and High Court judgments with relevant ratio decidendi.
  * **Procedural Risks & Mitigations**: Potential evidentiary gaps, procedural pitfalls, and strategic counter-arguments.
* **Legal Research Engine**: Single unified legal research terminal powered by Qdrant dense vector search over Indian statutes (IPC, CrPC, BNS, CPC, Indian Contract Act) and binding case law ratios.
* **AI Document Intelligence**:
  * **Multi-Tier OCR**: High-speed native digital PDF parsing with automatic fallback to Tesseract computer-vision OCR.
  * **Deep Analysis**: Extracts parties, key dates, financial amounts, important clauses, and statutory citations.
  * **Document Q&A**: Interactive question-answering grounded strictly in document contents.
* **Hearing Calendar & Notes**: Track court dates, hearing stages (Arguments, Evidence, Framing of Issues), courtrooms, and preserve timestamped case research notes.
* **Identity Verification Flow**: Bar Council verification workflow ensuring only verified advocates enter the professional portal.

---

## 5. Technical Architecture & System Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             NEXT.JS 16 FRONTEND                             │
│       React 19 • TypeScript • Tailwind CSS v4 • Workspace Pub/Sub Store     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / JSON (FastAPI v1 API)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                              FASTAPI BACKEND                                │
│       Async ASGI • Global Envelope Pattern • JWT RBAC • Pydantic v2         │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│    SQLAlchemy 2.0    │  SentenceTransformers│         Google Gemini         │
│     Async MySQL      │   all-MiniLM-L6-v2   │   Structured JSON Analysis    │
└──────────┬───────────┴──────────┬───────────┴───────────────┬───────────────┘
           ▼                      ▼                           ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────────────┐
│     MySQL 8.0+       │ │    Qdrant Vector DB  │ │     Multi-Tier OCR Engine │
│  Relational Storage  │ │   Dense 384-dim      │ │   PyPDF + Tesseract OCR   │
│  Users, Cases, Docs  │ │   Legal Jurisprudence│ │   Digital & Image Parsing │
└──────────────────────┘ └──────────────────────┘ └───────────────────────────┘
```

### Retrieval-Augmented Generation (RAG) Pipeline
1. **Corpus Ingestion**: Verified Indian legal provisions and precedents are chunked with statutory context headers and embedded using `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
2. **Dense Vector Retrieval**: Qdrant executes cosine distance similarity matching over the `legal_chunks` collection.
3. **Multi-Query Synthesis**: User and case queries are augmented with relevant statutory anchors (e.g., Section 73 of Indian Contract Act, Section 138 of NI Act).
4. **Grounded LLM Generation**: Google Gemini processes retrieved chunks in temperature-controlled structured JSON mode. Strict system constraints prevent external hallucinations.

---

## 6. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.1.6 (App Router)** | Server & Client Components, Responsive Layout |
| **Frontend Runtime** | **React 19 & TypeScript 5** | Type-safe UI components, hooks, state store |
| **UI Styling** | **Tailwind CSS v4** | Dark/Light theme tokens, glassmorphism design |
| **Backend API** | **FastAPI (Python 3.11/3.12)** | Asynchronous ASGI REST API |
| **ORM & Database** | **SQLAlchemy 2.0 (asyncmy) + MySQL** | Relational transactional persistence |
| **Vector Database** | **Qdrant Vector DB** | High-performance dense semantic vector search |
| **Embeddings** | **SentenceTransformers (all-MiniLM-L6-v2)** | 384-dim semantic embeddings |
| **Language Model** | **Google Gemini API** | Structured legal synthesis & document analysis |
| **OCR Pipeline** | **PyPDF + Pytesseract + pdf2image** | Native PDF & scanned image text extraction |
| **Authentication** | **JWT (python-jose + passlib / bcrypt)** | Role-Based Access Control (Citizen / Lawyer) |
| **Schema Migrations** | **Alembic (Async)** | Automated database schema evolution |

---

## 7. Project Structure

```text
LegalAI/
├── Frontend/                           # Next.js 16 Client Application
│   ├── public/                         # Static assets, branding & videos
│   ├── src/
│   │   ├── app/
│   │   │   ├── citizen/                # Citizen Workspace routes (dashboard, cases, docs, lawyers)
│   │   │   ├── lawyer/                 # Lawyer Professional Portal (intelligence, research, cases, docs)
│   │   │   ├── login/                  # Real authentication login screen
│   │   │   ├── register/               # Citizen & Lawyer registration with Bar details
│   │   │   └── page.tsx                # Marketing landing page
│   │   ├── components/                 # Reusable UI primitives, cards, headers, drawers
│   │   ├── hooks/                      # Custom React hooks (useDocuments, useLegalResearch, etc.)
│   │   ├── services/                   # Typed API client services
│   │   ├── types/                      # TypeScript domain models & interfaces
│   │   └── lib/                        # Client state store & auth utilities
│   ├── .env.example                    # Frontend environment configuration template
│   ├── package.json                    # Node dependencies & build scripts
│   └── tsconfig.json                   # TypeScript compiler configuration
│
├── backend/                            # FastAPI Backend Service
│   ├── app/
│   │   ├── ai/                         # Embedding generator, Qdrant client, Gemini LLM, OCR engine
│   │   ├── api/v1/                     # Route controllers (auth, citizen, lawyer, cases, docs, legal)
│   │   ├── core/                       # App configuration, security settings
│   │   ├── db/                         # SQLAlchemy async engine, session factory, base model
│   │   ├── models/                     # SQLAlchemy ORM database models (User, Case, Document, etc.)
│   │   ├── repositories/               # Async repository abstractions for database CRUD
│   │   ├── schemas/                    # Pydantic validation schemas & API envelopes
│   │   ├── security/                   # Password hashing (bcrypt) & JWT token handling
│   │   ├── services/                   # Business logic layer (Case Intelligence, Legal Research, Docs)
│   │   └── main.py                     # ASGI application root & lifespan setup
│   ├── migrations/                     # Alembic database migration revisions
│   ├── scripts/                        # Database initialization & knowledge base seeding scripts
│   ├── .env.example                    # Backend environment configuration template
│   ├── alembic.ini                     # Alembic configuration
│   └── requirements.txt                # Python backend dependencies
│
├── .gitignore                          # Production-grade Git exclusion rules
└── README.md                           # Public technical documentation
```

---

## 8. Getting Started & Installation

### Prerequisites
* **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
* **Python**: `3.11` or `3.12`
* **MySQL**: `8.0+`
* **Qdrant**: Local Docker instance (`port 6333`) or Qdrant Cloud cluster
* **Tesseract OCR** (Optional, for scanned document OCR): `tesseract-ocr` installed on host system

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/devang-coderr/LegalAI.git
cd LegalAI
```

---

### Step 2: Backend Setup

1. **Navigate to the backend directory and create a virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate the virtual environment**:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   ```ini
   # Database Configuration (MySQL Async)
   DATABASE_URL=mysql+asyncmy://<db_user>:<db_password>@127.0.0.1:3306/legalai_db

   # JWT Security Key
   JWT_SECRET_KEY=generate_a_secure_random_key_here

   # Qdrant Vector DB Configuration
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=

   # Google Gemini API Key
   LLM_PROVIDER=gemini
   LLM_API_KEY=your_gemini_api_key_here
   LLM_MODEL=gemini-1.5-flash

   # CORS & File Upload Limits
   CORS_ORIGINS=http://localhost:3000
   MAX_UPLOAD_SIZE_MB=15
   ```

5. **Initialize Database & Run Migrations**:
   ```bash
   # Create database tables and initial schema
   python scripts/init_db.py

   # (Optional) Seed the Qdrant legal knowledge base
   python scripts/seed_legal_knowledge.py
   ```

6. **Start the FastAPI Backend Server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Backend Swagger Docs will be available at:* `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Verify configuration in `.env.local`:
   ```ini
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_USE_MOCKS=false
   ```

4. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   *Frontend Application will be available at:* `http://localhost:3000`

---

## 9. API Overview

All API responses follow the standard JSON Envelope pattern:
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully",
  "error": null
}
```

### Core API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new Citizen or Advocate account |
| **Auth** | `POST` | `/api/v1/auth/login` | Email/password sign-in, returns JWT Bearer token |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated profile and role details |
| **Citizen** | `GET` | `/api/v1/citizen/dashboard` | Citizen summary, active cases, and recent documents |
| **Lawyer** | `GET` | `/api/v1/lawyers` | Search & filter verified lawyers by practice area |
| **Lawyer** | `POST` | `/api/v1/lawyers/match` | Multi-criteria advocate matching algorithm |
| **Cases** | `GET` | `/api/v1/cases` | List litigation cases for current user |
| **Cases** | `POST` | `/api/v1/cases` | Create new case record |
| **Cases** | `POST` | `/api/v1/cases/{id}/intelligence` | Generate synthesized Case Intelligence (Facts, Laws, Precedents, Risks) |
| **Legal** | `POST` | `/api/v1/legal/research` | Grounded semantic search across Indian jurisprudence (Qdrant) |
| **Documents** | `POST` | `/api/v1/documents/upload` | Upload legal document, trigger OCR & structured parsing |
| **Documents** | `POST` | `/api/v1/documents/{id}/analyze` | Deep AI analysis (Parties, Dates, Amounts, Clauses, Risks) |
| **Documents** | `POST` | `/api/v1/documents/{id}/ask` | Grounded Q&A over document text |
| **Documents** | `GET` | `/api/v1/documents/{id}/file` | Secure document streaming (`inline` preview or `attachment` download) |

---

## 10. Security & Privacy Design

* **Multi-Tenant Isolation**: Citizen and Lawyer data partitions are strictly enforced at the repository and service layer using relational foreign keys and authenticated user session IDs.
* **Vector Database Boundary**: Qdrant collections store only public, verified Indian statutory law and judicial precedents. Sensitive user and client documents are never leaked to public vector indices.
* **Role-Based Access Control (RBAC)**: JWT tokens encode explicit user roles (`CITIZEN`, `LAWYER`, `ADMIN`). Backend dependencies (`get_current_user`, `_require_document_access`) protect private endpoints.
* **Password Hashing**: Cryptographic password hashing using `bcrypt` with automatic salting.
* **Offline-Resilient Fallbacks**: If external AI or vector services experience network latency or rate limits, the system utilizes deterministic fallback responses to maintain UI stability without crashing.

---

## 11. Roadmap & Future Scope

* [ ] Integration with e-Courts Services API for real-time automated case status updates.
* [ ] Multi-lingual speech-to-text legal consultation in Hindi, Marathi, Tamil, and Bengali.
* [ ] Automated legal document drafting for standard contracts, legal notices, and bail petitions.
* [ ] Advanced document redaction for sensitive personal information (PII / Aadhar).

---

## 12. License & Acknowledgments

This project is developed for the **Smart India Hackathon (SIH)**.  
Licensed under the [MIT License](LICENSE).
