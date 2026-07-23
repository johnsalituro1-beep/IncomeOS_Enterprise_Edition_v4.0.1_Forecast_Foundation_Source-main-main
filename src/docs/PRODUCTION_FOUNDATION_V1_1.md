# IncomeOS Enterprise Edition v1.1 — Production Foundation

## Delivered

- Reproducible npm dependency lockfile and Node 22 toolchain contract.
- Full TypeScript and Vite build pipeline.
- CI workflow for pushes and pull requests.
- Runtime environment validation and production safety checks.
- Application-level React error boundary.
- Supabase authentication health probe.
- System Status dashboard route at `/system-status`.
- Post-build artifact verification.
- Production environment template.

## Deployment sequence

1. Copy `.env.production.example` to `.env.production` and provide valid public Supabase values.
2. Apply all SQL files in `supabase/migrations` in timestamp order.
3. Run `npm ci`.
4. Run `npm run ci`.
5. Deploy `dist/` to the configured static host.
6. Open `/system-status` and confirm no production configuration errors.

## Security boundaries

The browser may contain only the Supabase anonymous public key. Service-role keys, provider secrets, brokerage credentials, and data-vendor credentials must remain server-side and are intentionally not included.
