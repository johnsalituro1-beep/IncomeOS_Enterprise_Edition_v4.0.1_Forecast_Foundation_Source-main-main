# Release Notes — v4.0 Milestone 1

## Completed
- New Project Atlas architecture
- pnpm-first deployment configuration
- Application shell and responsive navigation
- Supabase authentication and sign-out
- Dashboard v1 presentation layer
- Income Command Center preview
- Income Score preview
- Income Timeline preview
- Secure database foundation and RLS

## Intentionally deferred
Live market data, dividend-provider integrations, portfolio CRUD screens, transaction calculations, forecasting engine, alerts and AI are later milestones. Dashboard values in Milestone 1 are clearly demonstration data.

## Acceptance test
- App builds with `pnpm build`
- Demo Mode appears without environment variables
- Login appears with environment variables
- Sign-up confirmation and sign-in work
- Refresh preserves the Supabase session
- Sign out returns to login
- Direct navigation to routes works on Netlify
- Mobile navigation opens and closes
