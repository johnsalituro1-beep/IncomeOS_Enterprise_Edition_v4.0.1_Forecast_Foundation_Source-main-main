import type { LucideIcon } from 'lucide-react'
export function MetricCard({ label, value, delta, icon: Icon }: { label:string; value:string; delta:string; icon:LucideIcon }) {
  return <article className="metric-card"><div><span>{label}</span><strong>{value}</strong><small className={delta.startsWith('+') ? 'positive' : ''}>{delta}</small></div><div className="metric-icon"><Icon size={20}/></div></article>
}
