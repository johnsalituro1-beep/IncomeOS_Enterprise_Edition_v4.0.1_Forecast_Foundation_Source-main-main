# Security and Recovery Controls
- Browser code uses only public Supabase credentials; licensed data-provider secrets stay server-side.
- Row-level security protects user profiles, portfolios, and security audit records.
- Hosting headers deny framing, restrict browser capabilities, and apply a content security policy.
- Authentication supports email sign-in, registration, password recovery, password updates, and session logout.
- Production deployments must disable demo mode, configure monitoring, and confirm backup restore testing.
- Recovery procedure: stop writes, restore the latest verified backup to staging, validate integrity, promote through the normal deployment pipeline, and record the incident in the audit log.
