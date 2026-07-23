import { ETF_KNOWLEDGE_SEED } from './seed'
import type { EtfKnowledgeRecord, KnowledgeBaseSnapshot } from './types'

const STORAGE_KEY = 'edcp-etf-knowledge-base-v1'

export class EtfKnowledgeRepository {
  private records: EtfKnowledgeRecord[]
  constructor(initial: EtfKnowledgeRecord[] = ETF_KNOWLEDGE_SEED) { this.records = initial }
  list() { return [...this.records] }
  getByTicker(ticker:string) { return this.records.find(r => r.master.ticker.toUpperCase() === ticker.toUpperCase()) }
  search(query:string) {
    const q = query.trim().toLowerCase()
    if (!q) return this.list()
    return this.records.filter(({master,classification}) => [master.ticker,master.fundName,master.issuer,master.strategy,master.primaryAssetClass,...(classification?.tags ?? [])].some(v => v.toLowerCase().includes(q)))
  }
  upsert(record:EtfKnowledgeRecord) {
    const idx = this.records.findIndex(r => r.master.id === record.master.id || r.master.ticker === record.master.ticker)
    if (idx >= 0) this.records[idx] = record; else this.records.push(record)
  }
  importMany(records:EtfKnowledgeRecord[]) { records.forEach(r => this.upsert(r)); return this.records.length }
  snapshot():KnowledgeBaseSnapshot { return {schemaVersion:'1.0.0',generatedAt:new Date().toISOString(),sourceIds:[...new Set(this.records.map(r=>r.master.sourceId))],funds:this.list(),distributions:[],holdings:[],relationships:[]} }
  saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot())) }
  loadLocal() { const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return false; const parsed=JSON.parse(raw) as KnowledgeBaseSnapshot; this.records=parsed.funds; return true }
}

export const etfKnowledgeRepository = new EtfKnowledgeRepository()
