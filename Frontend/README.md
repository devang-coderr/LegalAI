# LegalAI — Next-Generation AI-Powered Legal Intelligence Platform

**LegalAI** is a premium, production-quality AI-powered legal technology platform designed for citizens and legal advocates in India. It combines Supreme Court inspired architectural motifs with modern AI technologies (Case Intelligence, RAG Legal Research, OCR Document Risk Checking, Precedent Ratio Matching, and Hearing Preparation).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Clone repository and navigate to Frontend directory
cd Frontend

# Install dependencies
npm install
```

### 3. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Building for Production
```bash
npm run build
npm run start
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local`:

```env
# Backend API REST base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Mock Mode Toggle (Set to 'true' for offline mock testing, 'false' for live REST backend)
NEXT_PUBLIC_USE_MOCKS=true
```

---

## 📁 Directory Structure

```
Frontend/
├── src/
│   ├── app/ (Next.js App Router: landing page, /login, /register, /citizen/*, /lawyer/*)
│   ├── components/ (ui/, layout/, legal/, ai/)
│   ├── services/ (API REST client modules: auth, case, legalResearch, document)
│   ├── mocks/ (Offline mock database: db.mock.ts)
│   ├── hooks/ (Custom React hooks: useAuth, useCases, useLegalResearch, useDocuments)
│   ├── types/ (Shared TypeScript interfaces: api, user, case, legal, document)
│   └── lib/ (api-client.ts, utils.ts)
├── FRONTEND_INTEGRATION.md (Comprehensive API Integration Contracts)
├── README.md (Setup & Architecture guide)
└── package.json
```

---

## 🔒 Security & System Boundaries

- **Decoupled Client**: The browser client **NEVER** accesses MySQL databases, vector databases, Python ML models, or LLM keys directly.
- **Client-Side Roles**: Role checks in UI control navigation only; server authorization is enforced by the backend API.
- **Legal Disclaimer**: `<LegalDisclaimer />` is rendered near AI-generated legal outputs as required under legal tech compliance guidelines.

---

## Visual Architecture

- `src/app/globals.css` defines Court at Night and Supreme Court at Dawn tokens, surface treatment, and reduced-motion behavior.
- `src/components/layout/CinematicBackground.tsx` supplies the optional muted cinematic layer, static fallback, and mobile/reduced-motion fallback.
- Citizen and lawyer layouts keep their existing routes and behavior while sharing a low-intensity architectural atmosphere.
- See `VIDEO_ASSET_GUIDE.md` for asset use, mobile suitability, and audio policy.

The visual system does not change API contracts, services, types, or `NEXT_PUBLIC_USE_MOCKS`.
