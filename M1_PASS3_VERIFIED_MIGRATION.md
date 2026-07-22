# IncomeOS Enterprise — M1 Pass 3 Verified Source Migration

## Status

Pass 3 is complete. Existing source declarations and consumers were migrated to the canonical contracts under `src/types`.

## Migration completed

- `Holding`, portfolio transaction contracts, and portfolio persistence/history snapshots now use `src/types/portfolio.ts`.
- Application distribution contracts now use `src/types/distribution.ts`.
- Market freshness/cache models now use `src/types/market.ts`.
- Forecast service contracts now re-export the canonical contracts from `src/types/forecast.ts`.
- Context-specific models were renamed to prevent ambiguous collisions:
  - `CopilotPortfolioSnapshot`
  - `LiveQuoteRecord`
  - `LiveDistributionRecord`
  - `IntegrationDistributionRecord`
  - `EtfKnowledgeDistributionRecord`
  - `UniverseDistributionRecord`
- React contexts no longer own the canonical `Holding` model.
- Compatibility re-exports remain at engine boundaries where useful, while consumers were moved to direct canonical type imports.

## Verification

- `npm run typecheck`: **passed**
- `npm test`: **passed — 36/36 tests**
- `npm run build`: **passed**
- Vite production build: **1,794 modules transformed**

Generated `node_modules`, `dist`, and TypeScript build-info files are excluded from the deliverable archive.

## Modified source files

52 files changed from the Pass 2 baseline.

- `src/integrations/contracts.ts`
- `src/pages/CalendarPage.tsx`
- `src/pages/IncomeCopilotPage.tsx`
- `src/pages/PortfolioOnboardingPage.tsx`
- `src/pages/PortfolioPage.tsx`
- `src/services/forecast/forecastTypes.ts`
- `src/services/history/portfolioFlightRecorder.ts`
- `src/services/intelligence/incomeIntelligence.ts`
- `src/services/live-data/distributionSync.ts`
- `src/services/live-data/portfolioRefresh.ts`
- `src/services/reports/portfolioReport.ts`
- `src/providers/live-data/httpProvider.ts`
- `src/providers/live-data/provider.ts`
- `src/providers/live-data/sandboxProvider.ts`
- `src/features/distributions/distributionEngine.ts`
- `src/features/distributions/distributionRepository.ts`
- `src/features/distributions/distributionSyncEngine.ts`
- `src/features/market-data/marketDataEngine.ts`
- `src/features/onboarding/onboarding.ts`
- `src/features/portfolio/PortfolioContext.tsx`
- `src/features/portfolio/portfolioManagement.ts`
- `src/features/portfolio/portfolioRepository.ts`
- `src/features/portfolio/positionEngine.ts`
- `src/features/portfolio/reconciliationEngine.ts`
- `src/features/portfolio/transactionEngine.ts`
- `src/domain/copilot-v2/copilotRuntime.ts`
- `src/domain/copilot-v3/copilotCore.ts`
- `src/domain/copilot-v3/decisionStudio.ts`
- `src/domain/copilot-v3/portfolioAdvisor.ts`
- `src/domain/copilot-v3/types.ts`
- `src/domain/copilot/incomeCopilot.ts`
- `src/domain/digital-twin/digitalTwinV2.ts`
- `src/domain/digital-twin/incomeDigitalTwin.ts`
- `src/domain/etf-research/researchEngineV2.ts`
- `src/domain/health/portfolioHealth.ts`
- `src/domain/intelligence/advancedIntelligence.ts`
- `src/domain/live-data/types.ts`
- `src/domain/live-data/validation.ts`
- `src/domain/mission-control/missionControl.ts`
- `src/domain/mission-control/missionControlV2.ts`
- `src/domain/operating-score/incomeOperatingSystemScore.ts`
- `src/domain/operating-score/incomeOperatingSystemScoreV2.ts`
- `src/domain/portfolio-intelligence/attribution.ts`
- `src/domain/portfolio-intelligence/intelligenceEngineV2.ts`
- `src/domain/portfolio/calculations.ts`
- `src/domain/scenarios/scenarioEngine.ts`
- `src/domain/strategy-builder/institutionalStrategyEngine.ts`
- `src/domain/etf/knowledge/analytics.ts`
- `src/domain/etf/knowledge/portfolioIntegration.ts`
- `src/domain/etf/knowledge/types.ts`
- `src/domain/etf-universe/phase-one/distributionIntelligence.ts`
- `src/domain/etf-universe/program-a/types.ts`
