import { BarChart3, BrainCircuit, CircleDollarSign, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

const pillars = [
  { to: '/income', label: 'Income', detail: 'Cash flow, deposits and forecasts', icon: CircleDollarSign },
  { to: '/strategy', label: 'Growth', detail: 'Compounding and scenario planning', icon: BarChart3 },
  { to: '/intelligence', label: 'Intelligence', detail: 'Health, risk and recommendations', icon: BrainCircuit },
  { to: '/research', label: 'Research', detail: 'ETF profiles and comparisons', icon: Search },
]

export function IncomeOSNavigation() {
  return <section className="income-os-grid" aria-label="Income OS workspaces">{pillars.map(({to,label,detail,icon:Icon}) => <Link to={to} key={to}><Icon size={19}/><div><strong>{label}</strong><span>{detail}</span></div></Link>)}</section>
}
