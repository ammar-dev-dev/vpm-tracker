import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase.js";

const css = `
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg-base: #0d0f14;
    --bg-surface: #13161e;
    --bg-card: #191c27;
    --bg-elevated: #1f2332;
    --bg-hover: #252a3a;
    --border: rgba(255,255,255,0.07);
    --border-bright: rgba(255,255,255,0.14);
    --text-primary: #f0f2f8;
    --text-secondary: #8892a4;
    --text-muted: #4f5869;
    --accent: #f5a623;
    --accent-dim: rgba(245,166,35,0.15);
    --accent-glow: rgba(245,166,35,0.3);
    --blue: #4f8ef7;
    --blue-dim: rgba(79,142,247,0.15);
    --green: #34d399;
    --green-dim: rgba(52,211,153,0.15);
    --red: #f87171;
    --red-dim: rgba(248,113,113,0.15);
    --purple: #a78bfa;
    --purple-dim: rgba(167,139,250,0.15);
    --cyan: #22d3ee;
    --cyan-dim: rgba(34,211,238,0.15);
    --font-display: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(0.96); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 var(--accent-glow); }
    70%  { box-shadow: 0 0 0 8px rgba(245,166,35,0); }
    100% { box-shadow: 0 0 0 0 rgba(245,166,35,0); }
  }
  @keyframes deepBlueFlow {
    0%   { background-position: 0% 0%;   }
    33%  { background-position: 0% 50%;  }
    66%  { background-position: 0% 100%; }
    100% { background-position: 0% 0%;   }
  }
  @keyframes shrink {
    from { width: 100%; }
    to   { width: 0%; }
  }
    @keyframes shrink {
  from { width: 100%; }
  to   { width: 0%; }
}
.company-word {
  display: inline;
  cursor: default;
  color: #94a3b8;
  animation: wordBreath 6s ease-in-out infinite;
}
@keyframes wordBreath {
  0%   { color: #94a3b8; text-shadow: none; }
  50%  { color: #ffffff; text-shadow: 0 0 18px rgba(255,255,255,0.8), 0 0 35px rgba(255,255,255,0.4); }
  100% { color: #94a3b8; text-shadow: none; }
}

  body { background: var(--bg-base); }

  .nav-btn {
    display: flex; align-items: center; gap: 11px; width: 100%;
    padding: 10px 12px; border-radius: 10px; border: none; cursor: pointer;
    text-align: left; font-size: 13.5px; white-space: nowrap;
    transition: all 0.18s ease; font-family: var(--font-body);
    position: relative; overflow: hidden; color: var(--text-secondary);
    background: transparent;
  }
  .nav-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(245,166,35,0.04));
    opacity: 0; transition: opacity 0.18s;
  }
  .nav-btn:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; transform: translateX(2px); }
  .nav-btn:hover::before { opacity: 1; }
  .nav-btn.active {
    background: linear-gradient(135deg, rgba(245,166,35,0.18), rgba(245,166,35,0.08)) !important;
    color: var(--accent) !important;
    border: 1px solid rgba(245,166,35,0.25);
    box-shadow: 0 0 20px rgba(245,166,35,0.08);
    font-weight: 600;
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px 20px;
    display: flex; align-items: flex-start; gap: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    animation: fadeUp 0.4s ease both;
    position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--card-accent, var(--accent)), transparent);
    opacity: 0.6;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    border-color: var(--border-bright);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  }

  .action-btn-primary {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #f5a623, #e8920a);
    cursor: pointer; font-size: 13.5px; color: #0d0f14; font-weight: 700;
    transition: all 0.18s ease;
    box-shadow: 0 4px 16px rgba(245,166,35,0.35);
    font-family: var(--font-body);
  }
  .action-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(245,166,35,0.5); filter: brightness(1.05); }
  .action-btn-primary:active { transform: translateY(0); }

  .action-btn-secondary {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border: 1px solid var(--border-bright); border-radius: 10px;
    background: var(--bg-elevated); cursor: pointer; font-size: 13.5px;
    color: var(--text-secondary); font-weight: 500;
    transition: all 0.18s ease; font-family: var(--font-body);
  }
  .action-btn-secondary:hover { background: var(--bg-hover); border-color: var(--border-bright); color: var(--text-primary); transform: translateY(-1px); }

  .table-wrapper {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .modal-overlay { animation: fadeIn 0.2s ease both; }
  .modal-box     { animation: scaleIn 0.25s ease both; }

  .search-input, .form-input {
    transition: border-color 0.18s, box-shadow 0.18s;
    background: var(--bg-base) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-bright) !important;
  }
  .search-input:focus, .form-input:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px rgba(245,166,35,0.15) !important;
    outline: none !important;
  }
  .form-input option { background: var(--bg-surface); color: var(--text-primary); }
  .form-input:hover { border-color: rgba(245,166,35,0.5) !important; transition: all 0.18s; }
  select.form-input { cursor: pointer; }

  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 8px; border: 1px solid;
    cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all 0.18s ease; font-family: var(--font-body);
  }
  .chip:hover { transform: translateY(-1px); }

  .scrollbar-dark::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-dark::-webkit-scrollbar-track { background: #050505; border-radius: 10px; }
.scrollbar-dark::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #0a1628 0%, #0f2040 40%, #0a1628 70%, #071020 100%); background-size: 100% 300%; border-radius: 10px; animation: deepBlueFlow 6s ease infinite; box-shadow: none; }
.scrollbar-dark::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #162444 0%, #1a2e55 40%, #162444 70%, #0f1c38 100%) !important; box-shadow: none !important; }
.scrollbar-dark::-webkit-scrollbar-thumb:active { background: linear-gradient(180deg, #0a1628 0%, #0f2040 100%) !important; box-shadow: none !important; }
.scrollbar-dark::-webkit-scrollbar-corner { background: transparent; }

* { scrollbar-width: thin; scrollbar-color: #0f2040 #050505; }
* ::-webkit-scrollbar-thumb:hover { background: #1a2e55 !important; box-shadow: none !important; filter: none !important; }
* ::-webkit-scrollbar-thumb:active { background: #0f2040 !important; box-shadow: none !important; filter: none !important; }

  .glow-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
    animation: pulse-ring 2s infinite;
    display: inline-block;
  }
`;

const StyleTag = () => <style>{css}</style>;

