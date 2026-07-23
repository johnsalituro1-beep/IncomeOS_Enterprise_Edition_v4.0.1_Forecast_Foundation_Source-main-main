import { ArrowUpRight, Target } from 'lucide-react'
export function IncomeCommandCenter() {
  const current=1765, goal=2000, pct=Math.round(current/goal*100)
  return <section className="panel income-command">
    <div className="panel-heading"><div><span className="terminal-label">SIGNATURE WORKSPACE</span><h2>Income Command Center</h2></div><button className="text-button">Open workspace <ArrowUpRight size={15}/></button></div>
    <div className="income-hero"><div><span>PROJECTED WEEKLY INCOME</span><strong>${current.toLocaleString()}</strong><small>+$84.20 versus last week</small></div><div className="goal-ring" style={{'--progress': `${pct*3.6}deg`} as React.CSSProperties}><div><Target size={18}/><strong>{pct}%</strong><span>of goal</span></div></div></div>
    <div className="goal-copy"><span>Weekly goal progress</span><span>${current.toLocaleString()} / ${goal.toLocaleString()}</span></div>
    <div className="progress"><i style={{width:`${pct}%`}}></i></div>
    <div className="income-stats"><div><span>Received</span><strong>$1,122</strong></div><div><span>Remaining</span><strong>$643</strong></div><div><span>Next payment</span><strong>Tomorrow</strong></div></div>
  </section>
}
