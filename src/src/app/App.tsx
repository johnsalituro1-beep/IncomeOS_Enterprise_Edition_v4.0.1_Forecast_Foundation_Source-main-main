import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { PortfolioProvider } from '../features/portfolio/PortfolioContext'
import { ForecastProvider } from '../features/forecast/ForecastContext'
import { TerminalLayout } from '../layouts/TerminalLayout'

const page = <T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) => lazy(async () => ({ default: (await loader())[name] as React.ComponentType<any> }))
const DashboardPage = page(()=>import('../pages/DashboardPage'),'DashboardPage')
const IncomePage = page(()=>import('../pages/IncomePage'),'IncomePage')
const LoginPage = page(()=>import('../pages/LoginPage'),'LoginPage')
const PlaceholderPage = page(()=>import('../pages/PlaceholderPage'),'PlaceholderPage')
const PortfolioPage = page(()=>import('../pages/PortfolioPage'),'PortfolioPage')
const CalendarPage = page(()=>import('../pages/CalendarPage'),'CalendarPage')
const ResearchPage = page(()=>import('../pages/ResearchPage'),'ResearchPage')
const StrategyPage = page(()=>import('../pages/StrategyPage'),'StrategyPage')
const SettingsPage = page(()=>import('../pages/SettingsPage'),'SettingsPage')
const IntelligencePage = page(()=>import('../pages/IntelligencePage'),'IntelligencePage')
const PlanningPage = page(()=>import('../pages/PlanningPage'),'PlanningPage')
const ReportsPage = page(()=>import('../pages/ReportsPage'),'ReportsPage')
const EtfKnowledgeBasePage = page(()=>import('../pages/EtfKnowledgeBasePage'),'EtfKnowledgeBasePage')
const ComparisonStudioPage = page(()=>import('../pages/ComparisonStudioPage'),'ComparisonStudioPage')
const IncomeStrategyBuilderPage = page(()=>import('../pages/IncomeStrategyBuilderPage'),'IncomeStrategyBuilderPage')
const MissionControlPage = page(()=>import('../pages/MissionControlPage'),'MissionControlPage')
const OptimizationLabPage = page(()=>import('../pages/OptimizationLabPage'),'OptimizationLabPage')
const FlightRecorderPage = page(()=>import('../pages/FlightRecorderPage'),'FlightRecorderPage')
const UniverseImporterPage = page(()=>import('../pages/UniverseImporterPage'),'UniverseImporterPage')
const MobileCompanionPage = page(()=>import('../pages/MobileCompanionPage'),'MobileCompanionPage')
const CommercialEditionPage = page(()=>import('../pages/CommercialEditionPage'),'CommercialEditionPage')
const ProfessionalReportsPage = page(()=>import('../pages/ProfessionalReportsPage'),'ProfessionalReportsPage')
const EnterpriseBuildPage = page(()=>import('../pages/EnterpriseBuildPage'),'EnterpriseBuildPage')
const StageOneBuildPage = page(()=>import('../pages/StageOneBuildPage'),'StageOneBuildPage')
const StageTwoBuildPage = page(()=>import('../pages/StageTwoBuildPage'),'StageTwoBuildPage')
const StageThreeBuildPage = page(()=>import('../pages/StageThreeBuildPage'),'StageThreeBuildPage')
const EtfResearchProfilePage = page(()=>import('../pages/EtfResearchProfilePage'),'EtfResearchProfilePage')
const StageFourBuildPage = page(()=>import('../pages/StageFourBuildPage'),'StageFourBuildPage')
const StageFiveBuildPage = page(()=>import('../pages/StageFiveBuildPage'),'StageFiveBuildPage')
const StageSixAdvisorPage = page(()=>import('../pages/StageSixAdvisorPage'),'StageSixAdvisorPage')
const StageSevenEnterprisePage = page(()=>import('../pages/StageSevenEnterprisePage'),'StageSevenEnterprisePage')
const StageEightMobilePage = page(()=>import('../pages/StageEightMobilePage'),'StageEightMobilePage')
const StageNineLaunchPage = page(()=>import('../pages/StageNineLaunchPage'),'StageNineLaunchPage')
const ProgramAUniversePage = page(()=>import('../pages/ProgramAUniversePage'),'ProgramAUniversePage')
const DigitalTwinPage = page(()=>import('../pages/DigitalTwinPage'),'DigitalTwinPage')
const IncomeCopilotPage = page(()=>import('../pages/IncomeCopilotPage'),'IncomeCopilotPage')
const IncomeOSIntelligencePage = page(()=>import('../pages/IncomeOSIntelligencePage'),'IncomeOSIntelligencePage')
const EnterpriseEditionPage = page(()=>import('../pages/EnterpriseEditionPage'),'EnterpriseEditionPage')
const SystemStatusPage = page(()=>import('../pages/SystemStatusPage'),'SystemStatusPage')
const ProductionReadinessPage = page(()=>import('../pages/ProductionReadinessPage'),'ProductionReadinessPage')
const ProductionOperationsPage = page(()=>import('../pages/ProductionOperationsPage'),'ProductionOperationsPage')
const LiveDataPlatformPage = page(()=>import('../pages/LiveDataPlatformPage'),'LiveDataPlatformPage')
const PortfolioOnboardingPage = page(()=>import('../pages/PortfolioOnboardingPage'),'PortfolioOnboardingPage')