// ─── Toast ────────────────────────────────────────────────────────────────────
const toastListeners = [];
const toast = (message, type = "success") => {
  toastListeners.forEach(fn => fn(message, type));
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (message, type) => {
      const id = uid();
      setToasts(t => [...t, { id, message, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
    toastListeners.push(handler);
    return () => toastListeners.splice(toastListeners.indexOf(handler), 1);
  }, []);

  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:99999, display:"flex", flexDirection:"column", gap:10, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          position:"relative", overflow:"hidden",
          background:"var(--bg-elevated)",
          border:`1px solid ${t.type==="success"?"rgba(52,211,153,0.4)":t.type==="error"?"rgba(248,113,113,0.4)":"rgba(245,166,35,0.4)"}`,
          borderRadius:12, padding:"12px 18px",
          display:"flex", alignItems:"center", gap:10,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
          animation:"fadeUp 0.3s ease both",
          minWidth:220, maxWidth:320, pointerEvents:"auto",
        }}>
          <div style={{
            width:30, height:30, borderRadius:8, flexShrink:0,
            background: t.type==="success"?"rgba(52,211,153,0.15)":t.type==="error"?"rgba(248,113,113,0.15)":"rgba(245,166,35,0.15)",
            border:`1px solid ${t.type==="success"?"rgba(52,211,153,0.3)":t.type==="error"?"rgba(248,113,113,0.3)":"rgba(245,166,35,0.3)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color: t.type==="success"?"var(--green)":t.type==="error"?"var(--red)":"var(--accent)",
          }}>
            <Icon name={t.type==="success"?"check":t.type==="error"?"x":"alert"} size={14}/>
          </div>
          <span style={{ fontSize:13.5, color:"var(--text-primary)", fontWeight:600 }}>{t.message}</span>
          <div style={{
            position:"absolute", bottom:0, left:0, height:3,
            background: t.type==="success"?"var(--green)":t.type==="error"?"var(--red)":"var(--accent)",
            animation:"shrink 3.5s linear forwards",
            borderRadius:"0 0 0 12px",
          }}/>
        </div>
      ))}
    </div>
  );
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const today = () => new Date().toISOString().slice(0,10);
const getCompany = () => sessionStorage.getItem("vpt_company")||"aysis";

const load = async (table) => {
  const company = getCompany();
  const { data, error } = await supabase.from(table).select('*').eq('company', company);
  if(error) { console.error(error); return []; } 
  return data.map(row => ({...row.data, id: row.id, deleted: row.deleted})).filter(r => !r.deleted);
};

const save = async (table, records) => {
  const company = getCompany();
  for(const record of records) {
    const { id, deleted, ...data } = record;
    await supabase.from(table).upsert({ id, data, deleted: deleted||false, company });
  }
};

const deleteRecord = async (table, id) => {
  await supabase.from(table).update({ deleted: true }).eq('id', id);
};

const getUsers = async () => {
  const { data } = await supabase.from('users').select('*');
  if(data && data.length > 0) return data.map(r => r.data);
  const defaults = [{username:"Asim", password:"asim123"}];
  await supabase.from('users').upsert({id:'asim', data: defaults[0]});
  return defaults;
};

const saveUsers = async (users) => {
  for(const user of users) {
    await supabase.from('users').upsert({id: user.username.toLowerCase(), data: user});
  }
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const seed = () => {};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Issued":          {bg:"rgba(79,142,247,0.15)",  text:"#7eb3ff", border:"rgba(79,142,247,0.35)"},
  "Returned":        {bg:"rgba(52,211,153,0.15)",  text:"#34d399", border:"rgba(52,211,153,0.35)"},
  "Sent for Repair": {bg:"rgba(245,166,35,0.15)",  text:"#f5a623", border:"rgba(245,166,35,0.35)"},
  "Under Repair":    {bg:"rgba(251,146,60,0.15)",  text:"#fb923c", border:"rgba(251,146,60,0.35)"},
  "Repaired":        {bg:"rgba(167,139,250,0.15)", text:"#a78bfa", border:"rgba(167,139,250,0.35)"},
  "Re-Issued":       {bg:"rgba(34,211,238,0.15)",  text:"#22d3ee", border:"rgba(34,211,238,0.35)"},
  "Lost":            {bg:"rgba(248,113,113,0.15)", text:"#f87171", border:"rgba(248,113,113,0.35)"},
};

const FINAL_STATUS_CFG = {
  "Active":                  {bg:"rgba(52,211,153,0.15)",  text:"#34d399", border:"rgba(52,211,153,0.35)"},
  "Returned":                {bg:"rgba(79,142,247,0.15)",  text:"#7eb3ff", border:"rgba(79,142,247,0.35)"},
  "Under Repair":            {bg:"rgba(251,146,60,0.15)",  text:"#fb923c", border:"rgba(251,146,60,0.35)"},
  "At Vendor":               {bg:"rgba(245,166,35,0.15)",  text:"#f5a623", border:"rgba(245,166,35,0.35)"},
  "Reissued":                {bg:"rgba(34,211,238,0.15)",  text:"#22d3ee", border:"rgba(34,211,238,0.35)"},
  "Scrapped":                {bg:"rgba(248,113,113,0.15)", text:"#f87171", border:"rgba(248,113,113,0.35)"},
  "Warranty Claim":          {bg:"rgba(167,139,250,0.15)", text:"#a78bfa", border:"rgba(167,139,250,0.35)"},
  "Received after repair":   {bg:"rgba(52,211,153,0.15)",  text:"#34d399", border:"rgba(52,211,153,0.35)"},
  "Received without repair": {bg:"rgba(148,163,184,0.15)", text:"#94a3b8", border:"rgba(148,163,184,0.35)"},
  "At Stores":               {bg:"rgba(245,166,35,0.15)",  text:"#f5a623", border:"rgba(245,166,35,0.35)"},
  "At Workshop":             {bg:"rgba(251,146,60,0.15)",  text:"#fb923c", border:"rgba(251,146,60,0.35)"},
};

const Badge = ({status, cfg=STATUS_CFG}) => {
  const c = cfg[status] || {bg:"rgba(148,163,184,0.15)",text:"#94a3b8",border:"rgba(148,163,184,0.35)"};
  return (
    <span style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`,borderRadius:6,padding:"3px 10px",fontSize:11.5,fontWeight:700,whiteSpace:"nowrap",letterSpacing:"0.02em"}}>
      {status}
    </span>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({name,size=18,style={}}) => {
  const paths = {
    dashboard:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    truck:"M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM9 17H5V6a2 2 0 012-2h10l4 4v5h-1.586a2 2 0 00-1.414.586L16.414 15A2 2 0 0015 15H9z",
    wrench:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    clipboard:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    users:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    chart:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    plus:"M12 4v16m8-8H4",
    edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    download:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    alert:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    check:"M5 13l4 4L19 7",
    x:"M6 18L18 6M6 6l12 12",
    menu:"M4 6h16M4 12h16M4 18h16",
    clock:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    package:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    refresh:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    bolt:"M13 10V3L4 14h7v7l9-11h-7z",
    arrow_right:"M14 5l7 7m0 0l-7 7m7-7H3",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {(paths[name]||"").split("M").filter(Boolean).map((d,i) => (
        <path key={i} d={"M"+d} />
      ))}
    </svg>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide=false }) => (
  <div className="modal-overlay" onClick={onClose}
    style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div className="modal-box" onClick={e=>e.stopPropagation()}
      style={{background:"var(--bg-card)",border:"1px solid var(--border-bright)",width:"100%",maxWidth:wide?820:560,maxHeight:"90vh",borderRadius:16,overflow:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.6)"}}>
      <div style={{padding:"18px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"var(--bg-card)",zIndex:1}}>
        <h3 style={{margin:0,fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,color:"var(--text-primary)"}}>{title}</h3>
        <button onClick={onClose} style={{border:"1px solid var(--border-bright)",background:"var(--bg-elevated)",padding:"5px 10px",borderRadius:8,cursor:"pointer",color:"var(--text-secondary)",display:"flex",alignItems:"center"}}>
          <Icon name="x" size={15}/>
        </button>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>
);

// ─── Form field ───────────────────────────────────────────────────────────────
const Field = ({label,required,children}) => (
  <div style={{marginBottom:16}}>
    <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text-secondary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>
      {label}{required && <span style={{color:"var(--red)",marginLeft:3}}>*</span>}
    </label>
    {children}
  </div>
);

const inpBase = {width:"100%",padding:"9px 12px",borderRadius:8,fontSize:14,boxSizing:"border-box",fontFamily:"var(--font-body)"};
const Input = (props) => <input className="form-input" style={inpBase} {...props}/>;
const Select = ({children, style={}, ...props}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef(null);

  const options = React.Children.toArray(children).filter(c=>c.type==="option").map(c=>({value:c.props.value, label:c.props.children}));
  const selected = options.find(o=>o.value===props.value);
  const filtered = options.filter(o=>o.label?.toString().toLowerCase().includes(search.toLowerCase()));

  useEffect(()=>{
    const handler = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return ()=>document.removeEventListener("mousedown", handler);
  },[]);

  return (
    <div ref={ref} style={{position:"relative",...style}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{
          ...inpBase,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          cursor:"pointer",userSelect:"none",
          background:"var(--bg-base)",
          border:`1px solid ${open?"var(--accent)":"var(--border-bright)"}`,
          boxShadow:open?"0 0 0 3px rgba(245,166,35,0.15)":"none",
          borderRadius:8,
          transition:"all 0.18s",
          color:selected?.value?"var(--text-primary)":"var(--text-muted)",
        }}>
        <span style={{fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {selected?.label||"Select..."}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{flexShrink:0,transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open&&(
        <div
          ref={el=>{
            if(el){
              setTimeout(()=>{
                el.scrollIntoView({behavior:"smooth",block:"nearest"});
              },50);
            }
          }}
          style={{
          position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:9999,
          background:"var(--bg-elevated)",
          border:"1px solid var(--border-bright)",
          borderRadius:10,
          boxShadow:"0 16px 48px rgba(0,0,0,0.5)",
          overflow:"hidden",
          animation:"fadeUp 0.15s ease both",
          minWidth:180,
        }}>
          {options.length>6&&(
            <div style={{padding:"8px 10px",borderBottom:"1px solid var(--border)"}}>
              <input
                autoFocus
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search..."
                onClick={e=>e.stopPropagation()}
                style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border-bright)",borderRadius:6,padding:"6px 10px",fontSize:12,color:"var(--text-primary)",fontFamily:"var(--font-body)",outline:"none"}}
              />
            </div>
          )}
          <div style={{maxHeight:220,overflowY:"auto"}} className="scrollbar-dark">
            {filtered.map((o,i)=>(
              <div key={o.value} onClick={()=>{props.onChange&&props.onChange({target:{value:o.value}});setOpen(false);setSearch("");}}
                style={{
                  padding:"10px 14px",
                  fontSize:13.5,
                  cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  background:props.value===o.value?"rgba(245,166,35,0.12)":"transparent",
                  color:props.value===o.value?"var(--accent)":o.value?"var(--text-primary)":"var(--text-muted)",
                  fontWeight:props.value===o.value?700:400,
                  borderLeft:props.value===o.value?"3px solid var(--accent)":"3px solid transparent",
                  transition:"all 0.12s",
                }}
                onMouseEnter={e=>{if(props.value!==o.value)e.currentTarget.style.background="var(--bg-hover)";}}
                onMouseLeave={e=>{if(props.value!==o.value)e.currentTarget.style.background="transparent";}}>
                {o.label}
                {props.value===o.value&&(
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
            ))}
            {filtered.length===0&&<div style={{padding:"12px 14px",fontSize:13,color:"var(--text-muted)"}}>No options found</div>}
          </div>
        </div>
      )}
    </div>
  );
};
const Textarea = (props) => <textarea className="form-input" style={{...inpBase,resize:"vertical",minHeight:72}} {...props}/>;

// ─── Table primitives ─────────────────────────────────────────────────────────
function ConfirmModal({message, onConfirm, onClose}) {
  return (
    <div className="modal-overlay" onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}
        style={{background:"var(--bg-card)",border:"1px solid rgba(248,113,113,0.3)",width:"100%",maxWidth:380,borderRadius:16,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.6)"}}>
        <div style={{padding:"28px 28px 20px",textAlign:"center"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.3)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
            <Icon name="trash" size={22} style={{color:"var(--red)"}}/>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:"var(--text-primary)",marginBottom:8}}>Delete Record</div>
          <div style={{fontSize:13.5,color:"var(--text-secondary)",lineHeight:1.6}}>{message||"Are you sure you want to delete this record? This action cannot be undone."}</div>
        </div>
        <div style={{padding:"0 28px 24px",display:"flex",gap:10}}>
          <button onClick={onClose}
            style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid var(--border-bright)",background:"var(--bg-elevated)",color:"var(--text-secondary)",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"var(--font-body)",transition:"all 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--bg-hover)";e.currentTarget.style.color="var(--text-primary)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="var(--bg-elevated)";e.currentTarget.style.color="var(--text-secondary)";}}>
            Cancel
          </button>
          <button onClick={()=>{onConfirm();onClose();}}
            style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid rgba(248,113,113,0.4)",background:"rgba(248,113,113,0.12)",color:"var(--red)",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"var(--font-body)",transition:"all 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.22)";e.currentTarget.style.boxShadow="0 4px 16px rgba(248,113,113,0.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(248,113,113,0.12)";e.currentTarget.style.boxShadow="none";}}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const Skeleton = () => (
  <div style={{padding:"20px 16px"}}>
    {[1,2,3,4,5].map(i=>(
      <div key={i} style={{display:"flex",gap:12,marginBottom:12}}>
        {[1,2,3,4,5].map(j=>(
          <div key={j} style={{
            height:18,
            flex:j===2?2:1,
            borderRadius:6,
            background:"linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)",
            backgroundSize:"200% 100%",
            animation:"shimmer 1.5s infinite",
            animationDelay:`${i*0.05}s`
          }}/>
        ))}
      </div>
    ))}
  </div>
);

const Th = ({children,onClick,sorted,style={}}) => (
  <th onClick={onClick} style={{padding:"13px 14px",textAlign:"center",fontSize:13,fontWeight:800,color:"#e2e8f0",textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap",cursor:onClick?"pointer":"default",userSelect:"none",background:"var(--bg-elevated)",borderBottom:"2px solid var(--border-bright)",position:"sticky",top:0,zIndex:2,...style}}>
    <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
      {children}
      {onClick&&(
        <span style={{
          fontSize:13,
          color:sorted?"var(--accent)":"rgba(255,255,255,0.45)",
          transition:"all 0.15s",
          background:sorted?"rgba(245,166,35,0.15)":"rgba(255,255,255,0.06)",
          border:`1px solid ${sorted?"rgba(245,166,35,0.4)":"rgba(255,255,255,0.15)"}`,
          borderRadius:5,
          padding:"1px 5px",
          lineHeight:1.4,
          fontWeight:700,
        }}>
          {sorted==="asc"?"↑":sorted==="desc"?"↓":"↕"}
        </span>
      )}
    </span>
  </th>
);
const Td = ({children,style={}}) => (
  <td style={{padding:"11px 14px",fontSize:13.5,color:"var(--text-secondary)",borderBottom:"1px solid rgba(255,255,255,0.04)",...style}}>{children}</td>
);
const SnoTd = ({children}) => (
  <td style={{padding:"11px 14px",fontSize:13,fontWeight:800,color:"#ffffff",borderBottom:"1px solid rgba(255,255,255,0.04)",textAlign:"center",letterSpacing:"0.02em"}}>{children}</td>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({label,value,icon,color="#f5a623",sub,style={}}) => (
  <div className="stat-card" style={{"--card-accent":color,...style}}>
    <div style={{width:48,height:48,borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,display:"flex",alignItems:"center",justifyContent:"center",color,flexShrink:0}}>
      <Icon name={icon} size={22}/>
    </div>
    <div>
      <div style={{fontSize:28,fontWeight:800,color:"var(--text-primary)",lineHeight:1,letterSpacing:"-1px",fontFamily:"var(--font-display)"}}>{value}</div>
      <div style={{fontSize:13,color:"var(--text-primary)",marginTop:5,fontWeight:700,letterSpacing:"0.02em"}}>{label}</div>  
      {sub && <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{sub}</div>}
    </div>
  </div>
);

// ─── Export helpers ───────────────────────────────────────────────────────────
const exportCSV = (rows, cols, filename) => {
  const header = cols.map(c=>c.label).join(",");
  const body = rows.map(r => cols.map(c=>`"${(r[c.key]||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([header+"\n"+body],{type:"text/csv"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
};

// ─── App ──────────────────────────────────────────────────────────────────────
const LoginTypewriter = () => {
  const words = ["Maintenance Records","Vehicle Status","Vendor Details","Service History","Repair Costs","Scrap Records","Parts Issued","Purchase History"];
  const { display, blink } = useTypewriter(words);
  return (
    <span style={{fontSize:22,fontWeight:800,fontFamily:"var(--font-display)",letterSpacing:"-0.3px"}}>
      <span style={{color:"#ffffff"}}>Track </span>
      <span style={{color:"#D90A2C"}}>{display}</span>
      <span style={{color:"#D90A2C",opacity:blink?1:0}}>|</span>
      <br/>
      <span style={{color:"#ffffff",fontWeight:800}}>using </span>
      <span style={{color:"#ffffff",fontWeight:800}}>Fleet</span>
      <span style={{color:"#f5a623",fontWeight:800}}>Track</span>
    </span>
  );
};

function LoginPage({onLogin}) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [shaking,setShaking]=useState(false);
  const [company,setCompany]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async e=>{
    e.preventDefault();
    if(!company){setError("Please select a company first");return;}
    setLoading(true);
    const users=await getUsers();
    const match=users.find(u=>u.username===username&&u.password===password);
    if(match){ onLogin(company); }
    else {
      setError("Invalid username or password");
      setShaking(true);
      setLoading(false);
      setTimeout(()=>setShaking(false),500);
    }
  };
  return (
    <div style={{height:"100vh",width:"100vw",background:"var(--bg-base)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-body)",position:"fixed",inset:0}}>
      <StyleTag/>
      {/* Background decoration */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle, rgba(15,32,64,0.6) 0%, transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle, rgba(10,22,40,0.5) 0%, transparent 70%)"}}/>
        <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:900,height:2,background:"linear-gradient(90deg,transparent,rgba(15,32,64,0.4),transparent)"}}/>
      </div>

      <div style={{
        animation: shaking?"shake 0.4s ease":"scaleIn 0.3s ease both",
        background:"var(--bg-card)",
        border:"1px solid var(--border-bright)",
        borderRadius:20,
        padding:"28px 32px",
        width:"100%",
        maxWidth:460,
        boxShadow:"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
        position:"relative",
        zIndex:1,
      }}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#f5a623,#e8920a)",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(245,166,35,0.4)",marginBottom:16}}>
            <Icon name="truck" size={28} style={{color:"#0d0f14"}}/>
          </div>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"var(--font-display)",letterSpacing:"-0.5px"}}>
            <span style={{color:"#ffffff"}}>Fleet</span><span style={{color:"#f5a623"}}>Track</span>
          </div>
          <div style={{marginTop:6,minHeight:28}}>
            <LoginTypewriter/>
          </div>

          {/* Company selector */}
          <div style={{marginTop:12,marginBottom:4}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Select your company</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {id:"aysis",label:"Aysis International",sub:"Waste Management Pvt Ltd"},
                {id:"altaspak",label:"AltasPak",sub:"Waste Management Pvt Ltd"},
              ].map(c=>(
                <button key={c.id} type="button" onClick={()=>{setCompany(c.id);setError("");}}
                  style={{
                    display:"flex",alignItems:"center",gap:14,
                    padding:"9px 14px",borderRadius:12,
                    border:`1px solid ${company===c.id?"var(--accent)":"var(--border-bright)"}`,
                    background:company===c.id?"rgba(245,166,35,0.08)":"var(--bg-elevated)",
                    cursor:"pointer",fontFamily:"var(--font-body)",transition:"all 0.2s",
                    boxShadow:company===c.id?"0 0 0 1px rgba(245,166,35,0.2), 0 4px 16px rgba(245,166,35,0.08)":"none",
                    textAlign:"left",width:"100%",
                  }}>
                  {/* Radio circle */}
                  <div style={{
                    width:20,height:20,borderRadius:"50%",flexShrink:0,
                    border:`2px solid ${company===c.id?"var(--accent)":"var(--border-bright)"}`,
                    background:company===c.id?"var(--accent)":"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.2s",
                  }}>
                    {company===c.id&&<div style={{width:7,height:7,borderRadius:"50%",background:"#0d0f14"}}/>}
                  </div>
                  {/* Icon */}
                  <div style={{
                    width:42,height:42,borderRadius:9,flexShrink:0,
                    background:"var(--bg-card)",
                    border:`1px solid ${company===c.id?"rgba(245,166,35,0.3)":"var(--border)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    overflow:"hidden",
                    transition:"all 0.2s",
                  }}>
                    <img
                      src={c.id==="aysis"?"./Aysis International Waste Management.png":"./Pak Altas white.png"}
                      alt={c.label}
                      style={{width:38,height:38,objectFit:"contain"}}
                      onError={e=>e.target.style.display="none"}
                    />
                  </div>
                  {/* Text */}
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:company===c.id?"var(--accent)":"var(--text-primary)",lineHeight:1.2}}>{c.label}</div>
                    <div style={{fontSize:11.5,color:"var(--text-muted)",marginTop:3,fontWeight:400}}>{c.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:"linear-gradient(90deg,transparent,var(--border-bright),transparent)",marginBottom:16}}/>

        <div style={{fontSize:15,fontWeight:700,color:"var(--text-primary)",marginBottom:14,textAlign:"center"}}>Sign in to your account</div>

        <form onSubmit={submit}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text-secondary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Username</label>
            <input value={username} onChange={e=>{setUsername(e.target.value);setError("");}}
              placeholder="Enter your username"
              className="form-input"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,fontSize:14,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
          </div>

          <div style={{marginBottom:6}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text-secondary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Password</label>
            <div style={{position:"relative"}}>
              <input value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
                type={showPwd?"text":"password"}
                placeholder="Enter your password"
                className="form-input"
                style={{width:"100%",padding:"11px 40px 11px 14px",borderRadius:10,fontSize:14,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
              <button type="button" onClick={()=>setShowPwd(v=>!v)}
                style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:12,padding:0}}>
                {showPwd?"Hide":"Show"}
              </button>
            </div>
          </div>

          {error&&(
            <div style={{marginBottom:14,padding:"9px 14px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:8,fontSize:13,color:"var(--red)",display:"flex",alignItems:"center",gap:8}}>
              <Icon name="alert" size={14}/> {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",border:"none",borderRadius:10,background:"linear-gradient(135deg,#f5a623,#e8920a)",color:"#0d0f14",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"var(--font-display)",boxShadow:"0 4px 20px rgba(245,166,35,0.4)",marginTop:8,letterSpacing:"0.02em",opacity:loading?0.8:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {loading?(
              <>
                <div style={{width:18,height:18,border:"2px solid rgba(13,15,20,0.3)",borderTop:"2px solid #0d0f14",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                Signing in...
              </>
            ):"Sign In"}
          </button>
        </form>

        <div style={{marginTop:16,textAlign:"center",fontSize:11,color:"var(--text-muted)"}}>
          <span style={{color:"#ffffff",fontWeight:800}}>Fleet</span><span style={{color:"#f5a623",fontWeight:800}}>Track</span> v1.0 · Admin Access Only
        </div>
      </div>

      <style>{`
        @keyframes companyShimmer {
  0%   { opacity: 1; text-shadow: 0 0 0px rgba(245,166,35,0); }
  25%  { opacity: 0.85; text-shadow: 0 0 30px rgba(245,166,35,1), 0 0 60px rgba(245,166,35,0.6); }
  50%  { opacity: 1; text-shadow: 0 0 0px rgba(245,166,35,0); }
  75%  { opacity: 0.85; text-shadow: 0 0 30px rgba(245,166,35,1), 0 0 60px rgba(245,166,35,0.6); }
  100% { opacity: 1; text-shadow: 0 0 0px rgba(245,166,35,0); }
}
@keyframes shake {
          0%,100%{ transform:translateX(0); }
          20%    { transform:translateX(-8px); }
          40%    { transform:translateX(8px); }
          60%    { transform:translateX(-6px); }
          80%    { transform:translateX(6px); }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ChangePwdModal({onClose}) {
  const [oldPwd,setOldPwd]=useState("");
  const [newPwd,setNewPwd]=useState("");
  const [confirmPwd,setConfirmPwd]=useState("");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState(false);

  const submit=async e=>{
    e.preventDefault();
    const users=await getUsers();
    const userIndex=users.findIndex(u=>u.username==="Asim"&&u.password===oldPwd);
    if(userIndex===-1){ setError("Old password is incorrect"); return; }
    if(newPwd.length<4){ setError("New password must be at least 4 characters"); return; }
    if(newPwd!==confirmPwd){ setError("New passwords do not match"); return; }
    users[userIndex].password=newPwd;
    await saveUsers(users);
    setSuccess(true);
    setTimeout(()=>onClose(),1500);
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      {success?(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.4)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--green)",marginBottom:12}}>
            <Icon name="check" size={24}/>
          </div>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text-primary)"}}>Password changed successfully</div>
        </div>
      ):(
        <form onSubmit={submit}>
          <Field label="Old Password" required>
            <Input type="password" value={oldPwd} onChange={e=>{setOldPwd(e.target.value);setError("");}} required/>
          </Field>
          <Field label="New Password" required>
            <Input type="password" value={newPwd} onChange={e=>{setNewPwd(e.target.value);setError("");}} required/>
          </Field>
          <Field label="Confirm New Password" required>
            <Input type="password" value={confirmPwd} onChange={e=>{setConfirmPwd(e.target.value);setError("");}} required/>
          </Field>
          {error&&(
            <div style={{marginBottom:14,padding:"9px 14px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:8,fontSize:13,color:"var(--red)",display:"flex",alignItems:"center",gap:8}}>
              <Icon name="alert" size={14}/> {error}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
            <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
            <button type="submit" className="action-btn-primary">Update Password</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
function useTypewriter(words) {
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout;
    if (typing) {
      if (display.length < current.length) {
        timeout = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setTyping(false), 1200);
      }
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(display.slice(0, -1)), 40);
      } else {
        setWordIndex((wordIndex + 1) % words.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [display, typing, wordIndex]);

  useEffect(() => {
    const b = setInterval(() => setBlink(v => !v), 500);
    return () => clearInterval(b);
  }, []);

  return { display, blink };
}
export default function App() {
  useEffect(()=>seed(),[]);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [authed, setAuthed] = useState(()=>sessionStorage.getItem("vpt_auth")==="1");
  const [showChangePwd, setShowChangePwd] = useState(false);

    

const navItems = [
    {id:"dashboard",label:"Dashboard",icon:"dashboard"},
    {id:"purchase",label:"Parts Purchase Details",icon:"package"},
    {id:"issued",label:"Parts Issued",icon:"clipboard"},
    {id:"movements",label:"Maintenance",icon:"wrench"},
    {id:"repair",label:"Repair & Maintenance Register",icon:"wrench"},
    {id:"scrap",label:"Scrap Register",icon:"trash"},
    {id:"vendors",label:"Maintenance Vendors Info",icon:"users"},
    {id:"scrapbill",label:"Scrap Bill",icon:"clipboard"},
    {id:"vmf",label:"Vehicle Maintenance Form",icon:"truck"},
    {id:"search",label:"Global Search",icon:"search"},
  ];

  const [pageKey, setPageKey] = useState(page);
  const [fading, setFading] = useState(false);

  const navigateTo = (newPage) => {
    if(newPage === page) return;
    setFading(true);
    setTimeout(() => {
      setPage(newPage);
      setPageKey(newPage);
      setTimeout(() => setFading(false), 16);
    }, 120);
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <DashboardPage/>;
      case "issued": return <IssuedPage/>;
      case "movements": return <MovementsPage/>;
      case "vehicles": return <VehiclesPage/>;
      case "vendors": return <VendorsPage/>;
      case "purchase": return <PurchasePage/>;
      case "repair": return <RepairPage/>;
      case "scrap": return <ScrapPage/>;
      case "scrapbill": return <ScrapBillPage/>;
      case "vmf": return <VehicleMaintenanceForm/>;
      case "search": return <SearchPage initialQuery={globalSearch}/>;
      default: return <DashboardPage/>;
    }
  };

  if (!authed) return <LoginPage onLogin={(company)=>{sessionStorage.setItem("vpt_auth","1");sessionStorage.setItem("vpt_company",company);setAuthed(true);}}/>;

  return (
    <div style={{display:"flex",height:"100vh",width:"100vw",fontFamily:"var(--font-body)",background:"var(--bg-base)",overflow:"hidden",position:"fixed",top:0,left:0}}>
      <StyleTag/>
      <ToastContainer/>

      {/* Sidebar */}
      <aside style={{width:sidebarOpen?252:85,flexShrink:0,background:"var(--bg-surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",transition:"width 0.22s cubic-bezier(0.4,0,0.2,1)",overflow:"hidden",position:"relative"}}>
        {/* Decorative top bar */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg, var(--accent), #e8920a, #f5a623)",opacity:0.8}}/>

        {/* Logo area */}
        <div style={{padding:"20px 14px 16px",display:"flex",alignItems:"center",gap:10,minHeight:68}}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#f5a623,#e8920a)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 16px rgba(245,166,35,0.4)"}}>
            <Icon name="truck" size={19} style={{color:"#0d0f14"}}/>
          </div>
          {sidebarOpen && (
            <div style={{overflow:"hidden",flex:1}}>
              <div style={{fontWeight:900,fontSize:18,color:"#ffffff",fontFamily:"var(--font-display)",letterSpacing:"-0.5px",lineHeight:1.2}}>
                Fleet<span style={{color:"var(--accent)"}}>Track</span>
              </div>
              <div style={{fontSize:11,color:"var(--text-muted)",whiteSpace:"nowrap",marginTop:1}}>Parts Management</div>
            </div>
          )}
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",flexShrink:0,padding:4,marginLeft:sidebarOpen?"auto":"0",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,transition:"color 0.15s"}}>
            <Icon name="menu" size={17}/>
          </button>
        </div>

        {/* Live indicator */}
        {sidebarOpen && (
          <div style={{marginBottom:8,padding:"0 14px"}}>
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,padding:"7px 12px",display:"flex",alignItems:"center",gap:8}}>
              <span className="glow-dot"/>
              <span style={{fontSize:11.5,color:"var(--text-secondary)"}}>System live</span>
            </div>
          </div>
        )}

        <nav style={{flex:1,padding:"6px 8px",overflowY:"auto",overflowX:"hidden"}} className="scrollbar-dark">
          {sidebarOpen && <div style={{fontSize:10.5,fontWeight:700,color:"var(--text-muted)",padding:"8px 8px 4px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Navigation</div>}
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>navigateTo(item.id)}
              className={`nav-btn${page===item.id?" active":""}`}
              title={!sidebarOpen?item.label:""}>
              <Icon name={item.icon} size={17} style={{flexShrink:0}}/>
              {sidebarOpen && <span style={{fontSize:13.5}}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={{padding:"12px 14px",borderTop:"1px solid var(--border)"}}>
            <div style={{fontSize:11,color:"var(--text-muted)"}}>Vehicle Parts Maintenance v1.0</div>
            <div style={{fontSize:11,color:"var(--text-muted)",marginTop:4}}>Designed & Developed by <span style={{color:"var(--accent)",fontWeight:700}}>Ammar Ansari</span></div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <header style={{background:"var(--bg-surface)",borderBottom:"1px solid var(--border)",padding:"0 24px",height:62,display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
            <img
              src={sessionStorage.getItem("vpt_company")==="aysis" ? "./Aysis International Waste Management.png" : "./Pak Altas white.png"}
              alt="logo"
              style={{width:80,height:80,objectFit:"contain"}}
              onError={e=>e.target.style.display="none"}
            />
            <div style={{fontSize:26,fontWeight:800,fontFamily:"var(--font-display)",letterSpacing:"-0.3px",position:"relative"}}
  onMouseMove={e=>{
    const el = document.getElementById("company-glow");
    if(!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.left = (e.clientX - rect.left) + "px";
    el.style.top = (e.clientY - rect.top) + "px";
    el.style.opacity = "1";
  }}
  onMouseLeave={()=>{
    const el = document.getElementById("company-glow");
    if(el) el.style.opacity = "0";
  }}>
  <div id="company-glow" style={{
    position:"absolute",
    width:180,
    height:60,
    borderRadius:"50%",
    background:"radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 50%, transparent 75%)",
    transform:"translate(-50%, -50%)",
    pointerEvents:"none",
    opacity:0,
    transition:"opacity 0.3s ease, left 0.05s linear, top 0.05s linear",
    zIndex:0,
    filter:"blur(12px)",
    mixBlendMode:"screen",
  }}/>
  <span style={{display:"inline-block",color:"#94a3b8",position:"relative",zIndex:1}}>
    {(sessionStorage.getItem("vpt_company")==="aysis" ? "Aysis International Waste Management Com Pvt Ltd" : "AltasPak Waste Management Com Pvt Ltd").split(" ").map((word,i)=>(
      <span key={i} className="company-word">{word}{" "}</span>
    ))}
  </span>
</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}}>
            <div style={{fontSize:12.5,color:"var(--text-muted)",fontWeight:400}}>
              {new Date().toLocaleDateString("en-PK",{weekday:"short",year:"numeric",month:"short",day:"numeric"})}
            </div>
            <div style={{width:32,height:32,borderRadius:8,background:"var(--accent-dim)",border:"1px solid var(--accent-glow)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)"}}>
  <Icon name="bolt" size={15}/>
</div>
<button onClick={()=>setShowChangePwd(true)}
  onMouseEnter={e=>{e.currentTarget.style.background="var(--bg-hover)";e.currentTarget.style.borderColor="var(--border-bright)";e.currentTarget.style.color="var(--text-primary)";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.3)";}}
  onMouseLeave={e=>{e.currentTarget.style.background="var(--bg-elevated)";e.currentTarget.style.borderColor="var(--border-bright)";e.currentTarget.style.color="var(--text-secondary)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
  style={{padding:"7px 16px",borderRadius:8,border:"1px solid var(--border-bright)",background:"var(--bg-elevated)",color:"var(--text-secondary)",cursor:"pointer",fontSize:12,fontFamily:"var(--font-body)",fontWeight:600,transition:"all 0.18s",display:"flex",alignItems:"center",gap:6}}>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  Change Password
</button>
<button onClick={()=>{sessionStorage.removeItem("vpt_auth");setAuthed(false);}}
  onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.15)";e.currentTarget.style.borderColor="rgba(248,113,113,0.6)";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(248,113,113,0.2)";}}
  onMouseLeave={e=>{e.currentTarget.style.background="rgba(248,113,113,0.08)";e.currentTarget.style.borderColor="rgba(248,113,113,0.3)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
  style={{padding:"7px 16px",borderRadius:8,border:"1px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.08)",color:"var(--red)",cursor:"pointer",fontSize:12,fontFamily:"var(--font-body)",fontWeight:600,transition:"all 0.18s",display:"flex",alignItems:"center",gap:6}}>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  Logout
</button>
{showChangePwd&&<ChangePwdModal onClose={()=>setShowChangePwd(false)}/>}
          </div>
        </header>

        {/* Page content */}
        <main style={{flex:1,overflow:"auto",padding:"24px 26px"}} className="scrollbar-dark">
          <div key={pageKey} style={{opacity:fading?0:1,transition:"opacity 0.18s ease-in-out"}}>
            {renderPage()}
          </div>
          <div style={{textAlign:"center",padding:"8px 0",fontSize:12,color:"var(--text-secondary)"}}>
            Designed & Developed by <span style={{color:"var(--accent)",fontWeight:800,textShadow:"0 0 12px rgba(245,166,35,0.8), 0 0 24px rgba(245,166,35,0.4)"}}>Ammar Ansari</span>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Page heading ─────────────────────────────────────────────────────────────


const LifecycleName = ({name, id, onOpen}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span style={{position:"relative",display:"inline-block"}}>
      <span
        onClick={()=>onOpen({name,id})}
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{cursor:"pointer",color:"var(--text-primary)",fontWeight:600,textDecoration:"underline",textDecorationColor:"rgba(245,166,35,0.4)",textUnderlineOffset:3,transition:"color 0.15s"}}
      >
        {name||"—"}
      </span>
      {hovered&&(
        <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:"var(--bg-elevated)",border:"1px solid var(--border-bright)",borderRadius:8,padding:"6px 10px",whiteSpace:"nowrap",zIndex:9999,pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
          <div style={{fontSize:11.5,color:"var(--text-primary)",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
            <Icon name="clock" size={12} style={{color:"var(--accent)"}}/>
            Click to view lifecycle history
          </div>
          <div style={{fontSize:10.5,color:"var(--text-muted)",marginTop:2}}>Tracks across all registers</div>
          <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",width:8,height:8,background:"var(--bg-elevated)",border:"1px solid var(--border-bright)",borderRadius:1,rotate:"45deg",clipPath:"polygon(100% 0,100% 100%,0 100%)"}}/>
        </div>
      )}
    </span>
  );
};

const LifecycleHint = () => (
  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text-muted)",padding:"6px 12px",background:"var(--bg-elevated)",border:"1px solid var(--border)",borderRadius:8,width:"fit-content",marginBottom:12}}>
    <Icon name="clock" size={13}/>
    <span>Click any <span style={{color:"var(--accent)",fontWeight:700}}>part name</span> to view its full lifecycle history</span>
  </div>
);

const PageHeading = ({title,sub}) => (
  <div style={{marginBottom:24}}>
    <h1 style={{margin:0,fontSize:32,fontWeight:900,color:"var(--text-primary)",fontFamily:"var(--font-display)",letterSpacing:"-1px"}}>{title}</h1>
    {sub && <p style={{margin:"6px 0 0",fontSize:13,color:"var(--text-muted)"}}>{sub}</p>}
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
function TypewriterHero() {
  const words = ["Maintenance Records","Vehicle Status","Vendor Details","Service History","Repair Costs","Scrap Records","Parts Issued","Purchase History"];
  const { display, blink } = useTypewriter(words);
  return (
    <div style={{marginBottom:24}}>
      <h1 style={{margin:0,fontSize:28,fontWeight:800,lineHeight:1.4,fontFamily:"var(--font-display)"}}>
        <span style={{color:"#ffffff"}}>Track </span>
        <span style={{color:"#D90A2C"}}>{display}</span>
        <span style={{color:"#D90A2C",opacity:blink?1:0,marginLeft:1}}>|</span>
        <span style={{color:"#ffffff",fontWeight:800}}> using </span>
        <span style={{color:"#ffffff",fontWeight:800}}>Fleet</span>
        <span style={{color:"#f5a623",fontWeight:800}}>Track</span>
      </h1>
    </div>
  );
}

function DashboardPage() {
  const [movements,setMovements]=useState([]);
  const [issued,setIssued]=useState([]);
  const [vehicles,setVehicles]=useState([]);
  const [repair,setRepair]=useState([]);
  const [purchase,setPurchase]=useState([]);
  useEffect(()=>{
    load('movements').then(setMovements);
    load('issued').then(setIssued);
    load('vehicles').then(setVehicles);
    load('repair').then(setRepair);
    load('purchase').then(setPurchase);
  },[]);

  const stats = {
    totalIssued: issued.length,
    active: movements.filter(m=>m.finalStatus==="Active"||m.finalStatus==="Reissued").length,
    underRepair: movements.filter(m=>m.finalStatus==="Under Repair"||m.finalStatus==="At Vendor").length,
    returned: movements.filter(m=>m.finalStatus==="Returned"||m.finalStatus==="Received after repair"||m.finalStatus==="Received without repair").length,
    totalRepairCost: repair.reduce((s,r)=>s+(Number(r.repairCost)||0),0),
    totalPurchaseSpend: purchase.reduce((s,r)=>s+(Number(r.purchaseAmount)||0),0),
  };

  const OVERDUE_DAYS = 7;
  const overdue = movements.filter(m=>{
    if(m.deleted) return false;
    if(m.finalStatus==="Returned"||m.finalStatus==="Received after repair"||m.finalStatus==="Received without repair"||m.finalStatus==="Scrapped") return false;
    const checkDate = m.dateOut||m.issueDate;
    if(!checkDate) return false;
    return (Date.now()-new Date(checkDate).getTime())/(1000*86400)>=OVERDUE_DAYS;
  });

  const overdueIssued = issued.filter(r=>{
    if(r.deleted) return false;
    if(!r.issueDate) return false;
    const alreadyTracked = movements.some(m=>m.partId===r.itemCode||m.partName===r.itemName);
    return (Date.now()-new Date(r.issueDate).getTime())/(1000*86400)>=OVERDUE_DAYS;
  });

  const recent = [...movements].sort((a,b)=>b.issuedDate>a.issuedDate?1:-1).slice(0,8);
const statCards = [
    {label:"Parts Issued",value:stats.totalIssued,icon:"clipboard",color:"#a78bfa"},
    {label:"Active Parts",value:stats.active,icon:"package",color:"#34d399"},
    {label:"Under Repair",value:stats.underRepair,icon:"wrench",color:"#fb923c"},
    {label:"Parts Returned",value:stats.returned,icon:"check",color:"#4f8ef7"},
    {label:"Total Repair Cost",value:`PKR ${stats.totalRepairCost.toLocaleString()}`,icon:"chart",color:"#f87171"},
  ];

  const statCards2 = [
    {label:"Total money spent on purchasing parts",value:`PKR ${stats.totalPurchaseSpend.toLocaleString()}`,icon:"download",color:"#22d3ee"},
  ];

  return (
    <div>
      <TypewriterHero />
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:14}}>
        {statCards.map((s,i)=>(
          <StatCard key={s.label+s.value} {...s} style={{animationDelay:`${i*0.06}s`,minHeight:140}}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:28}}>
        {statCards2.map((s,i)=>(
          <StatCard key={s.label} {...s} style={{animationDelay:`${(i+5)*0.06}s`,minHeight:140}}/>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {/* Recent activity */}
        <div style={{background:"var(--bg-card)",borderRadius:14,border:"1px solid var(--border)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <h2 style={{margin:0,fontSize:14,fontWeight:700,color:"var(--text-primary)",fontFamily:"var(--font-display)"}}>Recent Activity</h2>
            <span style={{fontSize:11,color:"var(--text-muted)"}}>Last {recent.length} records</span>
          </div>
          <div style={{maxHeight:340,overflowY:"auto"}} className="scrollbar-dark">
            {recent.length===0&&<div style={{padding:20,color:"var(--text-muted)",fontSize:13}}>No activity yet.</div>}
            {recent.map(m=>(
              <div key={m.id} style={{padding:"11px 18px",borderBottom:"1px solid rgba(255,255,255,0.03)",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background 0.12s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <div>
                  <div style={{fontSize:13.5,fontWeight:600,color:"var(--text-primary)"}}>{m.itemName||m.partName}</div>
                  <div style={{fontSize:11.5,color:"var(--text-muted)",marginTop:2}}>{m.vehicleNumber} · {m.itemCode||m.partId}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <Badge status={m.finalStatus||m.status} cfg={m.finalStatus?FINAL_STATUS_CFG:STATUS_CFG}/>
                  <div style={{fontSize:11,color:"var(--text-muted)",marginTop:4}}>{m.issuedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue alerts */}
        <div style={{background:"var(--bg-card)",borderRadius:14,border:"1px solid var(--border)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:7,background:"var(--red-dim)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--red)"}}>
              <Icon name="alert" size={14}/>
            </div>
            <h2 style={{margin:0,fontSize:14,fontWeight:700,color:"var(--text-primary)",fontFamily:"var(--font-display)",flex:1}}>
              Overdue Parts & Repairs
            </h2>
            {(overdue.length+overdueIssued.length)>0&&(
              <span style={{background:"var(--red-dim)",color:"var(--red)",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,border:"1px solid rgba(248,113,113,0.3)"}}>
                {overdue.length+overdueIssued.length} flagged
              </span>
            )}
          </div>


          <div style={{maxHeight:360,overflowY:"auto"}} className="scrollbar-dark">
            {(overdue.length+overdueIssued.length)===0&&(
              <div style={{padding:24,fontSize:13,color:"var(--green)",display:"flex",alignItems:"center",gap:8}}>
                <Icon name="check" size={16}/> All parts accounted for. No overdue items.
              </div>
            )}

            {/* Maintenance overdue */}
            {overdue.map(m=>{
              const checkDate = m.dateOut||m.issueDate;
              const days = Math.floor((Date.now()-new Date(checkDate).getTime())/(1000*86400));
              const isCritical = days>=14;
              return (
                <div key={m.id} style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.03)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:isCritical?"rgba(248,113,113,0.12)":"rgba(251,146,60,0.1)",border:`1px solid ${isCritical?"rgba(248,113,113,0.3)":"rgba(251,146,60,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:isCritical?"var(--red)":"#fb923c"}}>
                      <Icon name="wrench" size={14}/>
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.partName||m.itemName||"—"}</div>
                      <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2,display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{color:"var(--accent)",fontWeight:600}}>{m.vehicleNumber||"—"}</span>
                        <span>·</span>
                        <span>{m.finalStatus||m.status||"—"}</span>
                        {m.vendorName&&<><span>·</span><span>{m.vendorName}</span></>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <span style={{background:isCritical?"rgba(248,113,113,0.15)":"rgba(251,146,60,0.12)",color:isCritical?"var(--red)":"#fb923c",border:`1px solid ${isCritical?"rgba(248,113,113,0.35)":"rgba(251,146,60,0.3)"}`,borderRadius:6,padding:"3px 9px",fontSize:11.5,fontWeight:700,whiteSpace:"nowrap"}}>
                      {days}d overdue
                    </span>
                    <span style={{fontSize:10,color:"var(--text-muted)"}}>Maintenance</span>
                  </div>
                </div>
              );
            })}

            {/* Issued but not returned overdue */}
            {overdueIssued.map(r=>{
              const days = Math.floor((Date.now()-new Date(r.issueDate).getTime())/(1000*86400));
              const isCritical = days>=14;
              return (
                <div key={r.id} style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.03)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:isCritical?"rgba(248,113,113,0.12)":"rgba(167,139,250,0.1)",border:`1px solid ${isCritical?"rgba(248,113,113,0.3)":"rgba(167,139,250,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:isCritical?"var(--red)":"var(--purple)"}}>
                      <Icon name="package" size={14}/>
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.itemName||"—"}</div>
                      <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2,display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{color:"var(--accent)",fontWeight:600}}>{r.vehicleNumber||"—"}</span>
                        <span>·</span>
                        <span>Issued to {r.issuedTo||"—"}</span>
                        {r.itemCode&&<><span>·</span><code style={{fontSize:10,color:"var(--cyan)"}}>{r.itemCode}</code></>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <span style={{background:isCritical?"rgba(248,113,113,0.15)":"rgba(167,139,250,0.12)",color:isCritical?"var(--red)":"var(--purple)",border:`1px solid ${isCritical?"rgba(248,113,113,0.35)":"rgba(167,139,250,0.3)"}`,borderRadius:6,padding:"3px 9px",fontSize:11.5,fontWeight:700,whiteSpace:"nowrap"}}>
                      {days}d overdue
                    </span>
                    <span style={{fontSize:10,color:"var(--text-muted)"}}>Not returned</span>
                  </div>
                </div>
              );
            })}
          </div>

          {(overdue.length+overdueIssued.length)>0&&(
            <div style={{padding:"8px 18px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"var(--text-muted)"}}>{overdue.length} repair · {overdueIssued.length} not returned</span>
              <span style={{fontSize:11,color:"var(--text-muted)"}}>Threshold: {OVERDUE_DAYS} days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Issued Parts ──────────────────────────────────────────────────────────────
function IssuedPage() {
  const [records,setRecords] = useState([]);
  useEffect(()=>{ load('issued').then(setRecords); },[]);
  const [modal,setModal] = useState(null);
  const [search,setSearch] = useState("");
  const [sort,setSort] = useState({col:"issueDate",dir:"desc"});
  const [confirmId,setConfirmId] = useState(null);
  const vehicles = [];
  const active = records;

  const [lifecycle, setLifecycle] = useState(null);
  const cols = [
    {key:"vehicleNumber",label:"Vehicle No."},
    {key:"vehicleGroup",label:"Vehicle Group"},
    {key:"itemName",label:"Item Name"},
    {key:"itemCode",label:"Item Code"},
    {key:"qtyIssued",label:"Qty Issued"},
    {key:"issuedCondition",label:"Issued Condition"},
    {key:"odometerReading",label:"Odometer Reading (Kms)"},
    {key:"serialNo",label:"Part Serial No"},
    {key:"driverName",label:"Driver Name"},
    {key:"issueDate",label:"Issue Date"},
    {key:"gpNumber",label:"GP Number"},
    {key:"issuedBy",label:"Issued By"},
    {key:"issuedTo",label:"Issued To"},
    {key:"warrantyStatus",label:"Warranty Status"},
    {key:"warrantyPeriod",label:"Warranty Period"},
  ];

  const filtered = useMemo(()=>{
    let rows = active.filter(r=>{
      const q=search.toLowerCase();
      return !q||[r.vehicleNumber,r.itemName,r.itemCode,r.gpNumber,r.issuedBy,r.issuedTo].some(f=>(f||"").toLowerCase().includes(q));
    });
    return [...rows].sort((a,b)=>{
      const av=a[sort.col]||"",bv=b[sort.col]||"";
      const an=Number(av),bn=Number(bv);
      const isNum=!isNaN(an)&&!isNaN(bn)&&av!==""&&bv!=="";
      const cmp=isNum?(an-bn):av.toString().localeCompare(bv.toString());
      return sort.dir==="asc"?cmp:-cmp;
    });
  },[active,search,sort]);

  const sortBy = col=>setSort(s=>({col,dir:s.col===col&&s.dir==="asc"?"desc":"asc"}));

const save_ = async (data)=>{
    if(modal.mode==="add") {
      const newRecord = {...data, id:uid(), deleted:false};
      await save('issued', [newRecord]);
      setRecords(r=>[...r, newRecord]);
    } else {
      await save('issued', [data]);
      setRecords(r=>r.map(x=>x.id===data.id?data:x));
    }
    toast("Record saved successfully", "success");
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };
  const blank={vehicleId:"",vehicleNumber:"",vehicleGroup:"",itemName:"",itemCode:"",partId:"",serialNo:"",qtyIssued:"",issuedCondition:"",odometerReading:"",driverName:"",issueDate:today(),gpNumber:"",issuedBy:"",issuedTo:"",warrantyStatus:"",warrantyPeriod:""};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Parts Issued" sub={`${active.length} total records`}/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={()=>exportCSV(filtered,cols,"parts-issued.csv")} className="action-btn-secondary"><Icon name="download" size={15}/> Export</button>
          <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary"><Icon name="plus" size={15}/> New Issue</button>
        </div>
      </div>
      <LifecycleHint/>
      <div className="table-wrapper">
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by vehicle, item, code, GP..."
            className="search-input" style={{width:"100%",maxWidth:380,padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
        </div>
        {records.length===0&&<Skeleton/>}
        <div style={{overflowX:"auto",display:records.length===0?"none":"block"}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><Th>S.No</Th>{cols.map(c=><Th key={c.key} onClick={["issueDate"].includes(c.key)?()=>sortBy(c.key):undefined} sorted={sort.col===c.key?sort.dir:null}>{c.label}</Th>)}<Th>Actions</Th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={cols.length+1} style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No records found.</td></tr>}
              {filtered.map((r,i)=>(
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                  <SnoTd>{i+1}</SnoTd>
                  {cols.map(c=>(
                    <Td key={c.key} style={c.key==="vehicleNumber"?{color:"var(--accent)",fontWeight:700}:{}}>
                      {c.key==="itemName"
                        ? <LifecycleName name={r.itemName} id={r.itemCode} onOpen={setLifecycle}/>
                        : c.key==="itemCode"&&r[c.key]?<code style={{fontSize:12,background:"var(--bg-elevated)",padding:"2px 7px",borderRadius:5,color:"var(--cyan)",border:"1px solid rgba(34,211,238,0.2)"}}>{r[c.key]}</code>:r[c.key]||"—"}
                    </Td>
                  ))}
                  <td style={{padding:"8px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>setModal({mode:"edit",data:{...r}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",marginRight:8,padding:4}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>setConfirmId(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"9px 16px",borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-muted)"}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
      </div>
      {confirmId&&<ConfirmModal onConfirm={()=>del(confirmId)} onClose={()=>setConfirmId(null)}/>}
      {modal&&<IssuedModal mode={modal.mode} data={modal.data} vehicles={vehicles} onSave={save_} onClose={()=>setModal(null)}/>}
      {lifecycle&&<PartLifecycleModal partName={lifecycle.name} partId={lifecycle.id} onClose={()=>setLifecycle(null)}/>}
    </div>
  );
}

function IssuedModal({mode,data,vehicles,onSave,onClose}) {
  const [form,setForm]=useState(data);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();onSave(form);};
  return (
    <Modal title={mode==="add"?"New Parts Issue":"Edit Issue Record"} onClose={onClose}>
      <form onSubmit={submit}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Field label="Vehicle No" required><Input value={form.vehicleNumber||""} onChange={e=>set("vehicleNumber",e.target.value)} placeholder="e.g. TRK-001" required/></Field>
          <Field label="Vehicle Group"><Input value={form.vehicleGroup||""} onChange={e=>set("vehicleGroup",e.target.value)} placeholder="e.g. Mini Tippers"/></Field>
          <Field label="Part Name" required><Input value={form.itemName} onChange={e=>set("itemName",e.target.value)} required/></Field>
          <Field label="Code" required><Input value={form.itemCode} onChange={e=>set("itemCode",e.target.value)} required/></Field>
          <Field label="Part ID"><Input value={form.partId||""} onChange={e=>set("partId",e.target.value)}/></Field>
          <Field label="Serial No"><Input value={form.serialNo||""} onChange={e=>set("serialNo",e.target.value)}/></Field>
          <Field label="Qty Issued"><Input type="number" min="1" value={form.qtyIssued||""} onChange={e=>set("qtyIssued",e.target.value)} placeholder="e.g. 1"/></Field>
          <Field label="Issued Condition">
            <Select value={form.issuedCondition||""} onChange={e=>set("issuedCondition",e.target.value)}>
              <option value="">Select...</option>
              <option value="New">New</option>
              <option value="Repaired">Repaired</option>
              <option value="Used">Used</option>
            </Select>
          </Field>
          <Field label="Odometer Reading (Kms)"><Input value={form.odometerReading||""} onChange={e=>set("odometerReading",e.target.value)} placeholder="e.g. 45000"/></Field>
          <Field label="Driver Name"><Input value={form.driverName||""} onChange={e=>set("driverName",e.target.value)} placeholder="Driver name"/></Field>
          <Field label="Issue Date" required><Input type="text" value={form.issueDate} onChange={e=>set("issueDate",e.target.value)} placeholder="e.g. 1-Dec-26" required/></Field>
          <Field label="GP Number"><Input value={form.gpNumber} onChange={e=>set("gpNumber",e.target.value)}/></Field>
          <Field label="Issued By"><Input value={form.issuedBy} onChange={e=>set("issuedBy",e.target.value)}/></Field>
          <Field label="Issued To"><Input value={form.issuedTo} onChange={e=>set("issuedTo",e.target.value)}/></Field>
          <Field label="Warranty Status">
            <Select value={form.warrantyStatus||""} onChange={e=>set("warrantyStatus",e.target.value)}>
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not Known">Not Known</option>
              <option value="To ask from Vendor">To ask from Vendor</option>
            </Select>
          </Field>
          <Field label="Warranty Period">
            <Select value={form.warrantyPeriod||""} onChange={e=>set("warrantyPeriod",e.target.value)}>
              <option value="">Select...</option>
              <option value="No Warranty">No Warranty</option>
              <option value="1 Week">1 Week</option>
              <option value="2 Weeks">2 Weeks</option>
              <option value="3 Weeks">3 Weeks</option>
              <option value="1 Month">1 Month</option>
              <option value="3 Month">3 Month</option>
              <option value="6 Month">6 Month</option>
              <option value="9 Month">9 Month</option>
              <option value="1 Year">1 Year</option>
              <option value="15 Month">15 Month</option>
              <option value="18 Month">18 Month</option>
              <option value="21 Month">21 Month</option>
              <option value="2 Years">2 Years</option>
              <option value="More than 2 Years">More than 2 Years</option>
            </Select>
          </Field>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
          <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
          <button type="submit" className="action-btn-primary">Save Record</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Maintenance Tracking ─────────────────────────────────────────────────────
function MovementsPage() {
  const [records,setRecords]=useState([]);
  useEffect(()=>{ load('movements').then(setRecords); },[]);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("");
  const [sort,setSort]=useState({col:"issueDate",dir:"desc"});
  const [confirmId,setConfirmId]=useState(null);
  const vehicles=[];
  const vendors=[];
  const active=records;

  const [lifecycle, setLifecycle] = useState(null);
  const filtered=useMemo(()=>{
    let rows=active.filter(r=>{
      const q=search.toLowerCase();
      const matchSearch=!q||[r.vehicleNumber,r.partName,r.partId,r.status,r.finalStatus,r.issueType].some(f=>(f||"").toLowerCase().includes(q));
      const matchStatus=!filterStatus||r.finalStatus===filterStatus;
      return matchSearch&&matchStatus;
    });
    return [...rows].sort((a,b)=>{
      const av=a[sort.col]||"",bv=b[sort.col]||"";
      const an=Number(av),bn=Number(bv);
      const isNum=!isNaN(an)&&!isNaN(bn)&&av!==""&&bv!=="";
      const cmp=isNum?(an-bn):av.toString().localeCompare(bv.toString());
      return sort.dir==="asc"?cmp:-cmp;
    });
  },[active,search,sort,filterStatus]);

  const filterChips=[
    {s:"Active",color:"#34d399"},{s:"Reissued",color:"#22d3ee"},{s:"Under Repair",color:"#fb923c"},
    {s:"At Vendor",color:"#f5a623"},{s:"Scrapped",color:"#f87171"},{s:"Warranty Claim",color:"#a78bfa"},
  ];

  const exportCols=[
    {key:"sno",label:"S.No"},{key:"vehicleNumber",label:"Vehicle No"},{key:"partName",label:"Part Name"},
    {key:"partId",label:"Part ID"},{key:"qty",label:"Qty"},{key:"issueDate",label:"Issue Date"},
    {key:"issuedCondition",label:"Issued Condition"},{key:"returnedDate",label:"Returned Date"},
    {key:"returnedCondition",label:"Returned Condition"},{key:"actionTaken",label:"Action Taken"},
    {key:"reIssuedToVehicle",label:"Re-Issued To Vehicle"},
    {key:"finalStatus",label:"Final Status"},
  ];
  const exportRows=filtered.map((r,i)=>({...r,sno:i+1}));
  const sortBy=col=>setSort(s=>({col,dir:s.col===col&&s.dir==="asc"?"desc":"asc"}));
  const save_=async(data)=>{
    if(modal.mode==="add"){
      const newRecord={...data,id:uid(),deleted:false};
      await save('movements',[newRecord]);
      setRecords(r=>[...r,newRecord]);
    } else {
      await save('movements',[data]);
      setRecords(r=>r.map(x=>x.id===data.id?data:x));
    }
    toast("Record saved successfully", "success");
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };
  const blank={vehicleId:"",vehicleNumber:"",vehicleGroup:"",partName:"",partId:"",code:"",serialNo:"",driverName:"",mechanicName:"",issueCount:"",qty:1,issueDate:today(),issuedCondition:"",returnedDate:"",returnedCondition:"",requestRefNo:"",returningPartOdometer:"",actionTaken:"",location:"",warrantyStatus:"",reissuedQty:"",reissuedCondition:"",vendorRepairDate:"",receivedBackDate:"",reIssuedToVehicle:"",scrapDate:"",finalStatus:"Active",remarks:""};

  const cols=[
    {key:"vehicleNumber",label:"Vehicle No"},{key:"vehicleGroup",label:"Vehicle Group"},{key:"partName",label:"Part Name"},
    {key:"partId",label:"Part ID"},{key:"qty",label:"Qty"},{key:"serialNo",label:"Serial No"},{key:"issueDate",label:"Issue Date"},
    {key:"issuedCondition",label:"Issued Condition"},{key:"returnedDate",label:"Returned Date"},
    {key:"returnedCondition",label:"Returned Condition"},{key:"requestRefNo",label:"Request Ref #"},{key:"returningPartOdometer",label:"Returning Part Odometer (Kms)"},{key:"actionTaken",label:"Action Taken"},{key:"location",label:"Location"},{key:"warrantyStatus",label:"Warranty Status"},{key:"reissuedQty",label:"Reissued Qty"},{key:"reissuedCondition",label:"Re-Issued Condition"},{key:"mechanicName",label:"Mechanic Name"},{key:"driverName",label:"Driver Name"},
    {key:"reIssuedToVehicle",label:"Re-Issued To"},{key:"finalStatus",label:"Final Status"},{key:"remarks",label:"Remarks"},
  ];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Maintenance Tracking" sub={`${active.length} total records`}/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={()=>exportCSV(exportRows,exportCols,"maintenance.csv")} className="action-btn-secondary"><Icon name="download" size={15}/> Export</button>
          <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary"><Icon name="plus" size={15}/> New Record</button>
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        {filterChips.map(({s,color})=>{
          const count=active.filter(r=>r.finalStatus===s).length;
          const active_=filterStatus===s;
          return (
            <div key={s} className="chip" onClick={()=>setFilterStatus(active_?"":s)}
              style={{borderColor:active_?color:`${color}30`,background:active_?`${color}20`:"var(--bg-card)",color:active_?color:"var(--text-secondary)"}}>
              <span style={{fontSize:15,fontWeight:800,color:active_?color:"var(--text-primary)"}}>{count}</span>
              {s}
            </div>
          );
        })}
        {filterStatus&&<button onClick={()=>setFilterStatus("")} className="action-btn-secondary" style={{padding:"6px 12px",fontSize:12}}>✕ Clear</button>}
      </div>

      <LifecycleHint/>
      <div className="table-wrapper">
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicle, part name, part ID..."
            className="search-input" style={{width:"100%",maxWidth:400,padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
        </div>
        {records.length===0&&<Skeleton/>}
        <div style={{overflowX:"auto",display:records.length===0?"none":"block"}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr>{cols.map(c=><Th key={c.key} onClick={["issueDate","returnedDate"].includes(c.key)?()=>sortBy(c.key):undefined} sorted={sort.col===c.key?sort.dir:null}>{c.label}</Th>)}<Th>Actions</Th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={cols.length+1} style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No records found.</td></tr>}
              {filtered.map((r,i)=>(
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                  <SnoTd>{i+1}</SnoTd>
                  <Td style={{color:"var(--accent)",fontWeight:700}}>{r.vehicleNumber||"—"}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.vehicleGroup||"—"}</Td>
                  <Td style={{color:"var(--text-primary)",fontWeight:500}}><LifecycleName name={r.partName} id={r.partId} onOpen={setLifecycle}/></Td>
                  <Td>{r.partId?<code style={{fontSize:11.5,background:"var(--bg-elevated)",padding:"2px 7px",borderRadius:5,color:"var(--cyan)",border:"1px solid rgba(34,211,238,0.2)"}}>{r.partId}</code>:"—"}</Td>
                  <Td style={{textAlign:"center"}}>{r.qty||1}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.serialNo||"—"}</Td>
                  <Td>{r.issueDate||"—"}</Td>
                  <Td>{r.issuedCondition||"—"}</Td>
                  <Td>{r.returnedDate||"—"}</Td>
                  <Td>{r.returnedCondition||"—"}</Td>
<Td>{r.requestRefNo||"—"}</Td>
<Td>{r.returningPartOdometer||"—"}</Td>
<Td>{r.actionTaken||"—"}</Td>
<Td>{r.location||"—"}</Td>
<Td>{r.warrantyStatus?<span style={{background:"rgba(167,139,250,0.15)",color:"#a78bfa",border:"1px solid rgba(167,139,250,0.35)",borderRadius:6,padding:"3px 10px",fontSize:11.5,fontWeight:700}}>{r.warrantyStatus}</span>:"—"}</Td>
<Td>{r.reissuedQty||"—"}</Td>
<Td>{r.reissuedCondition||"—"}</Td>
<Td>{r.mechanicName||"—"}</Td>
<Td>{r.driverName||"—"}</Td>
                  <Td>{r.reIssuedToVehicle||"—"}</Td>
                  <Td><Badge status={r.finalStatus} cfg={FINAL_STATUS_CFG}/></Td>
<Td style={{color:"var(--text-muted)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{r.remarks||"—"}</Td>
                  <td style={{padding:"8px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>setModal({mode:"edit",data:{...r}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",marginRight:8,padding:4}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>setConfirmId(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"9px 16px",borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-muted)"}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
      </div>
      {confirmId&&<ConfirmModal onConfirm={()=>del(confirmId)} onClose={()=>setConfirmId(null)}/>}
      {modal&&<MovementModal mode={modal.mode} data={modal.data} vehicles={vehicles} vendors={vendors} onSave={save_} onClose={()=>setModal(null)}/>}
      {lifecycle&&<PartLifecycleModal partName={lifecycle.name} partId={lifecycle.id} onClose={()=>setLifecycle(null)}/>}
    </div>
  );
}

function MovementModal({mode,data,vehicles,vendors,onSave,onClose}) {
  const [form,setForm]=useState(data);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();onSave(form);};

  const RETURNED_CONDITIONS=["Faulty","Damaged","Worn Out","Burnt","Broken"];
  const ACTIONS_TAKEN=["Sent for Repair","Scrap","Replacement Issued","Vendor Claim","Reissued","Repaired"];
  const FINAL_STATUSES=["Active","Returned","Under Repair","At Vendor","Reissued","Scrapped","Warranty Claim","Received after repair","Received without repair","At Stores","At Workshop"];

  const SectionHead=({title})=>(
    <div style={{gridColumn:"1/-1",borderBottom:"1px solid var(--border)",paddingBottom:8,marginTop:14,marginBottom:6,fontSize:14,fontWeight:800,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:4,height:16,borderRadius:2,background:"var(--accent)"}}/>
      {title}
    </div>
  );

  return (
    <Modal title={mode==="add"?"New Maintenance Record":"Edit Maintenance Record"} onClose={onClose} wide>
      <form onSubmit={submit}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 14px"}}>
          <SectionHead title="Part & Vehicle Info"/>
          <Field label="Vehicle Group"><Input value={form.vehicleGroup||""} onChange={e=>set("vehicleGroup",e.target.value)} placeholder="e.g. Mini Tippers"/></Field>
<Field label="Vehicle No" required><Input value={form.vehicleNumber||""} onChange={e=>set("vehicleNumber",e.target.value)} placeholder="e.g. TRK-001" required/></Field><Field label="Vehicle Group"><Input value={form.vehicleGroup||""} onChange={e=>set("vehicleGroup",e.target.value)} placeholder="e.g. Mini Tippers"/></Field>
<Field label="Vehicle No" required><Input value={form.vehicleNumber||""} onChange={e=>set("vehicleNumber",e.target.value)} placeholder="e.g. TRK-001" required/></Field>
          <Field label="Part Name" required><Input value={form.partName||""} onChange={e=>set("partName",e.target.value)} required/></Field>
          <Field label="Part ID" required><Input value={form.partId||""} onChange={e=>set("partId",e.target.value)} required/></Field>
<Field label="Code"><Input value={form.code||""} onChange={e=>set("code",e.target.value)} placeholder="e.g. ENG-001"/></Field>

          <SectionHead title="Issue Details"/>
          <Field label="Qty"><Input type="number" min="1" value={form.qty||1} onChange={e=>set("qty",e.target.value)}/></Field>
<Field label="Serial No"><Input value={form.serialNo||""} onChange={e=>set("serialNo",e.target.value)} placeholder="e.g. SN-001"/></Field>
<Field label="Serial No"><Input value={form.serialNo||""} onChange={e=>set("serialNo",e.target.value)} placeholder="e.g. SN-001"/></Field>
<Field label="Issue Count"><Input type="number" min="1" value={form.issueCount||""} onChange={e=>set("issueCount",e.target.value)} placeholder="e.g. 1"/></Field>
          <Field label="Issue Date"><Input type="text" value={form.issueDate||""} onChange={e=>set("issueDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
          <Field label="Issued Condition"><Select value={form.issuedCondition||""} onChange={e=>set("issuedCondition",e.target.value)}><option value="">Select...</option><option value="New">New</option><option value="Repaired">Repaired</option></Select></Field>

          <SectionHead title="Return & Action"/>
          <Field label="Returned Date"><Input type="text" value={form.returnedDate||""} onChange={e=>set("returnedDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
<Field label="Driver Name"><Input value={form.driverName||""} onChange={e=>set("driverName",e.target.value)} placeholder="Driver name"/></Field>
<Field label="Mechanic Name"><Input value={form.mechanicName||""} onChange={e=>set("mechanicName",e.target.value)} placeholder="Mechanic name"/></Field>
          <Field label="Returned Condition"><Select value={form.returnedCondition||""} onChange={e=>set("returnedCondition",e.target.value)}><option value="">Select...</option>{RETURNED_CONDITIONS.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
<Field label="Request Ref #"><Input value={form.requestRefNo||""} onChange={e=>set("requestRefNo",e.target.value)} placeholder="e.g. REQ-001"/></Field>
<Field label="Returning Part Odometer (Kms)"><Input value={form.returningPartOdometer||""} onChange={e=>set("returningPartOdometer",e.target.value)} placeholder="e.g. 45000"/></Field>
<Field label="Action Taken"><Select value={form.actionTaken||""} onChange={e=>set("actionTaken",e.target.value)}><option value="">Select...</option>{ACTIONS_TAKEN.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
<Field label="Action Taken"><Select value={form.actionTaken||""} onChange={e=>set("actionTaken",e.target.value)}><option value="">Select...</option>{ACTIONS_TAKEN.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
<Field label="Location"><Select value={form.location||""} onChange={e=>set("location",e.target.value)}><option value="">Select...</option><option value="At Store">At Store</option><option value="At Workshop">At Workshop</option><option value="At Yard">At Yard</option><option value="At Scrap Room">At Scrap Room</option><option value="At Vendor Premises">At Vendor Premises</option><option value="Outside">Outside</option></Select></Field>
<Field label="Warranty Status"><Select value={form.warrantyStatus||""} onChange={e=>set("warrantyStatus",e.target.value)}><option value="">Select...</option><option value="Under Warranty">Under Warranty</option><option value="No Warranty">No Warranty</option><option value="Claim Item">Claim Item</option><option value="Replaced Item">Replaced Item</option><option value="Adjust from bill">Adjust from bill</option><option value="Discount from bill">Discount from bill</option></Select></Field>
<Field label="Reissued Qty">  <Input type="number" min="0" value={form.reissuedQty||""} onChange={e=>set("reissuedQty",e.target.value)} placeholder="e.g. 1"/></Field>
<Field label="Re-Issued Condition"><Select value={form.reissuedCondition||""} onChange={e=>set("reissuedCondition",e.target.value)}><option value="">Select...</option><option value="New">New</option><option value="Repaired">Repaired</option><option value="Used">Used</option></Select></Field>
<Field label="Mechanic Name"><Input value={form.mechanicName||""} onChange={e=>set("mechanicName",e.target.value)} placeholder="Mechanic name"/></Field>
<Field label="Driver Name"><Input value={form.driverName||""} onChange={e=>set("driverName",e.target.value)} placeholder="Driver name"/></Field>
          <SectionHead title="Re-Issue Part to Vehicle"/>
          <Field label="Vendor Repair Date"><Input type="text" value={form.vendorRepairDate||""} onChange={e=>set("vendorRepairDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
          <Field label="Received Back Date"><Input type="text" value={form.receivedBackDate||""} onChange={e=>set("receivedBackDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
          <Field label="Re-Issued To Vehicle"><Input value={form.reIssuedToVehicle||""} onChange={e=>set("reIssuedToVehicle",e.target.value)} placeholder="Vehicle number"/></Field>

          <SectionHead title="Disposal & Final Status"/>
          <Field label="Scrap Date"><Input type="text" value={form.scrapDate||""} onChange={e=>set("scrapDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
          <Field label="Final Status" required><Select value={form.finalStatus||"Active"} onChange={e=>set("finalStatus",e.target.value)} required>{FINAL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
          <div/>
        </div>
        <SectionHead title="Remarks"/>
<Field label="Remarks" style={{gridColumn:"1/-1"}}>
  <Select value={form.remarks||""} onChange={e=>set("remarks",e.target.value)}>
    <option value="">Select...</option>
    <option value="Faulty Part Received & Re-Issued New One">Faulty Part Received & Re-Issued New One</option>
    <option value="Faulty Part Received & Re-Issued Repaired One">Faulty Part Received & Re-Issued Repaired One</option>
    <option value="Faulty Part Received & Re-Issued Used One">Faulty Part Received & Re-Issued Used One</option>
    <option value="Faulty Part Not Received but Re-Issued New One as per Approval by GM-Admin">Faulty Part Not Received but Re-Issued New One as per Approval by GM-Admin</option>
    <option value="Faulty Part Not Received but Re-Issued Repaired One as per Approval by GM-Admin">Faulty Part Not Received but Re-Issued Repaired One as per Approval by GM-Admin</option>
    <option value="Faulty Part Not Received but Re-Issued Used One as per Approval by GM-Admin">Faulty Part Not Received but Re-Issued Used One as per Approval by GM-Admin</option>
  </Select>
</Field>
<div/>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}>
          <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
          <button type="submit" className="action-btn-primary">Save Record</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
function VehiclesPage() {
  const [records,setRecords]=useState([]);
  useEffect(()=>{ load('vehicles').then(setRecords); },[]);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [confirmId,setConfirmId]=useState(null);
  const active=records.filter(r=>!r.deleted);
  const filtered=active.filter(r=>{const q=search.toLowerCase();return !q||[r.number,r.model,r.notes].some(f=>(f||"").toLowerCase().includes(q));});
  const [movements,setMovements]=useState([]);
  useEffect(()=>{ load('movements').then(setMovements); },[]);
  const getStats=id=>({total:movements.filter(m=>m.vehicleId===id).length,underRepair:movements.filter(m=>m.vehicleId===id&&(m.status==="Under Repair"||m.status==="Sent for Repair")).length});
  const save_=async data=>{
    if(modal.mode==="add"){const newRecord={...data,id:uid(),deleted:false};await save('vehicles',[newRecord]);setRecords(r=>[...r,newRecord]);}
    else{await save('vehicles',[data]);setRecords(r=>r.map(x=>x.id===data.id?data:x));}
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };
  const blank={number:"",model:"",notes:""};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Vehicles" sub={`${active.length} registered vehicles`}/>
        <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary" style={{marginTop:4}}><Icon name="plus" size={15}/> Add Vehicle</button>
      </div>
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicles..." className="search-input"
          style={{padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",width:280,boxSizing:"border-box"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
        {filtered.map(v=>{
          const st=getStats(v.id);
          return (
            <div key={v.id} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,padding:18,transition:"transform 0.2s,border-color 0.2s,box-shadow 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor="var(--border-bright)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="";e.currentTarget.style.boxShadow="";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{width:42,height:42,borderRadius:11,background:"var(--accent-dim)",border:"1px solid var(--accent-glow)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)"}}>
                  <Icon name="truck" size={21}/>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>setModal({mode:"edit",data:{...v}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",padding:4}}><Icon name="edit" size={14}/></button>
                  <button onClick={()=>del(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={14}/></button>
                </div>
              </div>
              <div style={{fontWeight:800,fontSize:18,color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"-0.3px"}}>{v.number}</div>
              <div style={{fontSize:13,color:"var(--text-secondary)",marginBottom:14}}>{v.model||"—"}</div>
              {v.notes&&<div style={{fontSize:12,color:"var(--text-muted)",marginBottom:14,padding:"7px 10px",background:"var(--bg-surface)",borderRadius:7,border:"1px solid var(--border)"}}>{v.notes}</div>}
              <div style={{display:"flex",gap:16,paddingTop:10,borderTop:"1px solid var(--border)"}}>
                <div><div style={{fontSize:20,fontWeight:800,color:"var(--text-primary)",fontFamily:"var(--font-display)"}}>{st.total}</div><div style={{fontSize:11,color:"var(--text-muted)"}}>movements</div></div>
                <div><div style={{fontSize:20,fontWeight:800,color:st.underRepair>0?"var(--accent)":"var(--green)",fontFamily:"var(--font-display)"}}>{st.underRepair}</div><div style={{fontSize:11,color:"var(--text-muted)"}}>in repair</div></div>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:48,color:"var(--text-muted)",fontSize:14}}>No vehicles found.</div>}
      </div>
      {modal&&(
        <Modal title={modal.mode==="add"?"Add Vehicle":"Edit Vehicle"} onClose={()=>setModal(null)}>
          <SimpleForm data={modal.data} fields={[{k:"number",label:"Vehicle Number",required:true},{k:"model",label:"Model"},{k:"notes",label:"Notes",type:"textarea"}]} onSave={save_} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
function VendorsPage() {
  const [records,setRecords]=useState([]);
  useEffect(()=>{ load('vendors').then(setRecords); },[]);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [confirmId,setConfirmId]=useState(null);
  const active=records.filter(r=>!r.deleted);
  const filtered=active.filter(r=>{const q=search.toLowerCase();return !q||[r.name,r.contact,r.workshop,r.address].some(f=>(f||"").toLowerCase().includes(q));});
  const [movements,setMovements]=useState([]);
  useEffect(()=>{ load('movements').then(setMovements); },[]);
  const save_=async data=>{
    if(modal.mode==="add"){const newRecord={...data,id:uid(),deleted:false};await save('vendors',[newRecord]);setRecords(r=>[...r,newRecord]);}
    else{await save('vendors',[data]);setRecords(r=>r.map(x=>x.id===data.id?data:x));}
    toast("Record saved successfully", "success");
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };
  const blank={name:"",contact:"",workshop:"",address:""};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Maintenance Vendors Info" sub={`${active.length} registered vendors`}/>
        <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary" style={{marginTop:4}}><Icon name="plus" size={15}/> Add Vendor</button>
      </div>
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..." className="search-input"
          style={{padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",width:280,boxSizing:"border-box"}}/>
      </div>
      <div className="table-wrapper">
        {records.length===0&&<Skeleton/>}
        <table style={{width:"100%",borderCollapse:"collapse",display:records.length===0?"none":"table"}}>
          <thead><tr>{["S.No","Vendor Name","Contact","Address","Actions"].map(h=><Th key={h} style={{textAlign:"center"}}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={7} style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No vendors found.</td></tr>}
            {filtered.map((v,i)=>{
              return (
                <tr key={v.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                  <SnoTd>{i+1}</SnoTd>
                  <Td style={{color:"var(--text-primary)",fontWeight:600,textAlign:"center"}}>{v.name}</Td>
                  <Td style={{color:"var(--cyan)",textAlign:"center"}}>{v.contact||"—"}</Td>
                  <Td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",color:"var(--text-muted)",textAlign:"center"}}>{v.address||"—"}</Td>
                  <td style={{padding:"8px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>setModal({mode:"edit",data:{...v}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",marginRight:8,padding:4}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>setConfirmId(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={15}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {confirmId&&<ConfirmModal onConfirm={()=>del(confirmId)} onClose={()=>setConfirmId(null)}/>}
      {modal&&(
        <Modal title={modal.mode==="add"?"Add Vendor":"Edit Vendor"} onClose={()=>setModal(null)}>
          <SimpleForm data={modal.data} fields={[{k:"name",label:"Vendor Name",required:true},{k:"contact",label:"Contact Number"},{k:"workshop",label:"Workshop Name"},{k:"address",label:"Address",type:"textarea"}]} onSave={save_} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}

// ─── Simple form ──────────────────────────────────────────────────────────────
function SimpleForm({data,fields,onSave,onClose}) {
  const [form,setForm]=useState(data);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();onSave(form);};
  return (
    <form onSubmit={submit}>
      {fields.map(f=>(
        <Field key={f.k} label={f.label} required={f.required}>
          {f.type==="textarea"?<Textarea value={form[f.k]||""} onChange={e=>set(f.k,e.target.value)}/>:<Input value={form[f.k]||""} onChange={e=>set(f.k,e.target.value)} required={f.required}/>}
        </Field>
      ))}
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
        <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
        <button type="submit" className="action-btn-primary">Save</button>
      </div>
    </form>
  );
}

// ─── Global Search ────────────────────────────────────────────────────────────
function PurchasePage() {
  const [records,setRecords]=useState([]);
  useEffect(()=>{ load('purchase').then(setRecords); },[]);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState({col:"purchaseDate",dir:"desc"});
  const [confirmId,setConfirmId]=useState(null);

  const active=records.filter(r=>!r.deleted);

  const PURCHASED_FOR=[
    "Mini Tippers","Loaders","Tractors","Dumpers","Excavators",
    "Compactors","Operational Vehicles","Staff Vehicles","All Vehicles",
    "LTV","HTV","Not Particular Vehicle Group","Others"
  ];

  const cols=[
    {key:"vendorName",label:"Vendor Name"},
    {key:"partName",label:"Part Name"},
    {key:"code",label:"Code"},
    {key:"partId",label:"Part ID"},
    {key:"purchaseDate",label:"Purchase Date"},
    {key:"purchaseAmount",label:"Purchase Amount"},
    {key:"purchasedFor",label:"Purchased For"},
  ];

  const filtered=useMemo(()=>{
    let rows=active.filter(r=>{
      const q=search.toLowerCase();
      return !q||[r.vendorName,r.partName,r.code,r.partId,r.purchasedFor].some(f=>(f||"").toLowerCase().includes(q));
    });
    return [...rows].sort((a,b)=>{
      const av=a[sort.col]||"",bv=b[sort.col]||"";
      const an=Number(av),bn=Number(bv);
      const isNum=!isNaN(an)&&!isNaN(bn)&&av!==""&&bv!=="";
      const cmp=isNum?(an-bn):av.toString().localeCompare(bv.toString());
      return sort.dir==="asc"?cmp:-cmp;
    });
  },[active,search,sort]);

  const sortBy=col=>setSort(s=>({col,dir:s.col===col&&s.dir==="asc"?"desc":"asc"}));

  const save_=async data=>{
    if(modal.mode==="add"){const newRecord={...data,id:uid(),deleted:false};await save('purchase',[newRecord]);setRecords(r=>[...r,newRecord]);}
    else{await save('purchase',[data]);setRecords(r=>r.map(x=>x.id===data.id?data:x));}
    toast("Record saved successfully", "success");
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };

  const blank={vendorName:"",partName:"",code:"",partId:"",purchaseDate:"",purchaseAmount:"",purchasedFor:""};

  const [lifecycle, setLifecycle] = useState(null);
  const totalSpend=filtered.reduce((s,r)=>s+(Number(r.purchaseAmount)||0),0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Parts Purchase Details" sub={`${active.length} purchase records`}/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={()=>exportCSV(filtered,cols,"parts-purchase.csv")} className="action-btn-secondary"><Icon name="download" size={15}/> Export</button>
          <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary"><Icon name="plus" size={15}/> New Purchase</button>
        </div>
      </div>

      

      <LifecycleHint/>
      <div className="table-wrapper">
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendor, part name, code..."
            className="search-input" style={{width:"100%",maxWidth:380,padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
        </div>
        {records.length===0&&<Skeleton/>}
        <div style={{overflowX:"auto",display:records.length===0?"none":"block"}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <Th>S.No</Th>
                {cols.map(c=><Th key={c.key} onClick={["purchaseDate","purchaseAmount"].includes(c.key)?()=>sortBy(c.key):undefined} sorted={sort.col===c.key?sort.dir:null}>{c.label}</Th>)}
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={cols.length+2} style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No purchase records found.</td></tr>}
              {filtered.map((r,i)=>(
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                  <SnoTd>{i+1}</SnoTd>
                  <Td style={{color:"var(--text-primary)",fontWeight:600}}>{r.vendorName||"—"}</Td>
                  <Td style={{color:"var(--text-primary)"}}><LifecycleName name={r.partName} id={r.partId} onOpen={setLifecycle}/></Td>
                  <Td><code style={{fontSize:11.5,background:"var(--bg-elevated)",padding:"2px 7px",borderRadius:5,color:"var(--cyan)",border:"1px solid rgba(34,211,238,0.2)"}}>{r.code||"—"}</code></Td>
                  <Td style={{color:"var(--text-secondary)"}}>{r.partId||"—"}</Td>
                  <Td style={{color:"var(--text-secondary)"}}>{r.purchaseDate||"—"}</Td>
                  <Td style={{color:r.purchaseAmount?"var(--accent)":"var(--text-muted)",fontWeight:r.purchaseAmount?700:400}}>{r.purchaseAmount?`PKR ${Number(r.purchaseAmount).toLocaleString()}`:"—"}</Td>
                  <Td>{r.purchasedFor?<span style={{background:"var(--blue-dim)",color:"var(--blue)",border:"1px solid rgba(79,142,247,0.3)",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:600}}>{r.purchasedFor}</span>:"—"}</Td>
                  <td style={{padding:"8px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>setModal({mode:"edit",data:{...r}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",marginRight:8,padding:4}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>setConfirmId(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"9px 16px",borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-muted)"}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
      </div>
      {confirmId&&<ConfirmModal onConfirm={()=>del(confirmId)} onClose={()=>setConfirmId(null)}/>}
      {lifecycle&&<PartLifecycleModal partName={lifecycle.name} partId={lifecycle.id} onClose={()=>setLifecycle(null)}/>}
      {filtered.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginTop:16}}>
          <StatCard label="Total Records" value={active.length} icon="clipboard" color="#4f8ef7"/>
          <StatCard label="Total Spend" value={`PKR ${totalSpend.toLocaleString()}`} icon="chart" color="#f87171" sub="filtered"/>
        </div>
      )}

      {modal&&(
        <Modal title={modal.mode==="add"?"New Purchase Record":"Edit Purchase Record"} onClose={()=>setModal(null)}>
          <PurchaseModal data={modal.data} mode={modal.mode} purchasedForOptions={PURCHASED_FOR} onSave={save_} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}

function PurchaseModal({data,mode,purchasedForOptions,onSave,onClose}) {
  const [form,setForm]=useState(data);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();onSave(form);};
  return (
    <form onSubmit={submit}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="Vendor Name" required><Input value={form.vendorName||""} onChange={e=>set("vendorName",e.target.value)} required/></Field>
        <Field label="Part Name" required><Input value={form.partName||""} onChange={e=>set("partName",e.target.value)} required/></Field>
        <Field label="Code"><Input value={form.code||""} onChange={e=>set("code",e.target.value)} placeholder="e.g. ENG-001"/></Field>
        <Field label="Part ID"><Input value={form.partId||""} onChange={e=>set("partId",e.target.value)} placeholder="e.g. CP-001"/></Field>
        <Field label="Purchase Date"><Input type="text" value={form.purchaseDate||""} onChange={e=>set("purchaseDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
        <Field label="Purchase Amount (PKR)"><Input type="number" min="0" value={form.purchaseAmount||""} onChange={e=>set("purchaseAmount",e.target.value)} placeholder="e.g. 15000"/></Field>
        <Field label="Purchased For" required>
          <Select value={form.purchasedFor||""} onChange={e=>set("purchasedFor",e.target.value)} required>
            <option value="">Select vehicle group...</option>
            {purchasedForOptions.map(o=><option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}>
        <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
        <button type="submit" className="action-btn-primary">Save Record</button>
      </div>
    </form>
  );
}
function RepairPage() {
  const [records,setRecords]=useState([]);
  useEffect(()=>{ load('repair').then(setRecords); },[]);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState({col:"dateOut",dir:"desc"});
  const [confirmId,setConfirmId]=useState(null);

  const active=records.filter(r=>!r.deleted);

  const PART_STATUSES=[
    "Received after repair","Received without repair",
    "Sent for Scrap Sold","At Stores","At Workshop","At Vendor"
  ];

  const PART_STATUS_CFG={
    "Received after repair":  {bg:"rgba(52,211,153,0.15)",text:"#34d399",border:"rgba(52,211,153,0.35)"},
    "Received without repair":{bg:"rgba(148,163,184,0.15)",text:"#94a3b8",border:"rgba(148,163,184,0.35)"},
    "Sent for Scrap Sold":    {bg:"rgba(248,113,113,0.15)",text:"#f87171",border:"rgba(248,113,113,0.35)"},
    "At Stores":              {bg:"rgba(245,166,35,0.15)", text:"#f5a623",border:"rgba(245,166,35,0.35)"},
    "At Workshop":            {bg:"rgba(251,146,60,0.15)", text:"#fb923c",border:"rgba(251,146,60,0.35)"},
    "At Vendor":              {bg:"rgba(79,142,247,0.15)", text:"#7eb3ff",border:"rgba(79,142,247,0.35)"},
  };

  const cols=[
    {key:"dateSent",label:"Date Sent"},
{key:"requestRefNo",label:"Request Ref #"},
{key:"ogpNo",label:"OGP No"},
{key:"vehicleGroup",label:"Vehicle Group"},
{key:"vehicleNo",label:"Vehicle No"},
{key:"partName",label:"Part Name"},
{key:"partId",label:"Part ID"},
{key:"qtyRepaired",label:"Qty Repaired"},
{key:"partSerialNo",label:"Part Serial No"},
{key:"repairVendorName",label:"Repair Vendor Name"},
{key:"expectedReturnDate",label:"Expected Return Date"},
{key:"dateReceived",label:"Date Received"},
{key:"repairDuration",label:"Repair Duration (Days)"},
{key:"igpNo",label:"IGP No"},
{key:"repairCost",label:"Repair Cost"},
{key:"partStatus",label:"Part Status"},
  ];

  const filtered=useMemo(()=>{
    let rows=active.filter(r=>{
      const q=search.toLowerCase();
      return !q||[r.vehicleNo,r.partName,r.partId,r.repairVendorName,r.ogpNo,r.igpNo,r.partStatus].some(f=>(f||"").toLowerCase().includes(q));
    });
    return [...rows].sort((a,b)=>{
      const av=a[sort.col]||"",bv=b[sort.col]||"";
      const an=Number(av),bn=Number(bv);
      const isNum=!isNaN(an)&&!isNaN(bn)&&av!==""&&bv!=="";
      const cmp=isNum?(an-bn):av.toString().localeCompare(bv.toString());
      return sort.dir==="asc"?cmp:-cmp;
    });
  },[active,search,sort]);

  const sortBy=col=>setSort(s=>({col,dir:s.col===col&&s.dir==="asc"?"desc":"asc"}));

  const save_=async data=>{
    if(modal.mode==="add"){const newRecord={...data,id:uid(),deleted:false};await save('repair',[newRecord]);setRecords(r=>[...r,newRecord]);}
    else{await save('repair',[data]);setRecords(r=>r.map(x=>x.id===data.id?data:x));}
    toast("Record saved successfully", "success");
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };

  const blank={dateSent:"",requestRefNo:"",ogpNo:"",vehicleGroup:"",vehicleNo:"",partName:"",partId:"",qtyRepaired:"",partSerialNo:"",repairVendorName:"",expectedReturnDate:"",dateReceived:"",repairDuration:"",igpNo:"",repairCost:"",partStatus:""};

  const [lifecycle, setLifecycle] = useState(null);
  const totalCost=filtered.reduce((s,r)=>s+(Number(r.repairCost)||0),0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Repair & Maintenance Register" sub={`${active.length} repair records`}/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={()=>exportCSV(filtered,cols,"parts-repair.csv")} className="action-btn-secondary"><Icon name="download" size={15}/> Export</button>
          <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary"><Icon name="plus" size={15}/> New Record</button>
        </div>
      </div>

      

      <LifecycleHint/>
      <div className="table-wrapper">
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicle, part, vendor, OGP, IGP..."
            className="search-input" style={{width:"100%",maxWidth:400,padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
        </div>
        {records.length===0&&<Skeleton/>}
        <div style={{overflowX:"auto",display:records.length===0?"none":"block"}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <Th>S.No</Th>
                {cols.map(c=><Th key={c.key} onClick={["dateSent","expectedReturnDate","dateReceived","repairCost"].includes(c.key)?()=>sortBy(c.key):undefined} sorted={sort.col===c.key?sort.dir:null}>{c.label}</Th>)}
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={cols.length+2} style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No repair records found.</td></tr>}
              {filtered.map((r,i)=>(
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                  <SnoTd>{i+1}</SnoTd>
                  <Td style={{color:"var(--text-secondary)"}}>{r.dateSent||"—"}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.requestRefNo||"—"}</Td>
<Td style={{color:"var(--cyan)",fontWeight:600}}>{r.ogpNo||"—"}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.vehicleGroup||"—"}</Td>
<Td style={{color:"var(--accent)",fontWeight:700}}>{r.vehicleNo||"—"}</Td>
<Td style={{color:"var(--text-primary)",fontWeight:500}}><LifecycleName name={r.partName} id={r.partId} onOpen={setLifecycle}/></Td>
<Td style={{color:"var(--text-secondary)"}}>{r.partId||"—"}</Td>
<Td style={{textAlign:"center",color:"var(--text-primary)",fontWeight:600}}>{r.qtyRepaired||"—"}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.partSerialNo||"—"}</Td>
<Td style={{color:"var(--text-primary)"}}>{r.repairVendorName||"—"}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.expectedReturnDate||"—"}</Td>
<Td style={{color:"var(--text-secondary)"}}>{r.dateReceived||"—"}</Td>
<Td style={{color:"var(--text-secondary)",textAlign:"center"}}>{r.repairDuration||"—"}</Td>
<Td style={{color:"var(--cyan)",fontWeight:600}}>{r.igpNo||"—"}</Td>
<Td style={{color:r.repairCost?"var(--accent)":"var(--text-muted)",fontWeight:r.repairCost?700:400}}>{r.repairCost?`PKR ${Number(r.repairCost).toLocaleString()}`:"—"}</Td>
<Td>{r.partStatus?<Badge status={r.partStatus} cfg={PART_STATUS_CFG}/>:"—"}</Td>
                  <td style={{padding:"8px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>setModal({mode:"edit",data:{...r}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",marginRight:8,padding:4}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>setConfirmId(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"9px 16px",borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-muted)"}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
      </div>
      {confirmId&&<ConfirmModal onConfirm={()=>del(confirmId)} onClose={()=>setConfirmId(null)}/>}
      {lifecycle&&<PartLifecycleModal partName={lifecycle.name} partId={lifecycle.id} onClose={()=>setLifecycle(null)}/>}
      {filtered.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginTop:16}}>
          <StatCard label="Total Records" value={active.length} icon="clipboard" color="#4f8ef7"/>
          <StatCard label="Total Repair Cost" value={`PKR ${totalCost.toLocaleString()}`} icon="wrench" color="#f87171" sub="filtered"/>
        </div>
      )}

      {modal&&(
        <Modal title={modal.mode==="add"?"New Repair Record":"Edit Repair Record"} onClose={()=>setModal(null)}>
          <RepairModal data={modal.data} mode={modal.mode} statuses={PART_STATUSES} onSave={save_} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}

function RepairModal({data,mode,statuses,onSave,onClose}) {
  const [form,setForm]=useState(data);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();onSave(form);};
  return (
    <form onSubmit={submit}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="Date Sent"><Input type="text" value={form.dateSent||""} onChange={e=>set("dateSent",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
<Field label="Request Ref #"><Input value={form.requestRefNo||""} onChange={e=>set("requestRefNo",e.target.value)} placeholder="e.g. REQ-001"/></Field>
<Field label="OGP No"><Input value={form.ogpNo||""} onChange={e=>set("ogpNo",e.target.value)} placeholder="e.g. OGP-001"/></Field>
<Field label="Vehicle Group"><Input value={form.vehicleGroup||""} onChange={e=>set("vehicleGroup",e.target.value)} placeholder="e.g. Mini Tippers"/></Field>
<Field label="Vehicle No" required><Input value={form.vehicleNo||""} onChange={e=>set("vehicleNo",e.target.value)} placeholder="e.g. TRK-001" required/></Field>
<Field label="Part Name" required><Input value={form.partName||""} onChange={e=>set("partName",e.target.value)} required/></Field>
<Field label="Part ID"><Input value={form.partId||""} onChange={e=>set("partId",e.target.value)} placeholder="e.g. CP-001"/></Field>
<Field label="Qty Repaired"><Input type="number" min="1" value={form.qtyRepaired||""} onChange={e=>set("qtyRepaired",e.target.value)} placeholder="e.g. 1"/></Field>
<Field label="Part Serial No"><Input value={form.partSerialNo||""} onChange={e=>set("partSerialNo",e.target.value)} placeholder="e.g. SN-001"/></Field>
<Field label="Repair Vendor Name" required><Input value={form.repairVendorName||""} onChange={e=>set("repairVendorName",e.target.value)} required/></Field>
<Field label="Expected Return Date"><Input type="text" value={form.expectedReturnDate||""} onChange={e=>set("expectedReturnDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
<Field label="Date Received"><Input type="text" value={form.dateReceived||""} onChange={e=>set("dateReceived",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
<Field label="Repair Duration (Days)"><Input type="number" min="0" value={form.repairDuration||""} onChange={e=>set("repairDuration",e.target.value)} placeholder="e.g. 5"/></Field>
<Field label="IGP No"><Input value={form.igpNo||""} onChange={e=>set("igpNo",e.target.value)} placeholder="e.g. IGP-001"/></Field>
<Field label="Repair Cost (PKR)"><Input type="number" min="0" value={form.repairCost||""} onChange={e=>set("repairCost",e.target.value)} placeholder="e.g. 5000"/></Field>
<Field label="Part Status" required>
  <Select value={form.partStatus||""} onChange={e=>set("partStatus",e.target.value)} required>
    <option value="">Select status...</option>
    {statuses.map(s=><option key={s} value={s}>{s}</option>)}
  </Select>
</Field>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}>
        <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
        <button type="submit" className="action-btn-primary">Save Record</button>
      </div>
    </form>
  );
}
function ScrapPage() {
  const [records,setRecords]=useState([]);
  useEffect(()=>{ load('scrap').then(setRecords); },[]);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState({col:"soldDate",dir:"desc"});
  const [confirmId,setConfirmId]=useState(null);

  const active=records.filter(r=>!r.deleted);

  const QTY_UNITS=["Kgs","Ltrs","Piece","Set"];

  const cols=[
    {key:"partName",label:"Part Name"},
    {key:"code",label:"Code"},
    {key:"partId",label:"Part ID"},
    {key:"serialNo",label:"Part Serial No"},
    {key:"scrapVendorName",label:"Scrap Vendor Name"},
    {key:"soldDate",label:"Sold Date"},
    {key:"gpNo",label:"GP No"},
    {key:"billNo",label:"Bill No"},
    {key:"quantity",label:"Quantity"},
    {key:"unitPrice",label:"Unit Price"},
    {key:"scrapCost",label:"Scrap Cost"},
    {key:"remarks",label:"Remarks"},
  ];

  const filtered=useMemo(()=>{
    let rows=active.filter(r=>{
      const q=search.toLowerCase();
      return !q||[r.partName,r.code,r.partId,r.serialNo,r.scrapVendorName,r.gpNo,r.billNo].some(f=>(f||"").toLowerCase().includes(q));
    });
    return [...rows].sort((a,b)=>{
      const av=a[sort.col]||"",bv=b[sort.col]||"";
      const an=Number(av),bn=Number(bv);
      const isNum=!isNaN(an)&&!isNaN(bn)&&av!==""&&bv!=="";
      const cmp=isNum?(an-bn):av.toString().localeCompare(bv.toString());
      return sort.dir==="asc"?cmp:-cmp;
    });
  },[active,search,sort]);

  const sortBy=col=>setSort(s=>({col,dir:s.col===col&&s.dir==="asc"?"desc":"asc"}));

  const save_=async data=>{
    if(modal.mode==="add"){const newRecord={...data,id:uid(),deleted:false};await save('scrap',[newRecord]);setRecords(r=>[...r,newRecord]);}
    else{await save('scrap',[data]);setRecords(r=>r.map(x=>x.id===data.id?data:x));}
    toast("Record saved successfully", "success");
    setModal(null);
  };
  const del = async id=>{
    await deleteRecord('issued', id);
    setRecords(r=>r.filter(x=>x.id!==id));
    toast("Record deleted", "success");
  };

  const blank={partName:"",code:"",partId:"",serialNo:"",scrapVendorName:"",soldDate:"",gpNo:"",billNo:"",quantity:"",qtyUnit:"Piece",unitPrice:"",scrapCost:"",remarks:""};

  const [lifecycle, setLifecycle] = useState(null);
  const totalScrapCost=filtered.reduce((s,r)=>s+(Number(r.scrapCost)||0),0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Scrap Register" sub={`${active.length} scrap records`}/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={()=>exportCSV(filtered,cols,"parts-scrap.csv")} className="action-btn-secondary"><Icon name="download" size={15}/> Export</button>
          <button onClick={()=>setModal({mode:"add",data:blank})} className="action-btn-primary"><Icon name="plus" size={15}/> New Record</button>
        </div>
      </div>

      

      <LifecycleHint/>
      <div className="table-wrapper">
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search part name, code, vendor, GP, bill..."
            className="search-input" style={{width:"100%",maxWidth:400,padding:"8px 12px",borderRadius:8,fontSize:13.5,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
        </div>
        {records.length===0&&<Skeleton/>}
        <div style={{overflowX:"auto",display:records.length===0?"none":"block"}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <Th>S.No</Th>
                {cols.map(c=><Th key={c.key} onClick={["soldDate","unitPrice","scrapCost"].includes(c.key)?()=>sortBy(c.key):undefined} sorted={sort.col===c.key?sort.dir:null}>{c.label}</Th>)}
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={cols.length+2} style={{padding:32,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No scrap records found.</td></tr>}
              {filtered.map((r,i)=>(
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                  <SnoTd>{i+1}</SnoTd>
                  <Td style={{color:"var(--text-primary)",fontWeight:600}}><LifecycleName name={r.partName} id={r.partId} onOpen={setLifecycle}/></Td>
                  <Td><code style={{fontSize:11.5,background:"var(--bg-elevated)",padding:"2px 7px",borderRadius:5,color:"var(--cyan)",border:"1px solid rgba(34,211,238,0.2)"}}>{r.code||"—"}</code></Td>
                  <Td style={{color:"var(--text-secondary)"}}>{r.partId||"—"}</Td>
                  <Td style={{color:"var(--text-secondary)"}}>{r.serialNo||"—"}</Td>
                  <Td style={{color:"var(--text-primary)",fontWeight:500}}>{r.scrapVendorName||"—"}</Td>
                  <Td style={{color:"var(--text-secondary)"}}>{r.soldDate||"—"}</Td>
                  <Td style={{color:"var(--cyan)",fontWeight:600}}>{r.gpNo||"—"}</Td>
                  <Td style={{color:"var(--cyan)",fontWeight:600}}>{r.billNo||"—"}</Td>
                  <Td style={{color:"var(--text-primary)"}}>{r.quantity?`${r.quantity} ${r.qtyUnit||""}`:"—"}</Td>
                  <Td style={{color:r.unitPrice?"var(--accent)":"var(--text-muted)",fontWeight:r.unitPrice?700:400}}>{r.unitPrice?`PKR ${Number(r.unitPrice).toLocaleString()}`:"—"}</Td>
                  <Td style={{color:r.scrapCost?"var(--green)":"var(--text-muted)",fontWeight:r.scrapCost?700:400}}>{r.scrapCost?`PKR ${Number(r.scrapCost).toLocaleString()}`:"—"}</Td>
                  <Td style={{color:"var(--text-muted)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{r.remarks||"—"}</Td>
                  <td style={{padding:"8px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>setModal({mode:"edit",data:{...r}})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",marginRight:8,padding:4}}><Icon name="edit" size={15}/></button>
                    <button onClick={()=>setConfirmId(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:4}}><Icon name="trash" size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"9px 16px",borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-muted)"}}>{filtered.length} record{filtered.length!==1?"s":""}</div>
      </div>
      {confirmId&&<ConfirmModal onConfirm={()=>del(confirmId)} onClose={()=>setConfirmId(null)}/>}
      {lifecycle&&<PartLifecycleModal partName={lifecycle.name} partId={lifecycle.id} onClose={()=>setLifecycle(null)}/>}
      {filtered.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginTop:16}}>
          <StatCard label="Total Records" value={active.length} icon="clipboard" color="#4f8ef7"/>
          <StatCard label="Total Scrap Value" value={`PKR ${totalScrapCost.toLocaleString()}`} icon="chart" color="#34d399" sub="filtered"/>
        </div>
      )}

      {modal&&(
        <Modal title={modal.mode==="add"?"New Scrap Record":"Edit Scrap Record"} onClose={()=>setModal(null)}>
          <ScrapModal data={modal.data} mode={modal.mode} qtyUnits={QTY_UNITS} onSave={save_} onClose={()=>setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}

function ScrapModal({data,mode,qtyUnits,onSave,onClose}) {
  const [form,setForm]=useState(data);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();onSave(form);};
  return (
    <form onSubmit={submit}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="Part Name" required><Input value={form.partName||""} onChange={e=>set("partName",e.target.value)} required/></Field>
        <Field label="Code"><Input value={form.code||""} onChange={e=>set("code",e.target.value)} placeholder="e.g. ENG-001"/></Field>
        <Field label="Part ID"><Input value={form.partId||""} onChange={e=>set("partId",e.target.value)} placeholder="e.g. CP-001"/></Field>
        <Field label="Serial No"><Input value={form.serialNo||""} onChange={e=>set("serialNo",e.target.value)} placeholder="e.g. SN-001"/></Field>
        <Field label="Scrap Vendor Name" required><Input value={form.scrapVendorName||""} onChange={e=>set("scrapVendorName",e.target.value)} required/></Field>
        <Field label="Sold Date"><Input type="text" value={form.soldDate||""} onChange={e=>set("soldDate",e.target.value)} placeholder="e.g. 1-Dec-26"/></Field>
        <Field label="GP No"><Input value={form.gpNo||""} onChange={e=>set("gpNo",e.target.value)} placeholder="e.g. GP-001"/></Field>
        <Field label="Bill No"><Input value={form.billNo||""} onChange={e=>set("billNo",e.target.value)} placeholder="e.g. BILL-001"/></Field>
        <Field label="Quantity">
          <div style={{display:"flex",gap:8}}>
            <Input type="number" min="0" value={form.quantity||""} onChange={e=>set("quantity",e.target.value)} placeholder="e.g. 10" style={{flex:2}}/>
            <div style={{flex:1}}>
              <Select value={form.qtyUnit||"Piece"} onChange={e=>set("qtyUnit",e.target.value)}>
                {qtyUnits.map(u=><option key={u} value={u}>{u}</option>)}
              </Select>
            </div>
          </div>
        </Field>
        <Field label="Unit Price (PKR)"><Input type="number" min="0" value={form.unitPrice||""} onChange={e=>set("unitPrice",e.target.value)} placeholder="e.g. 500"/></Field>
        <Field label="Scrap Cost (PKR)"><Input type="number" min="0" value={form.scrapCost||""} onChange={e=>set("scrapCost",e.target.value)} placeholder="e.g. 5000"/></Field>
        <Field label="Remarks"><Input value={form.remarks||""} onChange={e=>set("remarks",e.target.value)} placeholder="Any notes..."/></Field>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}>
        <button type="button" onClick={onClose} className="action-btn-secondary">Cancel</button>
        <button type="submit" className="action-btn-primary">Save Record</button>
      </div>
    </form>
  );
}
function PartLifecycleModal({partName, partId, onClose}) {
  const [issued, setIssued] = useState([]);
  const [movements, setMovements] = useState([]);
  const [repair, setRepair] = useState([]);
  const [scrap, setScrap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([
      load('issued'),
      load('movements'),
      load('repair'),
      load('scrap'),
    ]).then(([i,m,r,s])=>{
      const match = x => {
        const n = (x.itemName||x.partName||x.partDesc||x.itemDesc||"").toLowerCase();
        const c = (x.itemCode||x.partId||x.code||"").toLowerCase();
        const searchName = (partName||"").toLowerCase();
        const searchId = (partId||"").toLowerCase();
        return (searchName && n.includes(searchName)) || (searchId && c.includes(searchId));
      };
      setIssued(i.filter(match));
      setMovements(m.filter(match));
      setRepair(r.filter(match));
      setScrap(s.filter(match));
      setLoading(false);
    });
  },[]);

  const timeline = [
    ...issued.map(r=>({...r, _type:"issued", _date: r.issueDate||""})),
    ...movements.map(r=>({...r, _type:"maintenance", _date: r.issueDate||r.issuedDate||""})),
    ...repair.map(r=>({...r, _type:"repair", _date: r.dateSent||""})),
    ...scrap.map(r=>({...r, _type:"scrap", _date: r.soldDate||""})),
  ].sort((a,b)=> a._date > b._date ? 1 : -1);

  const TYPE_CFG = {
    issued:      {label:"Issued",      color:"#4f8ef7", bg:"rgba(79,142,247,0.12)",  border:"rgba(79,142,247,0.3)",  icon:"clipboard"},
    maintenance: {label:"Maintenance", color:"#f5a623", bg:"rgba(245,166,35,0.12)",  border:"rgba(245,166,35,0.3)",  icon:"wrench"},
    repair:      {label:"Repair",      color:"#a78bfa", bg:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.3)", icon:"refresh"},
    scrap:       {label:"Scrapped",    color:"#f87171", bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.3)", icon:"trash"},
  };

  const renderDetail = (r) => {
    switch(r._type) {
      case "issued": return (
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px",marginTop:8}}>
          {[["Vehicle", r.vehicleNumber],["Issued To", r.issuedTo],["Issued By", r.issuedBy],["Condition", r.issuedCondition],["GP #", r.gpNumber],["Qty", r.qtyIssued],["Warranty", r.warrantyStatus]].map(([k,v])=>v?(
            <div key={k}><span style={{fontSize:11,color:"var(--text-muted)"}}>{k}: </span><span style={{fontSize:12,color:"var(--text-primary)",fontWeight:600}}>{v}</span></div>
          ):null)}
        </div>
      );
      case "maintenance": return (
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px",marginTop:8}}>
          {[["Vehicle", r.vehicleNumber],["Final Status", r.finalStatus],["Action", r.actionTaken],["Returned", r.returnedDate],["Returned Condition", r.returnedCondition],["Re-Issued To", r.reIssuedToVehicle],["Mechanic", r.mechanicName]].map(([k,v])=>v?(
            <div key={k}><span style={{fontSize:11,color:"var(--text-muted)"}}>{k}: </span><span style={{fontSize:12,color:"var(--text-primary)",fontWeight:600}}>{v}</span></div>
          ):null)}
        </div>
      );
      case "repair": return (
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px",marginTop:8}}>
          {[["Vehicle", r.vehicleNo],["Vendor", r.repairVendorName],["Cost", r.repairCost?`PKR ${Number(r.repairCost).toLocaleString()}`:""],["OGP #", r.ogpNo],["IGP #", r.igpNo],["Date Received", r.dateReceived],["Status", r.partStatus]].map(([k,v])=>v?(
            <div key={k}><span style={{fontSize:11,color:"var(--text-muted)"}}>{k}: </span><span style={{fontSize:12,color:"var(--text-primary)",fontWeight:600}}>{v}</span></div>
          ):null)}
        </div>
      );
      case "scrap": return (
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px",marginTop:8}}>
          {[["Vendor", r.scrapVendorName],["Sold Date", r.soldDate],["GP #", r.gpNo],["Qty", r.quantity?`${r.quantity} ${r.qtyUnit||""}`:""],["Unit Price", r.unitPrice?`PKR ${Number(r.unitPrice).toLocaleString()}`:""],["Total", r.scrapCost?`PKR ${Number(r.scrapCost).toLocaleString()}`:""]].map(([k,v])=>v?(
            <div key={k}><span style={{fontSize:11,color:"var(--text-muted)"}}>{k}: </span><span style={{fontSize:12,color:"var(--text-primary)",fontWeight:600}}>{v}</span></div>
          ):null)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <Modal title={`Part Lifecycle — ${partName||partId||"Unknown"}`} onClose={onClose} wide>
      {loading ? <Skeleton/> : (
        <div>
          {/* Summary chips */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
            {Object.entries(TYPE_CFG).map(([type,cfg])=>{
              const count = timeline.filter(x=>x._type===type).length;
              return (
                <div key={type} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,background:cfg.bg,border:`1px solid ${cfg.border}`}}>
                  <Icon name={cfg.icon} size={13} style={{color:cfg.color}}/>
                  <span style={{fontSize:12,fontWeight:700,color:cfg.color}}>{count}</span>
                  <span style={{fontSize:12,color:"var(--text-muted)"}}>{cfg.label}</span>
                </div>
              );
            })}
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,background:"var(--bg-elevated)",border:"1px solid var(--border-bright)"}}>
              <Icon name="clock" size={13} style={{color:"var(--text-muted)"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text-primary)"}}>{timeline.length}</span>
              <span style={{fontSize:12,color:"var(--text-muted)"}}>total events</span>
            </div>
          </div>

          {timeline.length===0 && (
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-muted)",fontSize:14}}>
              No records found for this part across any register.
            </div>
          )}

          {/* Timeline */}
          <div style={{position:"relative"}}>
            {/* Vertical line */}
            <div style={{position:"absolute",left:19,top:0,bottom:0,width:2,background:"var(--border)",borderRadius:2}}/>

            {timeline.map((r,i)=>{
              const cfg = TYPE_CFG[r._type];
              return (
                <div key={r.id+i} style={{display:"flex",gap:16,marginBottom:16,position:"relative"}}>
                  {/* Dot */}
                  <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:cfg.bg,border:`2px solid ${cfg.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.color,zIndex:1,boxShadow:`0 0 0 4px var(--bg-card)`}}>
                    <Icon name={cfg.icon} size={16}/>
                  </div>

                  {/* Card */}
                  <div style={{flex:1,background:"var(--bg-elevated)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",marginTop:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,fontWeight:800,color:cfg.color,textTransform:"uppercase",letterSpacing:"0.06em"}}>{cfg.label}</span>
                        {r._date&&<span style={{fontSize:11,color:"var(--text-muted)",background:"var(--bg-card)",padding:"2px 7px",borderRadius:5,border:"1px solid var(--border)"}}>{r._date}</span>}
                      </div>
                      {r.finalStatus&&<Badge status={r.finalStatus} cfg={FINAL_STATUS_CFG}/>}
                      {r.partStatus&&<Badge status={r.partStatus}/>}
                    </div>
                    {renderDetail(r)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

function SearchPage({initialQuery=""}) {
  const [query,setQuery]=useState(initialQuery);
  const [movements,setMovements]=useState([]);
  const [issued,setIssued]=useState([]);
  const [vehicles,setVehicles]=useState([]);
  const [vendors,setVendors]=useState([]);
  useEffect(()=>{
    load('movements').then(setMovements);
    load('issued').then(setIssued);
    load('vehicles').then(setVehicles);
    load('vendors').then(setVendors);
  },[]);
  const q=query.toLowerCase().trim();

  const results=useMemo(()=>{
    if(!q)return{movements:[],issued:[],vehicles:[],vendors:[]};
    return {
      movements:movements.filter(m=>[m.vehicleNumber,m.itemName,m.itemCode,m.vendorName,m.status].some(f=>(f||"").toLowerCase().includes(q))),
      issued:issued.filter(r=>[r.vehicleNumber,r.itemName,r.itemCode,r.gpNumber,r.issuedBy].some(f=>(f||"").toLowerCase().includes(q))),
      vehicles:vehicles.filter(v=>[v.number,v.model].some(f=>(f||"").toLowerCase().includes(q))),
      vendors:vendors.filter(v=>[v.name,v.workshop,v.address].some(f=>(f||"").toLowerCase().includes(q))),
    };
  },[q]);

  const total=Object.values(results).reduce((s,a)=>s+a.length,0);

  return (
    <div>
      <PageHeading title="Global Search" sub="Search across all records"/>
      <div style={{position:"relative",maxWidth:560,marginBottom:22}}>
        <Icon name="search" size={17} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}/>
        <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search vehicles, parts, item codes, vendors..."
          className="search-input" style={{width:"100%",padding:"12px 16px 12px 44px",borderRadius:10,fontSize:15,fontFamily:"var(--font-body)",boxSizing:"border-box"}}/>
      </div>
      {q&&<div style={{fontSize:13,color:"var(--text-muted)",marginBottom:20}}>Found <span style={{color:"var(--accent)",fontWeight:700}}>{total}</span> result{total!==1?"s":""} for "<span style={{color:"var(--text-primary)"}}>{query}</span>"</div>}
      {!q&&<div style={{color:"var(--text-muted)",fontSize:14}}>Type to search across all records...</div>}
      {q&&total===0&&<div style={{padding:48,textAlign:"center",color:"var(--text-muted)",fontSize:15}}>No results found.</div>}

      {results.movements.length>0&&(
        <SearchSection title="Maintenance Records" count={results.movements.length} color="var(--purple)">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Vehicle","Item","Code","Status","Vendor","Date"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>{results.movements.map(r=>(
              <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                <Td style={{color:"var(--accent)",fontWeight:700}}>{r.vehicleNumber}</Td>
                <Td style={{color:"var(--text-primary)"}}>{r.itemName}</Td>
                <Td><code style={{fontSize:12,background:"var(--bg-elevated)",padding:"2px 7px",borderRadius:5,color:"var(--cyan)"}}>{r.itemCode}</code></Td>
                <Td><Badge status={r.status}/></Td><Td style={{color:"var(--text-secondary)"}}>{r.vendorName||"—"}</Td><Td style={{color:"var(--text-muted)"}}>{r.issuedDate}</Td>
              </tr>
            ))}</tbody>
          </table>
        </SearchSection>
      )}

      {results.issued.length>0&&(
        <SearchSection title="Issued Parts" count={results.issued.length} color="var(--blue)">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Vehicle","Item","Code","GP Number","Issued By","Date"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>{results.issued.map(r=>(
              <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{transition:"background 0.1s"}}>
                <Td style={{color:"var(--accent)",fontWeight:700}}>{r.vehicleNumber}</Td>
                <Td style={{color:"var(--text-primary)"}}>{r.itemName}</Td>
                <Td><code style={{fontSize:12,background:"var(--bg-elevated)",padding:"2px 7px",borderRadius:5,color:"var(--cyan)"}}>{r.itemCode}</code></Td>
                <Td style={{color:"var(--text-secondary)"}}>{r.gpNumber||"—"}</Td><Td>{r.issuedBy||"—"}</Td><Td style={{color:"var(--text-muted)"}}>{r.issueDate}</Td>
              </tr>
            ))}</tbody>
          </table>
        </SearchSection>
      )}

      {results.vehicles.length>0&&(
        <SearchSection title="Vehicles" count={results.vehicles.length} color="var(--accent)">
          <div style={{display:"flex",gap:10,flexWrap:"wrap",padding:14}}>
            {results.vehicles.map(v=>(
              <div key={v.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border-bright)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{color:"var(--accent)"}}><Icon name="truck" size={16}/></div>
                <div><div style={{fontWeight:700,color:"var(--accent)",fontSize:13}}>{v.number}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>{v.model||"—"}</div></div>
              </div>
            ))}
          </div>
        </SearchSection>
      )}

      {results.vendors.length>0&&(
        <SearchSection title="Vendors" count={results.vendors.length} color="var(--cyan)">
          <div style={{display:"flex",gap:10,flexWrap:"wrap",padding:14}}>
            {results.vendors.map(v=>(
              <div key={v.id} style={{background:"var(--bg-surface)",border:"1px solid var(--border-bright)",borderRadius:10,padding:"10px 16px"}}>
                <div style={{fontWeight:700,color:"var(--text-primary)",fontSize:13}}>{v.name}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{v.workshop||"—"} · {v.contact||"—"}</div>
              </div>
            ))}
          </div>
        </SearchSection>
      )}
    </div>
  );
}
function ScrapBillPage() {
  const company = getCompany();
  const companyName = company === "aysis" ? "Aysis International Waste Management Com Pvt Ltd" : "AltasPak Waste Management Com Pvt Ltd";
  const username = "Asim";

  const [billNo, setBillNo] = useState(1);
  const formatBillNo = (n) => String(n).padStart(3, '0');
  const [dated, setDated] = useState(today());
  const [supplierName, setSupplierName] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [address, setAddress] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [contact, setContact] = useState("");
  const [balance, setBalance] = useState("");
  const [rows, setRows] = useState([
    {id:uid(), gpNo:"", itemDesc:"", qty:"", uom:"", rate:"", amount:""},
    {id:uid(), gpNo:"", itemDesc:"", qty:"", uom:"", rate:"", amount:""},
    {id:uid(), gpNo:"", itemDesc:"", qty:"", uom:"", rate:"", amount:""},
  ]);

  useEffect(() => {
    supabase.from('billconfig').select('*').eq('company', company).single().then(({data}) => {
      if(data) setBillNo(data.data.billNo||1);
    });
  }, []);

  const addRow = () => setRows(r => [...r, {id:uid(), gpNo:"", itemDesc:"", qty:"", uom:"", rate:"", amount:""}]);
  const removeRow = id => setRows(r => r.filter(x => x.id !== id));
  const updateRow = (id, key, val) => setRows(r => r.map(x => x.id === id ? {...x, [key]: val, amount: key==="qty"||key==="rate" ? (key==="qty"?Number(val)*Number(x.rate):Number(x.qty)*Number(val)).toString() : x.amount} : x));

  const incrementBillNo = async () => {
    const next = billNo + 1;
    await supabase.from('billconfig').update({data: {billNo: next}}).eq('company', company);
    setBillNo(next);
  };

  const exportPDF = async () => {
    const content = buildBillHTML(true);
    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
    win.print();
    await incrementBillNo();
  };

  const exportCSV = () => {
    const header = "S.No,GP No,Item Description,Qty,UOM,Rate,Amount";
    const body = rows.map((r,i) => `${i+1},"${r.gpNo}","${r.itemDesc}","${r.qty}","${r.uom}","${r.rate}","${r.amount}"`).join("\n");
    const blob = new Blob([header+"\n"+body], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `scrap-bill-${billNo}.csv`;
    a.click();
    incrementBillNo();
  };

  const buildBillHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; color: #000; }
        .company-name { text-align: center; font-size: 13px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; }
        .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; margin-bottom: 24px; }
        .header-field { display: flex; gap: 10px; align-items: flex-end; }
        .header-field label { font-weight: 700; white-space: nowrap; font-size: 13px; }
        .header-field span { border-bottom: 1px solid #000; flex: 1; min-width: 120px; padding: 0 4px; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f0f0f0; border: 1px solid #000; padding: 7px 10px; text-align: center; font-weight: 700; font-size: 12px; }
        td { border: 1px solid #000; padding: 6px 10px; text-align: center; font-size: 12px; }
        .footer-note { font-style: italic; text-align: center; margin-bottom: 24px; font-size: 12px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; }
        .sig-box { text-align: center; }
        .sig-line { border-top: 1px solid #000; padding-top: 6px; margin-top: 30px; font-size: 12px; font-weight: 700; }
        .sig-name { font-size: 11px; color: #333; margin-top: 4px; }
        @media print { 
          body { padding: 15px; }
          * { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div style="margin-top:20px;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:4px;">
        <img src="${company==="aysis" ? "./Aysis International Waste Management.png" : "./Pak altas.png"}" alt="logo" style="width:70px;height:70px;object-fit:contain;" onerror="this.style.display='none'"/>
        <div class="company-name" style="margin-top:0;">${companyName}</div>
      </div>
      <div style="text-align:center;font-size:14px;font-weight:800;letter-spacing:0.1em;margin-bottom:16px;">SCRAP BILL / CASH MEMO</div>
      <div class="header-grid">
        <div class="header-field"><label>Bill No:</label><span>${formatBillNo(billNo)}</span></div>
        <div class="header-field"><label>Bill Date:</label><span>${dated}</span></div>
        <div class="header-field"><label>Supplier Name:</label><span>${supplierName}</span></div>
        <div class="header-field"><label>Payment Mode:</label><span>${paymentMode}</span></div>
        <div class="header-field"><label>Address:</label><span>${address}</span></div>
        <div class="header-field"><label>Amount Paid:</label><span>${amountPaid}</span></div>
        <div class="header-field"><label>Contact No:</label><span>${contact}</span></div>
        <div class="header-field"><label>Balance:</label><span>${balance}</span></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>S.No</th><th>GP No</th><th>Item Description</th><th>Qty</th><th>UOM</th><th>Rate</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${r.gpNo}</td>
              <td>${r.itemDesc}</td>
              <td>${r.qty}</td>
              <td>${r.uom}</td>
              <td>${r.rate}</td>
              <td>${r.amount}</td>
            </tr>
          `).join("")}
          ${Array(Math.max(0, 8-rows.length)).fill('<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join("")}
        </tbody>
      </table>
      <div class="footer-note">Goods once sold cannot be taken back or exchanged.</div>
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-line">Prepared By</div>
          <div class="sig-name">${username}</div>
        </div>
        <div class="sig-box">
          <div class="sig-line">Approved By</div>
          <div class="sig-name"></div>
        </div>
        <div class="sig-box">
          <div class="sig-line">Received By</div>
          <div class="sig-name"></div>
        </div>
      </div>
    </body>
    </html>
  `;

  const inpS = {width:"100%",padding:"7px 10px",borderRadius:7,fontSize:13,background:"var(--bg-base)",border:"1px solid var(--border-bright)",color:"var(--text-primary)",fontFamily:"var(--font-body)"};
  const fieldInp = {width:"100%",background:"transparent",border:"none",borderBottom:"2px solid var(--border-bright)",outline:"none",color:"#e2e8f0",fontSize:14,fontFamily:"var(--font-body)",padding:"6px 0"};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Scrap Bill" sub={`Current Bill No: ${formatBillNo(billNo)}`}/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={exportCSV} className="action-btn-secondary"><Icon name="download" size={15}/> Export CSV</button>
          <button onClick={exportPDF} className="action-btn-primary"><Icon name="download" size={15}/> Export PDF</button>
        </div>
      </div>

      <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
        {/* Company Name */}
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:14,borderBottom:"2px solid var(--border-bright)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:8}}>
           <img
              src={company==="aysis" ? "./Aysis International Waste Management.png" : "./Pak Altas white.png"}
              alt="Company Logo"
              style={{width:120,height:120,objectFit:"contain"}}
              onError={e=>e.target.style.display="none"}
            />
            <div style={{fontSize:18,fontWeight:900,color:"var(--text-primary)",textTransform:"uppercase",fontFamily:"var(--font-display)",letterSpacing:"-0.3px"}}>
              {companyName}
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:"var(--accent)",letterSpacing:"0.1em",fontFamily:"var(--font-display)"}}>
            SCRAP BILL / CASH MEMO
          </div>
        </div>

        {/* Header Fields */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 40px",marginBottom:20}}>
          {[
            {label:"Bill No", content:<div style={{borderBottom:"1px solid var(--border-bright)",padding:"4px 0",color:"var(--accent)",fontWeight:700,fontSize:13}}>{formatBillNo(billNo)}</div>},
            {label:"Bill Date", content:(
              <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                <input
                  value={dated}
                  onChange={e=>setDated(e.target.value)}
                  placeholder="e.g. 2-Dec-2026"
                  style={{...fieldInp}}
                />
                <input
                  type="date"
                  onChange={e=>{
                    if(!e.target.value) return;
                    const d = new Date(e.target.value);
                    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                    setDated(`${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`);
                  }}
                  style={{position:"absolute",right:0,width:24,height:24,opacity:0,cursor:"pointer"}}
                />
                <span style={{color:"var(--accent)",cursor:"pointer",flexShrink:0}}>
                  <Icon name="clock" size={16}/>
                </span>
              </div>
            )},
            {label:"Supplier Name", content:<input value={supplierName} onChange={e=>setSupplierName(e.target.value)} style={fieldInp}/>},
            {label:"Payment Mode", content:<input value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} style={fieldInp}/>},
            {label:"Address", content:<input value={address} onChange={e=>setAddress(e.target.value)} style={fieldInp}/>},
            {label:"Amount Paid", content:<input value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} style={fieldInp}/>},
            {label:"Contact No", content:<input value={contact} onChange={e=>setContact(e.target.value)} style={fieldInp}/>},
            {label:"Balance", content:<input value={balance} onChange={e=>setBalance(e.target.value)} style={fieldInp}/>},
          ].map(({label,content})=>(
            <div key={label} style={{display:"grid",gridTemplateColumns:"130px 1fr",alignItems:"end",gap:8}}>
              <label style={{fontSize:13,fontWeight:700,color:"#e2e8f0",whiteSpace:"nowrap",textAlign:"right"}}>{label}:</label>
              <div>{content}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{overflowX:"auto",marginBottom:16}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                {["S.No","GP No","Item Description","Qty","UOM","Rate","Amount",""].map(h=>(
                  <th key={h} style={{padding:"10px 12px",background:"var(--bg-elevated)",border:"1px solid var(--border-bright)",fontSize:12,fontWeight:800,color:"#e2e8f0",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={r.id}>
                  <td style={{padding:"6px 10px",border:"1px solid var(--border)",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>{i+1}</td>
                  {/* GP No */}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:100}}>
                    <input value={r.gpNo} onChange={e=>updateRow(r.id,"gpNo",e.target.value)}
                      style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:13,textAlign:"center",fontFamily:"var(--font-body)",padding:"4px"}}/>
                  </td>
                  {/* Item Description */}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:200}}>
                    <input value={r.itemDesc} onChange={e=>updateRow(r.id,"itemDesc",e.target.value)}
                      style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:13,textAlign:"center",fontFamily:"var(--font-body)",padding:"4px"}}/>
                  </td>
                  {/* Qty */}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:70}}>
                    <input value={r.qty} onChange={e=>updateRow(r.id,"qty",e.target.value)}
                      style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:13,textAlign:"center",fontFamily:"var(--font-body)",padding:"4px"}}/>
                  </td>
                  {/* UOM dropdown */}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:100}}>
                    <Select value={r.uom} onChange={e=>updateRow(r.id,"uom",e.target.value)}>
                      <option value="">Select</option>
                      <option value="Kgs">Kgs</option>
                      <option value="Ltrs">Ltrs</option>
                      <option value="Piece">Piece</option>
                      <option value="Set">Set</option>
                    </Select>
                  </td>
                  {/* Rate */}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:90}}>
                    <input value={r.rate} onChange={e=>updateRow(r.id,"rate",e.target.value)}
                      style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:13,textAlign:"center",fontFamily:"var(--font-body)",padding:"4px"}}/>
                  </td>
                  {/* Amount */}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:100}}>
                    <input value={r.amount} onChange={e=>updateRow(r.id,"amount",e.target.value)}
                      style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:13,textAlign:"center",fontFamily:"var(--font-body)",padding:"4px"}}/>
                  </td>
                  <td style={{padding:"4px 8px",border:"1px solid var(--border)",textAlign:"center"}}>
                    {rows.length>1&&<button onClick={()=>removeRow(r.id)}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.15)";e.currentTarget.style.transform="scale(1.2)";e.currentTarget.style.boxShadow="0 0 8px rgba(248,113,113,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}
                      style={{background:"none",border:"1px solid rgba(248,113,113,0.3)",cursor:"pointer",color:"var(--red)",padding:"4px 6px",borderRadius:6,transition:"all 0.18s",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="x" size={13}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addRow} className="action-btn-primary" style={{marginBottom:20,fontSize:13}}>
          <Icon name="plus" size={13}/> Add Row
        </button>

        {/* Footer */}
        <div style={{textAlign:"center",fontStyle:"italic",color:"var(--accent)",fontSize:14,fontWeight:700,marginBottom:24,paddingTop:12,borderTop:"1px solid var(--border-bright)"}}>
          Goods once sold cannot be taken back or exchanged.
        </div>

        {/* Signatures */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
          {[
            {label:"Prepared By", name:username},
            {label:"Approved By", name:""},
            {label:"Received By", name:""},
          ].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{height:40}}/>
              <div style={{borderTop:"1px solid var(--border-bright)",paddingTop:8,fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>{s.label}</div>
              <div style={{fontSize:13,color:"var(--accent)",marginTop:4,fontWeight:700}}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function VehicleMaintenanceForm() {
  const company = getCompany();
  const companyName = company === "aysis" ? "Aysis International Waste Management Com Pvt Ltd" : "AltasPak Waste Management Com Pvt Ltd";

  const [workshopName, setWorkshopName] = useState("");
  const [requestNo, setRequestNo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [date, setDate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [itemName, setItemName] = useState("");
  const [mechanicName, setMechanicName] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [actionRequired, setActionRequired] = useState([]);
  const [othersSpecify, setOthersSpecify] = useState("");
  const [issuedByTop, setIssuedByTop] = useState("");
  const [issuedToTop, setIssuedToTop] = useState("");
  const [issuedByBottom, setIssuedByBottom] = useState("");
  const [issuedToBottom, setIssuedToBottom] = useState("");
  const [storeIncharge, setStoreIncharge] = useState("");
  const [adminHead, setAdminHead] = useState("");
  const [mechanicIncharge, setMechanicIncharge] = useState("");
  const [workshopIncharge, setWorkshopIncharge] = useState("");

  const [issuedRows, setIssuedRows] = useState([
    {id:uid(), date:"", issueCount:"", vehicleNo:"", itemDesc:"", itemCode:"", qtyIssued:"", status:"", mechanicName:"", bookIssuanceNo:""},
    {id:uid(), date:"", issueCount:"", vehicleNo:"", itemDesc:"", itemCode:"", qtyIssued:"", status:"", mechanicName:"", bookIssuanceNo:""},
    {id:uid(), date:"", issueCount:"", vehicleNo:"", itemDesc:"", itemCode:"", qtyIssued:"", status:"", mechanicName:"", bookIssuanceNo:""},
  ]);
  const [repairRows, setRepairRows] = useState([
    {id:uid(), dateOut:"", ogpNo:"", vehicleNo:"", itemDesc:"", qty:"", vendorName:"", dateIn:"", igpNo:"", status:""},
    {id:uid(), dateOut:"", ogpNo:"", vehicleNo:"", itemDesc:"", qty:"", vendorName:"", dateIn:"", igpNo:"", status:""},
    {id:uid(), dateOut:"", ogpNo:"", vehicleNo:"", itemDesc:"", qty:"", vendorName:"", dateIn:"", igpNo:"", status:""},
  ]);

  const toggleAction = (val) => setActionRequired(prev => prev.includes(val) ? prev.filter(x=>x!==val) : [...prev, val]);

  const addIssuedRow = () => setIssuedRows(r=>[...r,{id:uid(),date:"",issueCount:"",vehicleNo:"",itemDesc:"",itemCode:"",qtyIssued:"",status:"",mechanicName:"",bookIssuanceNo:""}]);
  const removeIssuedRow = id => setIssuedRows(r=>r.filter(x=>x.id!==id));
  const updateIssuedRow = (id,key,val) => setIssuedRows(r=>r.map(x=>x.id===id?{...x,[key]:val}:x));

  const addRepairRow = () => setRepairRows(r=>[...r,{id:uid(),dateOut:"",ogpNo:"",vehicleNo:"",itemDesc:"",qty:"",vendorName:"",dateIn:"",igpNo:"",status:""}]);
  const removeRepairRow = id => setRepairRows(r=>r.filter(x=>x.id!==id));
  const updateRepairRow = (id,key,val) => setRepairRows(r=>r.map(x=>x.id===id?{...x,[key]:val}:x));

  const fieldInp = {width:"100%",background:"transparent",border:"none",borderBottom:"2px solid var(--border-bright)",outline:"none",color:"#e2e8f0",fontSize:13,fontFamily:"var(--font-body)",padding:"4px 0"};
  const cellInp = {width:"100%",background:"transparent",border:"none",outline:"none",color:"var(--text-primary)",fontSize:12,textAlign:"center",fontFamily:"var(--font-body)",padding:"3px"};

  const buildPDF = () => `
    <!DOCTYPE html><html><head><style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:Arial,sans-serif;padding:24px;font-size:12px;color:#000;}
      .title{text-align:center;font-size:16px;font-weight:900;text-transform:uppercase;margin-bottom:4px;}
      .subtitle{text-align:center;font-size:12px;margin-bottom:16px;}
      .header-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;}
      .field-row{display:grid;grid-template-columns:1fr 1fr;gap:8px 40px;margin-bottom:12px;}
      .field{display:flex;gap:6px;align-items:flex-end;}
      .field label{font-weight:700;white-space:nowrap;font-size:11px;}
      .field span{border-bottom:1px solid #000;flex:1;min-width:80px;padding-bottom:2px;}
      .section-title{font-weight:800;font-size:12px;margin:14px 0 6px;border-bottom:2px solid #000;padding-bottom:4px;}
      table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:10px;}
      th{background:#f0f0f0;border:1px solid #000;padding:5px 6px;text-align:center;font-weight:700;}
      td{border:1px solid #000;padding:4px 6px;text-align:center;}
      .checkbox-row{margin:8px 0;font-size:11px;}
      .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:30px;}
      .sig-box{text-align:center;}
      .sig-line{border-top:1px solid #000;padding-top:4px;margin-top:24px;font-size:11px;font-weight:700;}
      .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px;}
      @media print{body{padding:12px;}*{page-break-inside:avoid;}}
    </style></head><body>
      <div class="header-logo">
        <img src="${company==="aysis"?"./Aysis International Waste Management.png":"./Pak altas.png"}" style="width:60px;height:60px;object-fit:contain;" onerror="this.style.display='none'"/>
        <div>
          <div class="title">${companyName}</div>
          <div class="title" style="font-size:13px;">VEHICLE MAINTENANCE FORM</div>
        </div>
      </div>
      <div class="subtitle">Workshop Name: ${workshopName}</div>
      <div class="field-row">
        <div class="field"><label>Request #:</label><span>${requestNo}</span></div>
        <div class="field"><label>Vehicle #:</label><span>${vehicleNo}</span></div>
        <div class="field"><label>Date:</label><span>${date}</span></div>
        <div class="field"><label>Driver Name:</label><span>${driverName}</span></div>
        <div class="field"><label>Item Name:</label><span>${itemName}</span></div>
        <div class="field"><label>Mechanic Name:</label><span>${mechanicName}</span></div>
      </div>
      <div class="section-title">Vehicle Maintenance / Repair Notes (to be filled by Workshop Incharge):</div>
      <div style="border:1px solid #000;min-height:60px;padding:6px;margin-bottom:10px;">${maintenanceNotes}</div>
      <div class="checkbox-row">
        <strong>Action Required for Returned Part(s):</strong>&nbsp;&nbsp;
        ${["Repair","Scrap","Re-Issue","Others"].map(a=>`<span style="margin-right:16px;">[${actionRequired.includes(a)?"✓":" "}] ${a}${a==="Others"?" Specify: "+othersSpecify:""}</span>`).join("")}
      </div>
      <div class="sig-grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px;">
        <div class="sig-box"><div class="sig-line">Mechanic Incharge</div><div style="font-size:10px;margin-top:3px;">${mechanicIncharge}</div></div>
        <div class="sig-box"><div class="sig-line">Workshop Incharge</div><div style="font-size:10px;margin-top:3px;">${workshopIncharge}</div></div>
      </div>
      <div class="section-title">Issued & Replaced Vehicle Parts Details (to be filled by Stores Dept):</div>
      <table>
        <thead><tr><th>Date</th><th>Issue Count</th><th>Vehicle #</th><th>Item Name / Description</th><th>Item Code</th><th>Qty Issued</th><th>Status</th><th>Mechanic Name</th><th>Book Issuance #</th></tr></thead>
        <tbody>
          ${issuedRows.map(r=>`<tr><td>${r.date}</td><td>${r.issueCount}</td><td>${r.vehicleNo}</td><td>${r.itemDesc}</td><td>${r.itemCode}</td><td>${r.qtyIssued}</td><td>${r.status}</td><td>${r.mechanicName}</td><td>${r.bookIssuanceNo}</td></tr>`).join("")}
          ${Array(Math.max(0,5-issuedRows.length)).fill("<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}
        </tbody>
      </table>
      <div class="two-col" style="margin-bottom:16px;">
        <div class="field"><label>Issued by:</label><span>${issuedByTop}</span></div>
        <div class="field"><label>Issued to:</label><span>${issuedToTop}</span></div>
      </div>
      <div class="section-title">Vehicle Parts Sent For Repairing Purpose (to be filled by Stores Dept):</div>
      <table>
        <thead><tr><th>Date Out</th><th>OGP #</th><th>Vehicle #</th><th>Item Name / Description</th><th>Qty</th><th>Vendor Name</th><th>Date In</th><th>IGP #</th><th>Status</th></tr></thead>
        <tbody>
          ${repairRows.map(r=>`<tr><td>${r.dateOut}</td><td>${r.ogpNo}</td><td>${r.vehicleNo}</td><td>${r.itemDesc}</td><td>${r.qty}</td><td>${r.vendorName}</td><td>${r.dateIn}</td><td>${r.igpNo}</td><td>${r.status}</td></tr>`).join("")}
          ${Array(Math.max(0,5-repairRows.length)).fill("<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}
        </tbody>
      </table>
      <div class="two-col">
        <div class="field"><label>Issued by:</label><span>${issuedByBottom}</span></div>
        <div class="field"><label>Store Incharge Sign:</label><span>${storeIncharge}</span></div>
        <div class="field"><label>Issued to:</label><span>${issuedToBottom}</span></div>
        <div class="field"><label>Admin & Procurement Head Sign:</label><span>${adminHead}</span></div>
      </div>
    </body></html>
  `;

  const exportPDF = () => {
    const win = window.open('','_blank');
    win.document.write(buildPDF());
    win.document.close();
    win.print();
  };

  const exportCSV = () => {
    let csv = "VEHICLE MAINTENANCE FORM\n";
    csv += `Workshop Name,${workshopName}\nRequest #,${requestNo}\nVehicle #,${vehicleNo}\nDate,${date}\nDriver Name,${driverName}\nItem Name,${itemName}\nMechanic Name,${mechanicName}\n\n`;
    csv += "ISSUED PARTS\nDate,Issue Count,Vehicle #,Item Description,Item Code,Qty Issued,Status,Mechanic Name,Book Issuance #\n";
    csv += issuedRows.map(r=>`${r.date},${r.issueCount},${r.vehicleNo},"${r.itemDesc}",${r.itemCode},${r.qtyIssued},${r.status},${r.mechanicName},${r.bookIssuanceNo}`).join("\n");
    csv += "\n\nREPAIR PARTS\nDate Out,OGP #,Vehicle #,Item Description,Qty,Vendor Name,Date In,IGP #,Status\n";
    csv += repairRows.map(r=>`${r.dateOut},${r.ogpNo},${r.vehicleNo},"${r.itemDesc}",${r.qty},${r.vendorName},${r.dateIn},${r.igpNo},${r.status}`).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="vehicle-maintenance-form.csv"; a.click();
  };

  const sectionTitle = (title) => (
    <div style={{gridColumn:"1/-1",fontSize:13,fontWeight:800,color:"var(--text-primary)",borderBottom:"2px solid var(--border-bright)",paddingBottom:8,marginTop:16,marginBottom:8}}>
      {title}
    </div>
  );

  const tblInp = (val, onChange) => (
    <input value={val} onChange={onChange} style={cellInp}/>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PageHeading title="Vehicle Maintenance Form" sub="Fill and export as PDF or CSV"/>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={exportCSV} className="action-btn-secondary"><Icon name="download" size={15}/> Export CSV</button>
          <button onClick={exportPDF} className="action-btn-primary"><Icon name="download" size={15}/> Export PDF</button>
        </div>
      </div>

      <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20,paddingBottom:14,borderBottom:"2px solid var(--border-bright)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:6}}>
            <img src={company==="aysis"?"./Aysis International Waste Management.png":"./Pak Altas white.png"} alt="logo" style={{width:80,height:80,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:"var(--text-primary)",textTransform:"uppercase",fontFamily:"var(--font-display)"}}>{companyName}</div>
              <div style={{fontSize:14,fontWeight:800,color:"var(--accent)",letterSpacing:"0.08em",marginTop:4}}>VEHICLE MAINTENANCE FORM</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:8}}>
            <label style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>Workshop Name:</label>
            <input value={workshopName} onChange={e=>setWorkshopName(e.target.value)} placeholder="Enter workshop name" style={{...fieldInp,width:220}}/>
          </div>
        </div>

        {/* Top fields */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 40px",marginBottom:16}}>
          {[
            {label:"Request #", val:requestNo, set:setRequestNo},
            {label:"Vehicle #", val:vehicleNo, set:setVehicleNo},
            {label:"Date", val:date, set:setDate},
            {label:"Driver Name", val:driverName, set:setDriverName},
            {label:"Item Name", val:itemName, set:setItemName},
            {label:"Mechanic Name", val:mechanicName, set:setMechanicName},
          ].map(({label,val,set})=>(
            <div key={label} style={{display:"grid",gridTemplateColumns:"140px 1fr",alignItems:"end",gap:8}}>
              <label style={{fontSize:13,fontWeight:700,color:"#e2e8f0",textAlign:"right"}}>{label}:</label>
              <input value={val} onChange={e=>set(e.target.value)} style={fieldInp}/>
            </div>
          ))}
        </div>

        {/* Maintenance Notes */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,color:"var(--text-primary)",borderBottom:"2px solid var(--border-bright)",paddingBottom:6,marginBottom:10}}>
            Vehicle Maintenance / Repair Notes (to be filled by Workshop Incharge):
          </div>
          <textarea value={maintenanceNotes} onChange={e=>setMaintenanceNotes(e.target.value)} placeholder="Enter maintenance/repair notes..."
            style={{width:"100%",background:"var(--bg-elevated)",border:"1px solid var(--border-bright)",borderRadius:8,padding:"10px 12px",color:"#e2e8f0",fontSize:13,fontFamily:"var(--font-body)",minHeight:80,resize:"vertical",outline:"none"}}/>
        </div>

        {/* Action Required */}
        <div style={{marginBottom:16,padding:"12px 16px",background:"var(--bg-elevated)",borderRadius:10,border:"1px solid var(--border-bright)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:10}}>Action Required for Returned Part(s):</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
            {["Repair","Scrap","Re-Issue","Others"].map(a=>(
              <label key={a} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:"var(--text-secondary)",fontSize:13,fontWeight:600}}>
                <input type="checkbox" checked={actionRequired.includes(a)} onChange={()=>toggleAction(a)}
                  style={{width:16,height:16,accentColor:"var(--accent)",cursor:"pointer"}}/>
                {a}
              </label>
            ))}
            {actionRequired.includes("Others")&&(
              <input value={othersSpecify} onChange={e=>setOthersSpecify(e.target.value)} placeholder="Specify..."
                style={{...fieldInp,width:180}}/>
            )}
          </div>
        </div>

        {/* Workshop signatures */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 40px",marginBottom:20}}>
          {[
            {label:"Mechanic Incharge", val:mechanicIncharge, set:setMechanicIncharge},
            {label:"Workshop Incharge", val:workshopIncharge, set:setWorkshopIncharge},
          ].map(({label,val,set})=>(
            <div key={label} style={{display:"grid",gridTemplateColumns:"160px 1fr",alignItems:"end",gap:8}}>
              <label style={{fontSize:13,fontWeight:700,color:"#e2e8f0",textAlign:"right"}}>{label}:</label>
              <input value={val} onChange={e=>set(e.target.value)} style={fieldInp}/>
            </div>
          ))}
        </div>

        {/* Issued Parts Table */}
        <div style={{fontSize:13,fontWeight:800,color:"var(--text-primary)",borderBottom:"2px solid var(--border-bright)",paddingBottom:6,marginBottom:10}}>
          Issued & Replaced Vehicle Parts Details (to be filled by Stores Dept):
        </div>
        <div style={{overflowX:"auto",marginBottom:10}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Date","Issue Count","Vehicle #","Item Name / Description","Item Code","Qty Issued","Status (New/Used/Repaired)","Mechanic Name","Book Issuance #",""].map(h=>(
                <th key={h} style={{padding:"8px 10px",background:"var(--bg-elevated)",border:"1px solid var(--border-bright)",fontSize:11,fontWeight:800,color:"#e2e8f0",textAlign:"center",textTransform:"uppercase"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {issuedRows.map((r,i)=>(
                <tr key={r.id}>
                  {[
                    {k:"date"},{k:"issueCount"},{k:"vehicleNo"},{k:"itemDesc"},{k:"itemCode"},{k:"qtyIssued"},
                  ].map(({k})=>(
                    <td key={k} style={{border:"1px solid var(--border)",padding:"2px 4px"}}>
                      {tblInp(r[k],e=>updateIssuedRow(r.id,k,e.target.value))}
                    </td>
                  ))}
                  <td style={{padding:"4px 6px",border:"1px solid var(--border)",minWidth:120}}>
                    <Select value={r.status} onChange={e=>updateIssuedRow(r.id,"status",e.target.value)}>
                      <option value="">Select</option>
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Repaired">Repaired</option>
                    </Select>
                  </td>
                  {[{k:"mechanicName"},{k:"bookIssuanceNo"}].map(({k})=>(
                    <td key={k} style={{border:"1px solid var(--border)",padding:"2px 4px"}}>
                      {tblInp(r[k],e=>updateIssuedRow(r.id,k,e.target.value))}
                    </td>
                  ))}
                  <td style={{border:"1px solid var(--border)",padding:"2px 4px",textAlign:"center"}}>
                    {issuedRows.length>1&&<button onClick={()=>removeIssuedRow(r.id)}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.15)";e.currentTarget.style.transform="scale(1.2)";e.currentTarget.style.boxShadow="0 0 8px rgba(248,113,113,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}
                      style={{background:"none",border:"1px solid rgba(248,113,113,0.3)",cursor:"pointer",color:"var(--red)",padding:"4px 6px",borderRadius:6,transition:"all 0.18s",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="x" size={12}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addIssuedRow} className="action-btn-primary" style={{marginBottom:16,fontSize:12}}>
          <Icon name="plus" size={12}/> Add Row
        </button>

        {/* Issued by/to top */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 40px",marginBottom:20}}>
          {[
            {label:"Issued by", val:issuedByTop, set:setIssuedByTop},
            {label:"Issued to", val:issuedToTop, set:setIssuedToTop},
          ].map(({label,val,set})=>(
            <div key={label} style={{display:"grid",gridTemplateColumns:"100px 1fr",alignItems:"end",gap:8}}>
              <label style={{fontSize:13,fontWeight:700,color:"#e2e8f0",textAlign:"right"}}>{label}:</label>
              <input value={val} onChange={e=>set(e.target.value)} style={fieldInp}/>
            </div>
          ))}
        </div>

        {/* Repair Parts Table */}
        <div style={{fontSize:13,fontWeight:800,color:"var(--text-primary)",borderBottom:"2px solid var(--border-bright)",paddingBottom:6,marginBottom:10}}>
          Vehicle Parts Sent For Repairing Purpose (to be filled by Stores Dept):
        </div>
        <div style={{overflowX:"auto",marginBottom:10}} className="scrollbar-dark">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Date Out","OGP #","Vehicle #","Item Name / Description","Qty","Vendor Name","Date In","IGP #","Status",""].map(h=>(
                <th key={h} style={{padding:"8px 10px",background:"var(--bg-elevated)",border:"1px solid var(--border-bright)",fontSize:11,fontWeight:800,color:"#e2e8f0",textAlign:"center",textTransform:"uppercase"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {repairRows.map((r,i)=>(
                <tr key={r.id}>
                  {[{k:"dateOut"},{k:"ogpNo"},{k:"vehicleNo"},{k:"itemDesc"},{k:"qty"},{k:"vendorName"},{k:"dateIn"},{k:"igpNo"},{k:"status"}].map(({k})=>(
                    <td key={k} style={{border:"1px solid var(--border)",padding:"2px 4px"}}>
                      {tblInp(r[k],e=>updateRepairRow(r.id,k,e.target.value))}
                    </td>
                  ))}
                  <td style={{border:"1px solid var(--border)",padding:"2px 4px",textAlign:"center"}}>
                    {repairRows.length>1&&<button onClick={()=>removeRepairRow(r.id)}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.15)";e.currentTarget.style.transform="scale(1.2)";e.currentTarget.style.boxShadow="0 0 8px rgba(248,113,113,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}
                      style={{background:"none",border:"1px solid rgba(248,113,113,0.3)",cursor:"pointer",color:"var(--red)",padding:"4px 6px",borderRadius:6,transition:"all 0.18s",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="x" size={12}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addRepairRow} className="action-btn-primary" style={{marginBottom:16,fontSize:12}}>
          <Icon name="plus" size={12}/> Add Row
        </button>

        {/* Bottom signatures */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 40px",marginTop:8}}>
          {[
            {label:"Issued by", val:issuedByBottom, set:setIssuedByBottom},
            {label:"Store Incharge Sign", val:storeIncharge, set:setStoreIncharge},
            {label:"Issued to", val:issuedToBottom, set:setIssuedToBottom},
            {label:"Admin & Procurement Head Sign", val:adminHead, set:setAdminHead},
          ].map(({label,val,set})=>(
            <div key={label} style={{display:"grid",gridTemplateColumns:"200px 1fr",alignItems:"end",gap:8}}>
              <label style={{fontSize:13,fontWeight:700,color:"#e2e8f0",textAlign:"right"}}>{label}:</label>
              <input value={val} onChange={e=>set(e.target.value)} style={fieldInp}/>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
function SearchSection({title,count,children,color="var(--blue)"}) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:3,height:16,borderRadius:2,background:color}}/>
        <h2 style={{margin:0,fontSize:14,fontWeight:700,color:"var(--text-primary)",fontFamily:"var(--font-display)"}}>{title}</h2>
        <span style={{background:`${color}20`,color,border:`1px solid ${color}40`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{count}</span>
      </div>
      <div className="table-wrapper" style={{overflow:"hidden"}}>{children}</div>
    </div>
  );
}
