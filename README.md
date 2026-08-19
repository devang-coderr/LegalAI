# LegalAI
This is our SIH2026 Project Repository
</br>
Team Leader: Devang
</br>
Team members : Sufi,Sourabh,Ujjwal,Uttkarsh and Nisha



How to Run Frontend
1. Open Command Prompt / PowerShell

Navigate to the LegalAI repository:

cd "PATH_TO_YOUR_LEGALAI_FOLDER"

Example:

cd "C:\Users\devan\Downloads\LegalAI"
2. Open Frontend
cd frontend
3. Install dependencies
npm install
4. Start the development server
npm run dev

You should see something similar to:

Local: http://localhost:3000

Open the displayed address in your browser.

# LegalAI — AI-Powered Legal Assistance Platform

LegalAI is a modern AI-powered legal assistance platform designed to make legal information, case analysis, legal research, and related services easier to access for both **citizens** and **lawyers**.

This repository contains the **frontend application** of LegalAI.

---

## 🚀 Features

### 👤 Citizen Mode

The Citizen workspace helps users understand and manage their legal issues.

* 🏠 Citizen Dashboard
* ⚖️ Case Intelligence
* 📚 Legal Research
* 👨‍⚖️ Lawyer Discovery
* 📄 Document Management
* 🕐 Case Timeline
* 🔔 Notifications
* ⚙️ User Settings
* 🔐 Login & Registration
* 🔑 Forgot Password
* 📋 Case information and related legal details

### 👨‍⚖️ Lawyer Mode

The Lawyer workspace provides tools designed for legal professionals.

* 📊 Lawyer Dashboard
* ⚖️ Case Intelligence
* 📁 Case Management
* 👥 Client Management
* 📄 Document Management
* 🕐 Hearing Management
* 📚 Legal Research
* ⚖️ Previous Precedents
* 🔔 Notifications
* ⚙️ Lawyer Settings

### 🤖 AI & Legal Intelligence UI

The frontend is designed to support future AI/backend integration for:

* Case analysis
* Relevant law identification
* Legal research
* Previous judgment and precedent discovery
* Legal issue identification
* AI-assisted legal insights
* Document-based analysis
* RAG-based legal research

> The current frontend contains UI, navigation, mock data, and integration-ready structures. Backend/AI services can be connected through the existing API/service layer.

---

## 🎨 Design

LegalAI uses a cinematic legal-themed interface inspired by:

* ⚖️ Justice and law
* 🏛️ Court architecture
* 👩‍⚖️ Lady Justice
* ✨ Modern AI interfaces
* 🌙 Dark/Light theme
* 📱 Responsive layouts
* 🎬 Smooth animations and visual effects

The design is intended to provide a professional experience while keeping the interface understandable for normal citizens.

---

## 🛠️ Tech Stack

| Technology    | Purpose               |
| ------------- | --------------------- |
| Next.js       | Frontend framework    |
| TypeScript    | Type-safe development |
| Tailwind CSS  | Styling               |
| React         | UI development        |
| Framer Motion | Animations            |
| Lucide React  | Icons                 |
| ESLint        | Code quality          |
| npm           | Package management    |

---

## 📁 Project Structure

```text
Frontend/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── citizen/
│   │   │   ├── case-intelligence/
│   │   │   ├── cases/
│   │   │   ├── documents/
│   │   │   ├── lawyers/
│   │   │   ├── legal-research/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   └── timeline/
│   │   │
│   │   ├── lawyer/
│   │   │   ├── case-intelligence/
│   │   │   ├── cases/
│   │   │   ├── clients/
│   │   │   ├── documents/
│   │   │   ├── hearings/
│   │   │   ├── legal-research/
│   │   │   ├── notifications/
│   │   │   ├── precedents/
│   │   │   └── settings/
│   │   │
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── contact/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ai/
│   │   ├── common/
│   │   ├── documents/
│   │   ├── hero/
│   │   ├── layout/
│   │   ├── legal/
│   │   ├── sections/
│   │   ├── settings/
│   │   ├── theme/
│   │   ├── timeline/
│   │   └── ui/
│   │
│   ├── lib/
│   ├── mocks/
│   ├── services/
│   └── types/
│
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## 💻 Requirements

Before running the project, make sure you have:

* **Node.js** 18+ recommended
* **npm**
* **Git**

Check your versions:

```bash
node --version
npm --version
git --version
```

---

## ⚡ Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Go into the project:

```bash
cd LegalAI/Frontend
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Variables

