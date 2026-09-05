# LegalAI Backend

FastAPI + MySQL + Qdrant. See `LegalAI_Backend_Build_Guide_v2.md` (in the parent conversation) for the full phase-by-phase build log — this README only covers running what already exists.

## Setup
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# edit .env with your real DATABASE_URL, JWT_SECRET_KEY, QDRANT_URL, QDRANT_API_KEY
```

## Run
```powershell
uvicorn app.main:app --reload
```
Then check `http://127.0.0.1:8000/health` and `http://127.0.0.1:8000/docs`.

## Status
Phase 1 of 27 complete — environment + health check only. No routes, models, or business logic yet.
