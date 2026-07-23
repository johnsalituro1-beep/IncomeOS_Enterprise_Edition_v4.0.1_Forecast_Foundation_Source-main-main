import { Rocket, ArrowRightLeft, BrainCircuit, Blocks, Bell, BookOpen, CalendarDays, ChartNoAxesCombined, Database, DatabaseZap, FileBarChart2, Flag, FlaskConical, Gauge, History, Layers3, LogOut, Menu, Search, Settings, SlidersHorizontal, Smartphone, Star, WalletCards, X, Building2, ShieldCheck, Activity, MessageSquareText, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

const nav = [
  ['/', 'Income Mission Control', Gauge], ['/onboarding', 'Portfolio Onboarding', UserRoundPlus], ['/dashboard', 'Command Center Classic', ChartNoAxesCombined], ['/calendar', 'Dividend Calendar', CalendarDays], ['/portfolio', 'Portfolio Command Center', WalletCards],
  ['/research', 'ETF Intelligence', BookOpen], ['/knowledge-base', 'ETF Knowledge Base', Database], ['/compare', 'Comparison Studio', ArrowRightLeft], ['/intelligence', 'Income Intelligence', BrainCircuit], ['/income', 'Income Analytics', ChartNoAxesCombined], ['/planning', 'Goal Planner', Flag], ['/strategy-builder', 'Strategy Builder', Blocks], ['/strategy', 'Strategy Lab', FlaskConical], ['/optimization', 'Optimization Lab', SlidersHorizontal], ['/flight-recorder', 'Flight Recorder', History], ['/universe-importer', 'Universe Importer', DatabaseZap], ['/live-data', 'Live ETF Data Platform', DatabaseZap], ['/professional-reports', 'Professional Reports', FileBarChart2], ['/mobile-companion', 'Mobile Companion', Smartphone], ['/commercial', 'Commercial Edition', Building2], ['/enterprise-build', 'Tracks 1–9 Build', Rocket], ['/stage-one', 'Stage 1 Intelligence Core', ShieldCheck], ['/stage-two', 'Stage 2 Intelligence Layer', BrainCircuit], ['/stage-three', 'Stage 3 Research Engine', BookOpen], ['/stage-four', 'Stage 4 Mission Control 2.0', Gauge], ['/stage-five', 'Stage 5 Strategy Builder', SlidersHorizontal], ['/stage-six', 'Stage 6 Advisor Platform', Building2], ['/stage-seven', 'Stage 7 Enterprise Platform', ShieldCheck], ['/stage-eight', 'Stage 8 Mobile Ecosystem', Smartphone], ['/stage-nine', 'Stage 9 Launch Readiness', Rocket], ['/program-a', 'Program A ETF Universe', Database], ['/digital-twin', 'Income Digital Twin 2.0', Activity], ['/income-copilot', 'Income Copilot Decision Studio', MessageSquareText], ['/income-os-intelligence', 'Program D Income OS Intelligence', Gauge], ['/reports', 'Reports', FileBarChart2],
  ['/production-operations', 'Production Operations', Activity], ['/production-readiness', 'Production Readiness', ShieldCheck], ['/watchlists', 'Watchlists', Star], ['/alerts', 'Alerts', Bell], ['/settings', 'Settings', Settings],
] as const

export function TerminalLayout({ demoMode }: { demoMode: boolean }) {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  return <div className="terminal-shell">
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand-panel"><img src="/logo-panel.png" alt="ETF Dividend Calendar Pro"/><button className="icon-button mobile close-nav" type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={18}/></button></div>
      <div className="sidebar-section-title">COMMAND CENTERS</div>
      <nav>{nav.map(([to,label,Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}><Icon size={17}/><span>{label}</span></NavLink>)}</nav>
      <div className="brand-promise"><strong>NEVER MISS AN ETF DIVIDEND AGAIN</strong><span>Your Income. Our Mission.</span></div>
      <div className="sidebar-bottom"><div className="plan-card"><span>PRO TERMINAL</span><strong>Income OS · Enterprise Track</strong><small>Command Center release</small></div>{!demoMode && <button className="signout" type="button" onClick={signOut}><LogOut size={16}/>Sign out</button>}</div>
    </aside>
    <div className="terminal-main">
      <header className="topbar">
        <button className="icon-button mobile" type="button" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20}/></button>
        <div className="market-status"><span className="status-dot"></span> MARKET OPEN <small>DELAYED DATA</small></div>
        <div className="search-box"><Search size={16}/><input aria-label="Search ETFs, portfolios, and commands" placeholder="Search ETFs, portfolios, commands…" /></div>
        <div className="top-actions"><button className="icon-button" type="button" aria-label="Notifications"><Bell size={18}/><i></i></button><div className="profile"><div className="avatar">{user?.email?.[0]?.toUpperCase() ?? 'D'}</div><span>{user?.email ?? 'Demo Workspace'}</span></div></div>
      </header>
      {demoMode && <div className="demo-banner">DEMO MODE — Portfolio changes are saved in this browser. Add Supabase variables for cloud authentication.</div>}
      <main className="workspace"><Outlet /></main>
      <footer className="statusbar"><span><span className="status-dot"></span> SYSTEMS OPERATIONAL</span><span>PROJECT ATLAS • INCOMEOS v3.1</span><span><Layers3 size={13}/> CLOUD READY</span></footer>
    </div>
  </div>
}
