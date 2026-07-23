# ETF Dividend Calendar Pro — Design System

## Product principle
The interface should feel like a premium income-investing terminal: dense enough for serious analysis, calm enough for daily use, and clear enough for non-professional investors.

## Core tokens
- Background: midnight navy
- Surface: layered navy panels
- Primary accent: metallic gold
- Positive: income green
- Scheduled: information blue
- Pending: amber
- Action required: red

## Typography
- Inter for interface copy
- JetBrains Mono for terminal labels, tickers, and compact numerical metadata
- Page titles: 30px desktop, 25px mobile
- Section labels: uppercase, 11px, increased tracking

## Component rules
- Panels use a 1px gold-tinted border and subtle gradient.
- Primary actions use gold; secondary actions remain navy.
- Numerical values receive stronger hierarchy than descriptive text.
- Empty, loading, success, warning, and error states are required for every data-driven component.
- Motion must be subtle and optional through Settings.
