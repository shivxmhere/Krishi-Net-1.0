# Krishi-Net 3.0 — Repository Audit Baseline

**Date:** 2026-11-23  
**Repository:** `shivxmhere/Krishi-Net-1.0`  
**Target branch:** `develop/krishi-net-3.0`  
**Status:** Static code review — **not** a complete runtime, dependency, penetration, or deployment audit.

## Scope and constraints

Krishi-Net 3.0 is intended to be a multi-role agricultural ecosystem with grounded AI, farm management, mandi intelligence, community, commerce and institutional services. Execution is solo with AI coding tools; prioritization balances AI research and production product work. The existing `main` and live deployment must remain unchanged until implementation, testing and review.

## Confirmed code-level findings

| ID | Priority | Evidence | Finding | Required action |
|---|---|---|---|---|
| SEC-001 | P0 | `services/authService.ts` | If backend login or signup fails due to network issues, browser-local authentication creates/uses locally stored accounts and synthetic offline tokens. Password hashing uses a static salt concatenated to SHA-256. Backend tokens and profile information are stored in localStorage. | Design backend-authoritative auth; remove local accounts as equivalent login; consider secure httpOnly session cookies, CSRF protection, rate limits, and a migration notice for users with local-only accounts. |
| SEC-002 | P0 | `backend/app/api/endpoints/auth.py` | Signup explicitly sets `email_verified=True` and `phone_verified=True` without completing verification. | Implement verified signup policy and tests. Avoid declaring unverified identifiers verified. |
| SEC-003 | P0 | `backend/app/core/config.py`, `render.yaml` | App has a hard-coded fallback signing secret and permissive CORS defaults; Render blueprint sets wildcard origins. | Fail startup in production without strong signing secret and allowlisted origins; audit deployment environment. |
| SEC-004 | P0 | `vite.config.ts` | Build-time define maps `GEMINI_API_KEY` into client-facing references. | Remove secret injection; inspect browser bundle and Git history; rotate any key confirmed exposed. Exposure of an actual key has **not** been verified. |
| DATA-001 | P0 | `backend/app/api/endpoints/market.py` | Market endpoint prompts an LLM to invent or infer current prices, buyers and contact details without a verified live mandi data ingestion step. | Mark output unverified; implement licensed/citable time-stamped data acquisition; prohibit invented buyer identities/contact details. |
| ML-001 | P0 | `backend/app/services/ml_service.py` | Disease `severity` is directly calculated from model classification confidence. Confidence is not disease severity. | Separate calibrated classification from severity assessment; abstain when unknown; evaluate on held-out field images. |
| ML-002 | P1 | `backend/app/main.py`, `backend/app/services/ml_service.py`, `backend/app/api/endpoints/predict.py` | Model load is optional; prediction endpoint calls Groq vision when key exists and uses local model as fallback if available. | Document actual inference modes, validate model artifact provenance, output schemas, upload-size/type limits and external inference failure behavior. |
| API-001 | P0 | `backend/app/api/endpoints/ai.py` | Generic text generation endpoint accepts a prompt without auth dependency in the route signature, raising misuse/cost risk. | Verify effective security; add authentication, authorization, quotas, request limits and abuse monitoring. |
| INFRA-001 | P1 | `render.yaml`, `backend/app/core/config.py` | SQLite is configured as default database; Render blueprint uses a free plan. | Design PostgreSQL migration and persistence/backup strategy before real user onboarding. |
| QA-001 | P1 | `package.json`, `backend/requirements.txt` | Frontend has build/dev/preview scripts only, no declared lint/test scripts. Python requirements list uvicorn twice. | Add CI verification, tests, dependency scanning and lockfile discipline. |
| DOC-001 | P1 | `README.md` | Claims of 99.9% availability, very high accuracy and zero cost are not accompanied by benchmarking evidence in README. Clone instructions point to a different repository slug. | Update claims with reproducible results and correct setup documentation. |

## Reuse candidates

- Existing React/TypeScript/Vite/PWA frontend and visual components.
- Existing FastAPI API structure, with significant security and validation review required.
- AI provider integration abstractions, after restricting to backend, enforcing contracts and recording sources.
- Current frontend domain screens as UX prototypes; their actual data integration must be verified.

## Feature priorities

**P0 foundation:** backend-authoritative auth; production configuration validation; secret exposure audit; PostgreSQL plan; tests/CI; trusted mandi feed; reliable crop diagnosis contract; farmer profiles.

**P1 product beta:** weather alerts, regional community with moderation, produce listings and buyer enquiries, farm cost/yield tracking, multilingual UI.

**P2 expansion:** expert verification, academy, institutional roles, research tools, voice input and output.

**P3 advanced ecosystem:** geospatial indicators, multi-organization enterprise analytics, paid B2B services, external APIs.

## Proposed delivery architecture

Use a **modular monolith** (React PWA + FastAPI + PostgreSQL) with explicit modules for identity, farms, intelligence, markets, community, commerce, organizations and notifications. Adopt PostGIS/pgvector only when required. Use object storage for uploads, background jobs for ingestion/inference, and versioned ML evaluations. Avoid premature microservices.

## Release safety gates

1. No unverified login is treated as a backend identity.
2. No API secrets embedded in browser code; production configuration fails safely if required secrets are absent.
3. No generated mandi prices are labelled real-time unless backed by a source and observation timestamp.
4. No disease severity presented as classification confidence; uncertain cases get an explicit abstention or referral.
5. CI tests, deployment smoke tests, backups and authorization checks pass before public beta.
6. Existing `main` is not modified without reviewed PR.

## Not tested / next audit actions

- Run `npm ci`, `npm run build`, `npx tsc --noEmit`, backend tests and dependency audits in a clean development environment.
- Inventory all protected endpoints and authorization checks.
- Inspect credential presence/history safely without printing secret values.
- Verify migrations, production database persistence, external APIs, licenses, and backups.
- Confirm which frontend screens connect to real backend endpoints vs local/mock data.
- Test PWA offline behavior and accessibility with realistic users.
- Measure model accuracy on representative field images; validate market data against observed prices.

**No automated tests or live security probes were executed in this audit.** All findings above come from static source inspection and need runtime validation where applicable.
