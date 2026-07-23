# Sprint 1 Acceptance Checklist

## Build
- [ ] Node 22 selected
- [ ] pnpm 9.15.5 activated
- [ ] Clean dependency install succeeds
- [ ] TypeScript project build succeeds
- [ ] Vite production build succeeds
- [ ] `dist/` contains index and image assets

## Authentication
- [ ] Demo mode loads without Supabase variables
- [ ] Configured mode shows login screen
- [ ] Existing user can sign in
- [ ] New user can sign up
- [ ] Session survives refresh
- [ ] Sign-out returns to login
- [ ] Failed session request exits loading state safely

## Income Command Center
- [ ] Dynamic greeting matches local time
- [ ] Next-payment fallback works with zero holdings
- [ ] KPI cards display zero values safely
- [ ] Goal progress is capped visually at 100%
- [ ] Upcoming-payment table handles fewer than four holdings
- [ ] Portfolio Intelligence handles an empty portfolio

## Portfolio Command Center
- [ ] Add holding accepts valid values
- [ ] Invalid or zero numeric values are blocked
- [ ] Remove holding works
- [ ] Changes persist after refresh
- [ ] Corrupted localStorage falls back to starter data

## Responsive and accessibility
- [ ] 1440px desktop
- [ ] 1024px tablet
- [ ] 390px mobile
- [ ] Sidebar opens and closes by keyboard
- [ ] Visible focus states
- [ ] Form controls have labels
- [ ] Icon-only controls have accessible names
