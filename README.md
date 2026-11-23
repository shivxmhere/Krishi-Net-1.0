# 🌾 Krishi-Net

**Agricultural intelligence, farm tools, community and produce discovery.**  
Built by **Team TechLions**.

Krishi-Net is a developing AgriTech platform for farmers and the wider agricultural ecosystem. It combines a React web application with a FastAPI backend and a growing set of authenticated, database-backed features.

> **Status: Development beta — not production-certified.** The earlier README advertised high ML accuracy, guaranteed uptime and zero-cost services without reproducible supporting benchmarks. Those claims are withdrawn pending independent measurement.

## What works in the development branch

| Feature | Development status |
|---|---|
| Account signup/login | Server-backed password auth; no browser-only offline credentials |
| Farm management | API-backed crop create/list/delete; authentication required |
| AI advisory chat | Live provider integration when `GROQ_API_KEY` is configured; responses are unverified |
| Disease image analysis | Authenticated AI-assisted analysis with 8 MB upload limit; local ML model optional |
| Market watchlist | Browser-local add/search/sort/remove; no automatic price alerts |
| Weather | City/district search through Open-Meteo; forecast and source shown |
| Market information | Links to government sources; **verified live price ingestion not built** |
| Community | Authenticated discussion posts, replies and author-only deletion |
| Produce marketplace | Authenticated listings, enquiries, seller inbox and author-only closure |
| Preferences | Language selection and server-backed name/location updates |
| Scan history | Saved locally in the browser |

**Still needed before launch:** email/phone ownership verification, strong rate limiting, production-grade session cookies and CSRF measures, database migrations/backups, community moderation, user verification, live mandi-data licensing/ingestion, security testing, agricultural ML validation and real-world field trials.

## Repository

```
components/                 # React screens and UI
contexts/                   # Language, theme and voice state
services/                   # API integrations and local scan history
backend/app/api/endpoints/  # FastAPI routes
backend/app/models/         # SQLAlchemy entities
backend/tests/              # Backend regressions
.github/workflows/          # CI checks
docs/audit/                 # Krishi-Net audit baseline
```

## Run locally on Windows

Prerequisites: Node.js 22+, Python 3.11, Git.

```powershell
git clone https://github.com/shivxmhere/Krishi-Net-1.0.git
cd Krishi-Net-1.0
git switch feature/kn3-functional-foundation

Copy-Item .env.example .env
cd backend
Copy-Item .env.example .env
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open a second terminal from the repo root:

```powershell
npm ci
npm run dev
```

Frontend: `http://localhost:5173` — API: `http://localhost:8000` — API health: `http://localhost:8000/health`

To enable hosted AI features, configure a **new private** `GROQ_API_KEY` only in `backend/.env` or the deployment secret manager. Never put a provider secret in a frontend `VITE_*` variable or commit it to Git.

## Verify

```powershell
npm ci
npx tsc --noEmit
npm run build
cd backend
python -m compileall -q app
python -m pytest -q
```

The GitHub Actions workflow runs frontend typecheck/build, Python compilation/tests and a current-file API-key pattern guard.

## Production deployment requirements

- Use a real managed PostgreSQL database and `DATABASE_URL` secret.
- Configure `ENVIRONMENT=production`, a cryptographically random `SECRET_KEY` (32+ characters), and explicitly allowlisted `BACKEND_CORS_ORIGINS`.
- Perform a reviewed database migration/backup plan **before** deploying against real user records.
- Rotate/revoke any credential found in past public commits. Deleting it from a file does not erase Git history.
- Do not deploy this beta until user verification, abuse controls and manual browser tests are complete.

## Safety and limitations

Krishi-Net is not a substitute for a qualified agronomist. AI diagnosis and treatment suggestions may be inaccurate. Do not apply chemicals solely on generated advice; check applicable labels and seek local expert guidance. Marketplace listings are user-entered offers, not verified produce quality, price quotes or protected transactions.

Community and marketplace modules are small MVPs: no payments, messaging delivery guarantees, supplier verification, automated moderation or full privacy-compliance program exist yet.

## Development workflow

Work from feature branches and open PRs against `develop/krishi-net-3.0`. The public `main` branch and existing live site remain unchanged until an approved, tested release.

**Team TechLions — Cultivating Tech. Seeding the Future.**
