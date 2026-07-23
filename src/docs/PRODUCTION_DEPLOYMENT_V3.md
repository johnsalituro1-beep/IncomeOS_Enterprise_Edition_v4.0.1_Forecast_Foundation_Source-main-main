# IncomeOS v3.0 Production Deployment
1. Create isolated Supabase development, preview, and production projects.
2. Apply migrations in order and enable email verification plus approved redirect URLs.
3. Configure the production variables from `.env.production.example`; never expose provider secrets in Vite variables.
4. Deploy through the included CI pipeline and hosting configuration.
5. Connect a secured server cron or queue worker to the data-operation contracts.
6. Enable error monitoring and test alert delivery.
7. Enable daily database backups and complete a restore exercise before launch.
8. Verify security headers, password recovery, logout, row-level security, rollback, and the Production Readiness page.
