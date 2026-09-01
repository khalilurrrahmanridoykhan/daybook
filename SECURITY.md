# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Instead, use GitHub's private vulnerability reporting
("Security" tab → "Report a vulnerability") or email the maintainer.
You will get an acknowledgement within 72 hours and a fix timeline after triage.

## Scope

Daybook handles personal financial data and OAuth tokens. Reports we especially
want to hear about:

- Cross-tenant data access (one user reading or mutating another user's data)
- Auth bypass, session fixation, or token leakage
- Weaknesses in the OAuth token vault (`src/lib/crypto.ts`)
- SSRF / injection in Server Actions or route handlers

## Handling of secrets

- No secrets are committed. `.env` is git-ignored; `.env.example` documents the
  variables with empty values.
- OAuth refresh/access tokens are encrypted at rest with AES-256-GCM.
- Money is stored as integer minor units; every money mutation writes an audit row.
