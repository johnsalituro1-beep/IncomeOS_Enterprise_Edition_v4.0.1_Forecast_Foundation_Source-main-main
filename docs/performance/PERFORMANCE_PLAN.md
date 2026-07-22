# Performance Plan

Targets for production verification:
- initial application shell under 2.5 seconds on a typical broadband connection
- responsive interaction latency under 100 ms for local calculations
- route-level code splitting for Strategy, Research, and Settings
- no repeated provider calls for unchanged data within cache TTL
- virtualize tables above 250 rows
- compress images and avoid oversized dashboard assets
- measure bundle size and Lighthouse metrics on each release candidate
