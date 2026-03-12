# MiraCars Automation

Production-focused car rental automation app with a React frontend, Express API, SQLite/Drizzle data layer, and AI-assisted operational endpoints.

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm ci
```

## Environment

Create `.env` from `.env.example`.

Required:
- `GEMINI_API_KEY`
- `JWT_SECRET` (32+ chars)

Runtime:
- `NODE_ENV` (`development` | `production` | `test`)
- `PORT` (default `3000`)

Optional integrations:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `RESEND_API_KEY`

Optional demo seed controls (development/test only):
- `SEED_DEMO_DATA=true`
- `DEMO_USER_PASSWORD` (12+ chars, required when seeding is enabled)

## Local Development

```bash
npm run dev
```

## Test

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```

## Start Production Server

```bash
npm run start
```

Production behavior:
- Binds on `0.0.0.0:$PORT`
- Serves built frontend from `dist/`
- Provides health endpoint at `/api/healthz`
- Uses Vite middleware only in non-production mode

## Replit Deployment

Configured in `.replit` with:
- Build: `npm ci && npm run build`
- Run: `npm run start`

Local workspace run remains `npm run dev`.

## Security Notes

- Do not commit `.env` or any real credentials.
- Current tree should be scanned with:

```bash
gitleaks detect --source . --no-banner --redact
```

If any secret was previously committed in history, treat it as compromised:
1. Rotate affected credentials immediately.
2. Rewrite git history to purge the secret-bearing commits.
3. Force-push rewritten history.
4. Re-run secret scanning and close related alerts.
