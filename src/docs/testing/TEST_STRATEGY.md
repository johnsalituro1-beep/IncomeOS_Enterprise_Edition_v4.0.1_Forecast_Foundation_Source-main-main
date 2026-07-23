# Test Strategy

## Unit tests
- calculation engine edge cases
- projection scenarios
- insight thresholds and severity
- data normalization

## Component tests
- Income Intelligence Engine states
- portfolio form validation
- settings persistence
- empty, loading, and error states

## Integration tests
- Supabase authentication and RLS
- portfolio persistence
- provider adapters
- notification preferences

## End-to-end release flows
1. Sign up or enter demo mode.
2. Add, edit, and remove a holding.
3. Set an income goal.
4. Verify dashboard, calendar, timeline, and intelligence output.
5. Run and save a strategy scenario.
6. Sign out and confirm persistence behavior.