If environment variables are required, create a `.env.local` file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, you can also create the file manually.

Add the required API/backend configuration inside `.env.local`.

> Never commit `.env.local` or real API keys to GitHub.

---

## ▶️ Run the Development Server

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

---

## 🏗️ Build for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 🔍 Code Quality

Run ESLint:

```bash
npm run lint
```

Fix issues according to the ESLint output before pushing major changes.

---

## 🔌 Backend Integration

The frontend is structured so that backend and AI services can be integrated without rebuilding the entire UI.

Important areas include:

```text
src/services/
src/lib/
src/types/
src/mocks/
```

### Example Integration Flow

```text
User
  ↓
LegalAI Frontend
  ↓
API / Backend
  ↓
AI / RAG / Database
  ↓
Processed Legal Information
  ↓
Frontend UI
```

The mock data currently allows the frontend to be developed and tested before the complete backend is connected.

---

## 🤖 Planned AI Architecture

The complete LegalAI system can eventually connect the frontend with:

```text
                    LegalAI
                       │
        ┌──────────────┴──────────────┐
        │                             │
   Citizen Mode                  Lawyer Mode
        │                             │
        └──────────────┬──────────────┘
                       ↓
                Backend / APIs
                       ↓
              Legal AI Services
                       ↓
              ┌────────┴────────┐
              │                 │
             RAG              LLM
              │                 │
              └────────┬────────┘
                       ↓
               Legal Knowledge Base
                       ↓
              Judgments / Acts / Laws
```

---

## 👥 Development Workflow

For team development, create a separate branch before making changes:

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/citizen-dashboard
```

After completing your work:

```bash
git add .
git commit -m "Add citizen dashboard"
git push origin feature/citizen-dashboard
```

Then create a Pull Request on GitHub.

### Recommended Branches

```text
main
│
├── feature/citizen
├── feature/lawyer
├── feature/legal-research
├── feature/ui
├── feature/backend-integration
└── feature/ai-integration
```

---

## 📌 Important Development Rules

1. Do not commit `.env.local`.
2. Do not commit API keys or passwords.
3. Do not directly modify another developer's feature branch.
4. Pull the latest `main` before starting major work.
5. Use meaningful commit messages.
6. Test the application before pushing.
7. Keep reusable components inside `src/components`.
8. Keep API/service logic separate from UI components.
9. Use TypeScript types instead of unnecessary `any`.
10. Create a separate branch for major features.

---

## 🧪 Current Development Status

### Frontend

* [x] Landing page
* [x] Responsive navigation
* [x] Citizen workspace
* [x] Lawyer workspace
* [x] Authentication pages
* [x] Case management UI
* [x] Case Intelligence UI
* [x] Legal Research UI
* [x] Document UI
* [x] Lawyer discovery UI
* [x] Hearing UI
* [x] Timeline UI
* [x] Notification UI
* [x] Settings UI
* [x] Dark/Light theme
* [x] Reusable components
* [x] Mock data
* [x] API/service structure

### Backend & AI Integration

* [ ] Authentication API
* [ ] Database integration
* [ ] Document processing
* [ ] OCR pipeline
* [ ] Legal RAG pipeline
* [ ] LLM integration
* [ ] Judgment/precedent retrieval
* [ ] Case analysis API
* [ ] Production deployment

---

## 🎯 Project Goal

LegalAI aims to bridge the gap between people and legal information by providing an accessible platform where citizens can better understand their legal problems while lawyers can use AI-assisted tools for research, case analysis, document handling, and precedent discovery.

The long-term goal is to create a system that combines:

**Legal Data + AI + RAG + Case Intelligence + User-Friendly Interface**

to make legal assistance more accessible, efficient, and understandable.

---

## 📄 License

This project is currently developed as an academic/project initiative.

Add an appropriate open-source license if the project is later released publicly.

---

## 👨‍💻 Team

**LegalAI — SIH Project**

Developed as a collaborative team project for building an AI-powered legal assistance platform.

public/

If you need the dependencies again, simply run:

npm install