const fallback = <div className="boot-screen"><img src="/favicon.png" alt=""/><p>Loading IncomeOS workspace…</p></div>

export function App() {
  const { user, loading, configured } = useAuth()
  if (loading) return fallback
  if (configured && !user) return <Suspense fallback={fallback}><LoginPage /></Suspense>
  return <PortfolioProvider><ForecastProvider><Suspense fallback={fallback}><Routes>
    <Route element={<TerminalLayout demoMode={!configured} />}>
      <Route index element={<EnterpriseEditionPage />} />
      <Route path="mission-control" element={<MissionControlPage />} /><Route path="dashboard" element={<DashboardPage />} /><Route path="portfolio" element={<PortfolioPage />} /><Route path="onboarding" element={<PortfolioOnboardingPage />} /><Route path="income" element={<IncomePage />} /><Route path="calendar" element={<CalendarPage />} /><Route path="research" element={<ResearchPage />} /><Route path="research/:ticker" element={<EtfResearchProfilePage />} /><Route path="knowledge-base" element={<EtfKnowledgeBasePage />} /><Route path="compare" element={<ComparisonStudioPage />} /><Route path="strategy-builder" element={<IncomeStrategyBuilderPage />} /><Route path="strategy" element={<StrategyPage />} /><Route path="intelligence" element={<IntelligencePage />} /><Route path="planning" element={<PlanningPage />} /><Route path="reports" element={<ReportsPage />} /><Route path="professional-reports" element={<ProfessionalReportsPage />} /><Route path="optimization" element={<OptimizationLabPage />} /><Route path="flight-recorder" element={<FlightRecorderPage />} /><Route path="universe-importer" element={<UniverseImporterPage />} /><Route path="mobile-companion" element={<MobileCompanionPage />} /><Route path="commercial" element={<CommercialEditionPage />} /><Route path="enterprise-build" element={<EnterpriseBuildPage />} /><Route path="stage-one" element={<StageOneBuildPage />} /><Route path="stage-two" element={<StageTwoBuildPage />} /><Route path="stage-three" element={<StageThreeBuildPage />} /><Route path="stage-four" element={<StageFourBuildPage />} /><Route path="stage-five" element={<StageFiveBuildPage />} /><Route path="stage-six" element={<StageSixAdvisorPage />} /><Route path="stage-seven" element={<StageSevenEnterprisePage />} /><Route path="stage-eight" element={<StageEightMobilePage />} /><Route path="stage-nine" element={<StageNineLaunchPage />} /><Route path="program-a" element={<ProgramAUniversePage />} /><Route path="digital-twin" element={<DigitalTwinPage />} /><Route path="income-copilot" element={<IncomeCopilotPage />} /><Route path="income-os-intelligence" element={<IncomeOSIntelligencePage />} /><Route path="enterprise" element={<EnterpriseEditionPage />} /><Route path="watchlists" element={<PlaceholderPage title="Watchlists" />} /><Route path="alerts" element={<PlaceholderPage title="Alerts" />} /><Route path="live-data" element={<LiveDataPlatformPage />} /><Route path="system-status" element={<SystemStatusPage />} /><Route path="production-readiness" element={<ProductionReadinessPage />} /><Route path="production-operations" element={<ProductionOperationsPage />} /><Route path="settings" element={<SettingsPage />} />
    </Route><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></ForecastProvider></PortfolioProvider>
}
