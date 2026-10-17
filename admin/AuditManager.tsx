'use client';
import {useEffect,useState} from 'react';
import {adminRequest} from './http';
type Log={id:string;operation:string;entity_type:string;entity_id:string;created_at:string;actor_id:string;change_summary:Record<string,unknown>};
export function AuditManager(){const [logs,setLogs]=useState<Log[]>([]),[message,setMessage]=useState('Loading audit trail…');useEffect(()=>{void adminRequest<{items:Log[]}>('/api/admin/audit').then(x=>{setLogs(x.items);setMessage(x.items.length?'':'No recorded audit events.')}).catch(e=>setMessage(e.message))},[]);
 return <div className="admin-stack"><div className="admin-intro"><span className="eyebrow">GOVERNANCE</span><h1>Audit Logs</h1><p>Read-only record of authenticated mutations. Sensitive free-text notes are redacted from this view.</p></div>{message&&<p className="admin-notice" role="status">{message}</p>}<section className="admin-card"><h2>Recorded events ({logs.length})</h2><div className="admin-list">{logs.map(x=><div className="admin-record" key={x.id}><strong>{x.operation} · {x.entity_type}</strong><span>{x.entity_id} · {new Date(x.created_at).toLocaleString()} · Actor {x.actor_id.slice(0,8)}…</span></div>)}</div></section></div>
}
