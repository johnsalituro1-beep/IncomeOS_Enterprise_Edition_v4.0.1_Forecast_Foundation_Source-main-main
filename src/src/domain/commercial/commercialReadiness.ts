export type CommercialCapability={id:string;name:string;status:'Designed'|'Offline prototype'|'Provider required'|'Build verification required';tier:'Free'|'Pro'|'Advisor'|'Enterprise';notes:string}
export const commercialCapabilities:CommercialCapability[]=[
{id:'accounts',name:'User accounts',status:'Offline prototype',tier:'Free',notes:'Supabase-ready authentication shell exists.'},
{id:'cloud',name:'Cloud portfolio sync',status:'Provider required',tier:'Pro',notes:'Local persistence active; cloud tables drafted.'},
{id:'sharing',name:'Portfolio sharing',status:'Designed',tier:'Pro',notes:'Read-only share tokens and privacy controls specified.'},
{id:'advisor',name:'Advisor workspaces',status:'Designed',tier:'Advisor',notes:'Multi-client workspace and report approval workflow.'},
{id:'billing',name:'Subscriptions and entitlements',status:'Designed',tier:'Pro',notes:'Feature-gate contract prepared; billing provider not selected.'},
{id:'audit',name:'Audit logs',status:'Designed',tier:'Enterprise',notes:'Append-only event model for sensitive changes.'},
{id:'flags',name:'Feature flags',status:'Offline prototype',tier:'Enterprise',notes:'Configuration-based release controls planned.'},
{id:'export',name:'Professional exports',status:'Offline prototype',tier:'Advisor',notes:'JSON/HTML reports available; PDF awaits build tooling.'},
]
