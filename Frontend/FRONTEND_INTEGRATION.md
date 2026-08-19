# LegalAI — Backend & AI Integration Contracts

This document specifies the exact API integration contracts between the **LegalAI Frontend** and the backend teams (**Backend REST API, MySQL Database, OCR Engine, NLP/ML Models, and RAG Vector DB**).

> Presentation-only redesign note: visual components do not access data sources. API requests remain exclusively in `src/services/*.api.ts`, with `NEXT_PUBLIC_USE_MOCKS` behavior unchanged.

---

## 1. Architectural Boundaries

- **Decoupled Client**: The browser client **NEVER** communicates directly with MySQL databases, vector databases, Python ML models, or LLM keys.
- **Service Layer Abstraction**: All network requests pass through `src/services/*.api.ts` which consume `src/lib/api-client.ts`.
- **Mock Mode Switching**:
  - `NEXT_PUBLIC_USE_MOCKS=true` → Frontend executes offline using `src/mocks/db.mock.ts`.
  - `NEXT_PUBLIC_USE_MOCKS=false` → Frontend issues live REST HTTP requests to `NEXT_PUBLIC_API_BASE_URL`.

---

## 2. API Response Wrapper Contract

All API responses returned by backend REST endpoints MUST conform to this standard JSON shape:

```json
{
  "success": true,
  "data": {},
  "message": null,
  "error": null,
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

In the event of an error:

```json
{
  "success": false,
  "data": null,
  "message": "Failed to process case intelligence request.",
  "error": {
    "code": "INVALID_QUERY_FORMAT",
    "message": "Query string must contain at least 10 characters.",
    "details": {
      "query": ["Minimum length is 10 characters."]
    }
  }
}
```

---

## 3. Endpoints & Schemas Specification

### A. Authentication
- **Endpoint**: `POST /api/v1/auth/login`
- **Purpose**: Authenticate user and issue JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "advocate@bar.in",
    "password": "secretpassword",
    "role": "LAWYER"
  }
  ```
- **Response Data**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-101",
      "name": "Adv. Rajesh Sharma",
      "email": "advocate@bar.in",
      "role": "LAWYER",
      "barEnrolmentNumber": "MAH/1234/2015"
    }
  }
  ```

### B. Case Intelligence Solver
- **Endpoint**: `POST /api/v1/cases/intelligence`
- **Purpose**: Analyze natural language case query and return structured facts, applicable laws, ratio decidendi precedents, and next steps.
- **Request Body**:
  ```json
  {
    "query": "Landlord refusing security deposit refund of Rs 75,000..."
  }
  ```
- **Response Data**:
  ```json
  {
    "caseId": "case-99",
    "summary": "Dispute regarding arbitrary security deposit retention.",
    "facts": {
      "overview": "Tenant vacated flat after 30-day notice...",
      "keyEvents": [{ "date": "01 May 2026", "event": "Notice served" }],
      "parties": { "plaintiff": "Tenant", "defendant": "Landlord" }
    },
    "issues": [
      { "id": "1", "title": "Arbitrary Deposit Forfeiture", "description": "No damage proof", "severity": "HIGH" }
    ],
    "applicableLaws": [
      { "actName": "Transfer of Property Act, 1882", "section": "Section 108(m)", "title": "Duty of Lessee", "explanation": "Excludes normal wear and tear." }
    ],
    "precedents": [
      {
        "id": "p-1",
        "caseName": "K.P. Moolchand vs. State of Delhi",
        "citation": "(2018) SCC Online Del 942",
        "court": "High Court of Delhi",
        "year": 2018,
        "relevanceScore": 0.98,
        "summary": "Arbitrary retention illegal.",
        "whyRelevant": "Direct facts match."
      }
    ],
    "recommendedSteps": ["Issue legal notice demanding refund within 15 days."],
    "disclaimer": "LegalAI provides AI-assisted legal research..."
  }
  ```

### C. RAG Legal Research
- **Endpoint**: `POST /api/v1/legal/research`
- **Purpose**: Search 500k+ Supreme Court & High Court judgments using RAG vector embeddings.
- **Request Body**:
  ```json
  {
    "query": "Order 9 Rule 13 CPC grounds for setting aside ex-parte decree",
    "court": "Supreme Court of India"
  }
  ```
- **Response Data**:
  ```json
  {
    "query": "...",
    "aiExplanation": "AI synthesized reasoning...",
    "legalIssues": [],
    "applicableLaws": [],
    "citations": [
      {
        "id": "c-1",
        "title": "G.P. Srivastava vs. R.K. Raizada",
        "citationNumber": "(2000) 3 SCC 54",
        "court": "Supreme Court of India",
        "judgmentDate": "2000-03-02",
        "excerpt": "Sufficient cause must be liberally construed...",
        "ratioDecidendi": "Liberal construction of sufficient cause."
      }
    ],
    "precedents": []
  }
  ```

### D. Document OCR & Risk Analysis
- **Endpoint**: `POST /api/v1/documents/ocr`
- **Purpose**: Process uploaded legal contract/Summons PDF via OCR engine and return risk flags.
- **Header**: `Content-Type: multipart/form-data`
- **Response Data**:
  ```json
  {
    "documentId": "doc-88",
    "fileName": "lease_agreement.pdf",
    "extractedText": "Raw extracted OCR text...",
    "summary": "Lease agreement analysis...",
    "detectedDates": [{ "label": "Expiry", "date": "01 March 2027" }],
    "risks": [
      {
        "clause": "Clause 14 Lock-In Penalty",
        "riskLevel": "HIGH",
        "explanation": "Unilateral lock-in clause.",
        "recommendation": "Negotiate reciprocal termination clause."
      }
    ],
    "missingChecklist": [{ "item": "Bank Receipt", "status": "MISSING" }]
  }
  ```

---

## 4. How to Connect a New Backend API

1. Open `src/services/<module>.api.ts`.
2. Add your new API call function calling `apiClient('/your-endpoint', { method: 'POST', body: ... })`.
3. Add any new data properties to `src/types/<module>.ts`.
4. Add a fallback mock block inside `if (USE_MOCKS)` so the team can continue offline testing.
