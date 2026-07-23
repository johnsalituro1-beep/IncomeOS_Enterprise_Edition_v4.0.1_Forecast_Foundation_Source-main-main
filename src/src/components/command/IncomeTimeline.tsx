import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react'
import { usePortfolio } from '../../features/portfolio/PortfolioContext'

const money=(value:number)=>value.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2})
const days=['Today','Tomorrow','Friday','Next Tuesday','Next Friday']

export function IncomeTimeline(){
 const {holdings}=usePortfolio()
 const items=holdings.slice(0,5).map((h,index)=>({holding:h,day:days[index],amount:h.shares*h.annualDistributionPerShare/52,status:index===0?'Pending':'Scheduled'}))
 return <article className="panel timeline-panel"><div className="panel-heading"><div><span className="eyebrow">INCOME TIMELINE™</span><h3>Upcoming cash flow</h3></div><CalendarDays size={18}/></div><div className="timeline-list">{items.map(({holding,day,amount,status},index)=><div className="timeline-item" key={holding.id}><div className="timeline-rail"><span></span>{index<items.length-1&&<i/>}</div><div className="timeline-content"><div><small>{day}</small><strong>{holding.ticker}</strong><span>{holding.fundName}</span></div><div className="timeline-amount"><strong>{money(amount)}</strong><span>{status==='Pending'?<Clock3 size={13}/>:<CheckCircle2 size={13}/>} {status}</span></div></div></div>)}</div></article>
}
