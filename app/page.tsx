"use client";
import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { Moon, Sun, Search, X, Download, ChevronRight, Activity, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Users, Brain, BarChart2, CheckCircle2 } from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface OS {
  id: string; descricao: string; ativo: string;
  criticidade: "critica" | "alta" | "media" | "baixa";
  status: "aberta" | "planejada" | "execucao" | "concluida" | "cancelada";
  dataPrevista: string; diasPraza: number; hhNecessario: number;
  equipDisponivel: number; responsavel: string; materialBloqueado: boolean;
  prioridade: number; risco: number; urgencia: number; impacto: number; criadoEm: string;
}

// ─────────────────────────────────────────────
// 10 OS — DADOS REAIS
// ─────────────────────────────────────────────
const MOCK_OS: OS[] = [
  { id:"OS-1052", descricao:"Cobertura com Vazamento — Torre A", ativo:"Cobertura Torre A", criticidade:"critica", status:"aberta", dataPrevista:"2025-02-15", diasPraza:2, hhNecessario:12, equipDisponivel:70, responsavel:"João Silva", materialBloqueado:true, prioridade:9, risco:9, urgencia:8, impacto:8, criadoEm:"2025-02-01" },
  { id:"OS-1048", descricao:"Manutenção Bombas HVAC — Zona 2", ativo:"HVAC Zona 2", criticidade:"alta", status:"planejada", dataPrevista:"2025-02-20", diasPraza:7, hhNecessario:8, equipDisponivel:50, responsavel:"Maria Costa", materialBloqueado:true, prioridade:7, risco:7, urgencia:6, impacto:7, criadoEm:"2025-02-03" },
  { id:"OS-1061", descricao:"Limpeza de Filtros HVAC — Bloco B", ativo:"HVAC Bloco B", criticidade:"media", status:"aberta", dataPrevista:"2025-02-28", diasPraza:15, hhNecessario:6, equipDisponivel:80, responsavel:"Pedro Lima", materialBloqueado:false, prioridade:5, risco:4, urgencia:4, impacto:5, criadoEm:"2025-02-05" },
  { id:"OS-1039", descricao:"Vazamento Emergencial — Subsolo", ativo:"Subsolo / Cisterna", criticidade:"critica", status:"execucao", dataPrevista:"2025-02-10", diasPraza:-3, hhNecessario:16, equipDisponivel:60, responsavel:"Ana Souza", materialBloqueado:false, prioridade:10, risco:10, urgencia:10, impacto:9, criadoEm:"2025-01-28" },
  { id:"OS-1055", descricao:"Inspeção Estrutural — Torre B", ativo:"Estrutura Torre B", criticidade:"critica", status:"aberta", dataPrevista:"2025-03-08", diasPraza:20, hhNecessario:20, equipDisponivel:90, responsavel:"Carlos Neto", materialBloqueado:false, prioridade:9, risco:8, urgencia:7, impacto:9, criadoEm:"2025-02-01" },
  { id:"OS-1064", descricao:"Substituição Luminárias LED — Garagem", ativo:"Garagem", criticidade:"alta", status:"planejada", dataPrevista:"2025-02-25", diasPraza:12, hhNecessario:10, equipDisponivel:40, responsavel:"Beatriz Melo", materialBloqueado:false, prioridade:6, risco:5, urgencia:5, impacto:6, criadoEm:"2025-02-06" },
  { id:"OS-1047", descricao:"Inspeção SPDA / Para-Raios", ativo:"SPDA Geral", criticidade:"alta", status:"aberta", dataPrevista:"2025-03-01", diasPraza:16, hhNecessario:8, equipDisponivel:70, responsavel:"Fernando Dias", materialBloqueado:false, prioridade:7, risco:8, urgencia:6, impacto:7, criadoEm:"2025-02-04" },
  { id:"OS-1059", descricao:"Pintura Fachada — Bloco C", ativo:"Fachada Bloco C", criticidade:"baixa", status:"planejada", dataPrevista:"2025-03-15", diasPraza:30, hhNecessario:40, equipDisponivel:60, responsavel:"Juliana Rosa", materialBloqueado:false, prioridade:3, risco:2, urgencia:2, impacto:3, criadoEm:"2025-02-07" },
  { id:"OS-1063", descricao:"Manutenção Elevadores — Torres A/B", ativo:"Elevadores", criticidade:"alta", status:"planejada", dataPrevista:"2025-02-22", diasPraza:9, hhNecessario:14, equipDisponivel:30, responsavel:"Roberto Alves", materialBloqueado:false, prioridade:8, risco:7, urgencia:7, impacto:8, criadoEm:"2025-02-02" },
  { id:"OS-1071", descricao:"Revisão Subestação Elétrica", ativo:"Subestação", criticidade:"critica", status:"aberta", dataPrevista:"2025-02-18", diasPraza:5, hhNecessario:24, equipDisponivel:50, responsavel:"Marcos Torres", materialBloqueado:true, prioridade:10, risco:10, urgencia:9, impacto:10, criadoEm:"2025-01-30" },
];

// ─────────────────────────────────────────────
// SCORE SIGMA ALGORITHM
// ─────────────────────────────────────────────
function calcScore(os: OS) {
  const hh = Math.min(os.hhNecessario / 4, 10);
  const d = os.equipDisponivel / 10;
  const b = os.materialBloqueado ? 3 : 0;
  const s = Math.max(0, Math.min(10, os.prioridade*0.2 + os.risco*0.25 + os.urgencia*0.2 + os.impacto*0.15 + hh*0.1 + d*0.1 - b*0.3));
  return { score: parseFloat(s.toFixed(1)), detalhes: { Prioridade: os.prioridade, Risco: os.risco, Urgência: os.urgencia, Impacto: os.impacto, HH: parseFloat(hh.toFixed(1)), Disponib: parseFloat(d.toFixed(1)) } };
}

function scoreColor(s: number) { return s >= 8 ? "#ef4444" : s >= 6 ? "#f97316" : s >= 4 ? "#eab308" : "#10b981"; }
function scoreLabel(s: number) { return s >= 8 ? "CRÍTICO" : s >= 6 ? "ALTO" : s >= 4 ? "MÉDIO" : "BAIXO"; }

const CRIT_CLR: Record<string,string> = { critica:"#ef4444", alta:"#f97316", media:"#eab308", baixa:"#22c55e" };
const STAT_CLR: Record<string,string> = { aberta:"#3b82f6", planejada:"#8b5cf6", execucao:"#00d4ff", concluida:"#10b981", cancelada:"#6b7280" };

function analiseIA(os: OS, score: number) {
  if (os.diasPraza < 0) return `⚠️ OS-${os.id} está ATRASADA ${Math.abs(os.diasPraza)} dias. Replanejamento urgente e alocação imediata de recursos necessários.`;
  if (score >= 8) return `🔴 Score ${score}/10 indica prioridade máxima. Executar em até ${os.diasPraza} dias com equipe preferencial. Monitorar diariamente.`;
  if (score >= 6) return `🟠 Score ${score}/10. Planejar execução nos próximos ${os.diasPraza} dias. Verificar disponibilidade de materiais e equipe.`;
  return `🟢 Score ${score}/10. Situação controlada. Executar conforme cronograma. Prazo de ${os.diasPraza} dias é adequado.`;
}

// ─────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0d1423", border:"1px solid rgba(99,179,237,0.2)", borderRadius:8, padding:"10px 14px", fontSize:12, fontFamily:"DM Mono" }}>
      <p style={{ color:"#64748b", marginBottom:6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || "#00d4ff" }}>{p.name}: <strong>{p.value}{p.unit || ""}</strong></p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// SCORE RING SVG
// ─────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const clr = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth={6}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter:`drop-shadow(0 0 6px ${clr})`, transition:"stroke-dasharray 1s ease" }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em" fill={clr}
        style={{ fontFamily:"DM Mono", fontWeight:700, fontSize: size > 60 ? 18 : 13 }}>{score}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function SigmaAI() {
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fCrit, setFCrit] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [modal, setModal] = useState<any>(null);
  const [iaText, setIaText] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [tab, setTab] = useState<"os"|"graficos"|"intel"|"equipe">("os");
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const osData = useMemo(() => MOCK_OS.map(o => ({ ...o, ...calcScore(o) })), []);

  const filtered = useMemo(() => {
    let arr = osData.filter(o =>
      (o.id+o.descricao+o.responsavel).toLowerCase().includes(search.toLowerCase()) &&
      (!fStatus || o.status === fStatus) &&
      (!fCrit || o.criticidade === fCrit)
    );
    if (sortBy === "score") arr.sort((a,b) => b.score-a.score);
    else if (sortBy === "prazo") arr.sort((a,b) => a.diasPraza-b.diasPraza);
    else arr.sort((a,b) => b.hhNecessario-a.hhNecessario);
    return arr;
  }, [osData, search, fStatus, fCrit, sortBy]);

  const kpis = useMemo(() => ({
    abertas: MOCK_OS.filter(o => ["aberta","planejada","execucao"].includes(o.status)).length,
    hh: MOCK_OS.reduce((s,o)=>s+o.hhNecessario,0),
    atrasos: MOCK_OS.filter(o=>o.diasPraza<0&&o.status!=="concluida").length,
    aderencia: Math.round((MOCK_OS.filter(o=>o.diasPraza>=0).length/MOCK_OS.length)*100),
    criticas: MOCK_OS.filter(o=>o.criticidade==="critica"&&o.status!=="concluida").length,
    bloqueadas: MOCK_OS.filter(o=>o.materialBloqueado).length,
  }), []);

  const conflitos = useMemo(() => {
    const c: any[] = [];
    MOCK_OS.forEach(o => {
      if (o.materialBloqueado && o.status!=="concluida") c.push({ sev:"alta", msg:`${o.id}: Materiais bloqueando execução`, rec:"Contatar fornecedores. Avaliar substitutos.", tipo:"🔒 Material" });
      if (o.diasPraza<0 && !["concluida","cancelada"].includes(o.status)) c.push({ sev:"critica", msg:`${o.id}: ATRASADA ${Math.abs(o.diasPraza)} dias`, rec:"Replanejamento urgente. Considerar recursos extras.", tipo:"⏱ Atraso" });
      if (o.equipDisponivel<40 && ["aberta","planejada"].includes(o.status)) c.push({ sev:"alta", msg:`${o.id}: Equipe ${o.equipDisponivel}% disponível`, rec:"Redistribuir ou contratar temporariamente.", tipo:"👥 Equipe" });
      if (o.criticidade==="critica" && o.diasPraza<=5 && o.diasPraza>=0) c.push({ sev:"critica", msg:`${o.id}: Ativo crítico com prazo em ${o.diasPraza}d`, rec:"Executar HOJE. Preparar plano de contingência.", tipo:"⚡ Risco" });
    });
    return c;
  }, []);

  const recs = useMemo(() => {
    const r: any[] = [];
    const top = [...osData].sort((a,b)=>b.score-a.score)[0];
    if (top) r.push({ titulo:"🔴 Prioridade Máxima", desc:`${top.id}: ${top.descricao}`, acao:"Iniciar execução imediatamente.", imp:"alta" });
    if (conflitos.filter(c=>c.sev==="critica").length>0) r.push({ titulo:"⚠️ Conflitos Críticos", desc:`${conflitos.filter(c=>c.sev==="critica").length} conflito(s) aguardando resolução`, acao:"Revisar seção de Conflitos.", imp:"alta" });
    if (kpis.bloqueadas>0) r.push({ titulo:"🔧 Materiais Pendentes", desc:`${kpis.bloqueadas} OS(s) bloqueadas`, acao:"Contatar fornecedores. Verificar alternativas.", imp:"media" });
    if (kpis.atrasos>0) r.push({ titulo:"📅 Replanejamento", desc:`${kpis.atrasos} OS(s) atrasadas`, acao:"Reorganizar cronograma com novo Score Sigma.", imp:"alta" });
    r.push({ titulo:"📈 Preventiva vs Corretiva", desc:"60% corretiva vs 40% preventiva", acao:"Aumentar investimento em preventiva para reduzir emergências.", imp:"media" });
    return r;
  }, [osData, conflitos, kpis]);

  const showToast = (msg: string, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3000);
  };

  const openModal = (os: any) => {
    setModal(os); setIaText(""); setIaLoading(true);
    setTimeout(() => { setIaText(analiseIA(os, os.score)); setIaLoading(false); }, 1400);
  };

  const exportCSV = () => {
    const csv = "ID,Descricao,Criticidade,Status,Score,HH,Prazo,Responsavel\n" +
      filtered.map(o=>`${o.id},"${o.descricao}",${o.criticidade},${o.status},${o.score},${o.hhNecessario}h,${o.diasPraza}d,"${o.responsavel}"`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=`sigma-ai-${Date.now()}.csv`; a.click();
    showToast("📊 Exportado com sucesso!");
  };

  // Chart data
  const curvaS = [
    {s:"S1",plan:10,real:8},{s:"S2",plan:22,real:19},{s:"S3",plan:38,real:33},
    {s:"S4",plan:56,real:48},{s:"S5",plan:72,real:64},{s:"S6",plan:88,real:80},
  ];
  const tendencia = [
    {m:"Out",ab:14,co:9,at:3},{m:"Nov",ab:18,co:11,at:5},{m:"Dez",ab:12,co:14,at:2},{m:"Jan",ab:16,co:10,at:4},
  ];
  const prevCor = [{name:"Preventiva",value:4,fill:"#10b981"},{name:"Corretiva",value:6,fill:"#ef4444"}];
  const scoreBar = [...osData].sort((a,b)=>b.score-a.score).map(o=>({ id:o.id.replace("OS-",""), score:o.score, fill:scoreColor(o.score) }));

  // Heatmap
  const equipe = ["João","Maria","Pedro","Ana","Carlos"];
  const dias = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const heatmap = equipe.map(e => ({ nome:e, dias:dias.map(d=>({ d, hh: d==="Sáb"||d==="Dom"?0:Math.floor(Math.random()*9) })) }));

  // Comparativo
  const comp = [
    {l:"OS Abertas",a:8,b:11,icon:"📋",reverse:true},
    {l:"HH Planejado",a:158,b:186,icon:"⏱",reverse:true},
    {l:"Atrasos",a:1,b:3,icon:"⚠️",reverse:true},
    {l:"Aderência",a:87,b:72,icon:"📈",reverse:false},
  ];

  const TABS = [
    { id:"os", label:"Ordens de Serviço", icon:"📋" },
    { id:"graficos", label:"Gráficos", icon:"📊" },
    { id:"intel", label:"Inteligência", icon:"🧠" },
    { id:"equipe", label:"Equipe & Métricas", icon:"👥" },
  ];

  if (!mounted) return null;

  return (
    <div style={{ minHeight:"100vh", background:"var(--sigma-bg)", color:"var(--sigma-text)" }}>

      {/* TOAST */}
      {toast && (
        <div className="sigma-toast" style={{ background:"rgba(13,20,35,0.95)", borderColor: toast.type==="success"?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)", color: toast.type==="success"?"#10b981":"#ef4444" }}>
          {toast.msg}
        </div>
      )}

      {/* NAV */}
      <nav style={{ background:"rgba(13,20,35,0.9)", borderBottom:"1px solid var(--sigma-border)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:40 }}>
        <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#00d4ff,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(0,212,255,0.3)" }}>
              <span style={{ fontFamily:"var(--sigma-font-display)", fontWeight:800, fontSize:20, color:"#fff" }}>Σ</span>
            </div>
            <div>
              <div style={{ fontFamily:"var(--sigma-font-display)", fontWeight:800, fontSize:18, letterSpacing:"-0.02em", color:"#fff" }}>SIGMA AI</div>
              <div style={{ fontSize:11, color:"var(--sigma-muted)", letterSpacing:"0.06em" }}>MANUTENÇÃO PREDIAL</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4 }} className="hidden md:flex">
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id as any)} className="sigma-btn" style={{
                padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                background: tab===t.id ? "rgba(0,212,255,0.12)" : "transparent",
                color: tab===t.id ? "#00d4ff" : "var(--sigma-muted)",
                outline: tab===t.id ? "1px solid rgba(0,212,255,0.25)" : "none",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20, background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)" }}>
              <span className="live-dot"/>
              <span style={{ fontSize:12, fontWeight:600, color:"#10b981" }}>Live</span>
            </div>
            <button onClick={exportCSV} className="sigma-btn" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:8, color:"#10b981", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              <Download size={15}/> CSV
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div style={{ display:"flex", borderTop:"1px solid var(--sigma-border)", overflowX:"auto" }} className="md:hidden">
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{
              flex:1, padding:"10px 8px", fontSize:11, fontWeight:600, border:"none", cursor:"pointer",
              background: tab===t.id ? "rgba(0,212,255,0.08)" : "transparent",
              color: tab===t.id ? "#00d4ff" : "var(--sigma-muted)",
              borderBottom: tab===t.id ? "2px solid #00d4ff" : "2px solid transparent",
              whiteSpace:"nowrap",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px" }}>

        {/* ─── KPI CARDS ─── */}
        <div className="stagger" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12, marginBottom:24 }}>
          {[
            { l:"OS Abertas", v:kpis.abertas, t:"de 10 no total", clr:"#00d4ff", glow:"cyan", trend:"+2 esta semana" },
            { l:"HH Planejado", v:kpis.hh+"h", t:"capacidade total", clr:"#8b5cf6", glow:"purple", trend:"meta: 200h" },
            { l:"Atrasos", v:kpis.atrasos, t:"requer atenção", clr:"#ef4444", glow:"red", trend:"↓ vs semana ant" },
            { l:"Aderência", v:kpis.aderencia+"%", t:"prazo cumprido", clr:"#10b981", glow:"green", trend:"meta: 85%" },
            { l:"Críticas Abertas", v:kpis.criticas, t:"ativos críticos", clr:"#f97316", glow:"orange", trend:"monitorar" },
            { l:"Bloqueadas", v:kpis.bloqueadas, t:"material pendente", clr:"#eab308", glow:"", trend:"fornecedores" },
          ].map((k,i) => (
            <div key={i} className={`sigma-card animate-fade-up kpi-glow-${k.glow}`} style={{ padding:20 }}>
              <div style={{ fontSize:11, color:"var(--sigma-muted)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:600, marginBottom:12 }}>{k.l}</div>
              <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:32, fontWeight:800, color:k.clr, lineHeight:1, marginBottom:8, letterSpacing:"-0.02em" }}>{k.v}</div>
              <div style={{ fontSize:11, color:"var(--sigma-muted)" }}>{k.t}</div>
              <div style={{ fontSize:11, color:k.clr, marginTop:6, opacity:0.8 }}>{k.trend}</div>
            </div>
          ))}
        </div>

        {/* ─── TAB: OS ─── */}
        {tab === "os" && (
          <div className="animate-fade-up">
            {/* Filters */}
            <div className="sigma-card" style={{ padding:20, marginBottom:16 }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"flex-end" }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontSize:11, color:"var(--sigma-muted)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>Buscar</div>
                  <div style={{ position:"relative" }}>
                    <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--sigma-muted)" }}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ID, descrição, responsável..."
                      className="sigma-input" style={{ paddingLeft:32 }}/>
                    {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--sigma-muted)" }}><X size={14}/></button>}
                  </div>
                </div>
                {[
                  { l:"Status", v:fStatus, fn:setFStatus, opts:[["","Todos Status"],["aberta","Aberta"],["planejada","Planejada"],["execucao","Execução"],["concluida","Concluída"]] },
                  { l:"Criticidade", v:fCrit, fn:setFCrit, opts:[["","Todas"],["critica","Crítica"],["alta","Alta"],["media","Média"],["baixa","Baixa"]] },
                  { l:"Ordenar", v:sortBy, fn:setSortBy, opts:[["score","Score Sigma"],["prazo","Prazo"],["hh","HH"]] },
                ].map((f,i) => (
                  <div key={i}>
                    <div style={{ fontSize:11, color:"var(--sigma-muted)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>{f.l}</div>
                    <select value={f.v} onChange={e=>f.fn(e.target.value)} className="sigma-input" style={{ width:"auto", minWidth:130 }}>
                      {f.opts.map(([val,lbl])=><option key={val} value={val}>{lbl}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {(search||fStatus||fCrit) && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                  {[search&&["Busca: "+search,()=>setSearch("")], fStatus&&["Status: "+fStatus,()=>setFStatus("")], fCrit&&["Crit: "+fCrit,()=>setFCrit("")]].filter(Boolean).map((t: any,i) => (
                    <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.2)", color:"#00d4ff" }}>
                      {t[0]} <button onClick={t[1]} style={{ background:"none", border:"none", cursor:"pointer", color:"#00d4ff", display:"flex" }}><X size={10}/></button>
                    </span>
                  ))}
                  <button onClick={()=>{setSearch("");setFStatus("");setFCrit("");}} style={{ fontSize:11, color:"var(--sigma-muted)", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>Limpar</button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="sigma-card" style={{ overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--sigma-border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:"var(--sigma-font-display)", fontWeight:700, fontSize:15 }}>
                  Ordens de Serviço — Score Sigma™
                  <span style={{ fontFamily:"var(--sigma-font-mono)", fontSize:13, color:"#00d4ff", marginLeft:8 }}>({filtered.length}/{osData.length})</span>
                </div>
                <div style={{ display:"flex", gap:16, fontSize:11, color:"var(--sigma-muted)" }}>
                  <span style={{ color:"#ef4444" }}>● 8–10 Crítico</span>
                  <span style={{ color:"#f97316" }}>● 6–8 Alto</span>
                  <span style={{ color:"#10b981" }}>● 0–6 Normal</span>
                </div>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table className="sigma-table" style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["ID","Descrição","Ativo","Criticidade","Status","Score Σ","HH","Prazo","Responsável","Ação"].map(h=>
                        <th key={h}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(os => (
                      <tr key={os.id}>
                        <td style={{ fontFamily:"var(--sigma-font-mono)", fontWeight:500, color:"#00d4ff", fontSize:12 }}>{os.id}</td>
                        <td>
                          <div style={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{os.descricao}</div>
                          {os.materialBloqueado && <span style={{ fontSize:10, background:"rgba(234,179,8,0.12)", color:"#eab308", border:"1px solid rgba(234,179,8,0.2)", borderRadius:4, padding:"2px 6px", marginTop:4, display:"inline-block" }}>🔒 MATERIAL</span>}
                        </td>
                        <td style={{ fontSize:12, color:"var(--sigma-muted)", maxWidth:140 }}><span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{os.ativo}</span></td>
                        <td>
                          <span className="sigma-badge" style={{ background:CRIT_CLR[os.criticidade]+"20", color:CRIT_CLR[os.criticidade], border:`1px solid ${CRIT_CLR[os.criticidade]}40` }}>
                            {os.criticidade}
                          </span>
                        </td>
                        <td>
                          <span className="sigma-badge" style={{ background:STAT_CLR[os.status]+"20", color:STAT_CLR[os.status], border:`1px solid ${STAT_CLR[os.status]}40` }}>
                            {os.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <ScoreRing score={os.score} size={40}/>
                            <span style={{ fontFamily:"var(--sigma-font-mono)", fontSize:11, color:"var(--sigma-muted)" }}>{scoreLabel(os.score)}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily:"var(--sigma-font-mono)", color:"var(--sigma-muted)" }}>{os.hhNecessario}h</td>
                        <td>
                          <span style={{ fontFamily:"var(--sigma-font-mono)", fontWeight:600, color: os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981" }}>
                            {os.diasPraza>=0?"+":""}{os.diasPraza}d
                          </span>
                        </td>
                        <td style={{ color:"var(--sigma-muted)", fontSize:13 }}>{os.responsavel}</td>
                        <td>
                          <button onClick={()=>openModal(os)} className="sigma-btn" style={{
                            display:"inline-flex", alignItems:"center", gap:4, padding:"6px 12px",
                            background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.25)",
                            borderRadius:8, color:"#00d4ff", fontSize:12, fontWeight:600, cursor:"pointer",
                          }}>
                            Ver <ChevronRight size={13}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: GRÁFICOS ─── */}
        {tab === "graficos" && (
          <div className="animate-fade-up" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(500px,1fr))", gap:16 }}>
            {[
              { title:"📈 Curva S — Planejado vs Realizado", chart:(
                <AreaChart data={curvaS}>
                  <defs>
                    <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="s" stroke="var(--sigma-muted)" tick={{fontFamily:"DM Mono",fontSize:11}}/>
                  <YAxis stroke="var(--sigma-muted)" tick={{fontFamily:"DM Mono",fontSize:11}}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Legend wrapperStyle={{fontFamily:"DM Sans",fontSize:12}}/>
                  <Area type="monotone" dataKey="plan" name="Planejado" stroke="#3b82f6" fill="url(#gP)" strokeWidth={2}/>
                  <Area type="monotone" dataKey="real" name="Realizado" stroke="#00d4ff" fill="url(#gR)" strokeWidth={2}/>
                </AreaChart>
              )},
              { title:"📊 Tendência Mensal", chart:(
                <LineChart data={tendencia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="m" stroke="var(--sigma-muted)" tick={{fontFamily:"DM Mono",fontSize:11}}/>
                  <YAxis stroke="var(--sigma-muted)" tick={{fontFamily:"DM Mono",fontSize:11}}/>
                  <Tooltip content={<ChartTooltip/>}/><Legend wrapperStyle={{fontFamily:"DM Sans",fontSize:12}}/>
                  <Line type="monotone" dataKey="ab" name="Abertas" stroke="#ef4444" strokeWidth={2} dot={{r:4,fill:"#ef4444"}}/>
                  <Line type="monotone" dataKey="co" name="Concluídas" stroke="#10b981" strokeWidth={2} dot={{r:4,fill:"#10b981"}}/>
                  <Line type="monotone" dataKey="at" name="Atrasos" stroke="#f97316" strokeWidth={2} dot={{r:4,fill:"#f97316"}}/>
                </LineChart>
              )},
              { title:"🔧 Preventiva vs Corretiva", chart:(
                <PieChart>
                  <Pie data={prevCor} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={{stroke:"rgba(255,255,255,0.2)"}}>
                    {prevCor.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Pie>
                  <Tooltip content={<ChartTooltip/>}/>
                </PieChart>
              )},
              { title:"📌 Score Sigma por OS", chart:(
                <BarChart data={scoreBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="id" stroke="var(--sigma-muted)" tick={{fontFamily:"DM Mono",fontSize:10}}/>
                  <YAxis domain={[0,10]} stroke="var(--sigma-muted)" tick={{fontFamily:"DM Mono",fontSize:11}}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Bar dataKey="score" name="Score" radius={[6,6,0,0]}>
                    {scoreBar.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Bar>
                </BarChart>
              )},
            ].map((c,i) => (
              <div key={i} className="sigma-card" style={{ padding:24 }}>
                <div className="sigma-section-title">{c.title}</div>
                <ResponsiveContainer width="100%" height={280}>{c.chart as any}</ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* ─── TAB: INTELIGÊNCIA ─── */}
        {tab === "intel" && (
          <div className="animate-fade-up" style={{ display:"grid", gap:16 }}>
            {/* MTTR/MTBF/Backlog */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:12 }}>
              {[
                { l:"MTTR", sub:"Tempo Médio de Reparo", v:4, u:"dias", ok:true, clr:"#3b82f6" },
                { l:"MTBF", sub:"Tempo Entre Falhas", v:Math.round(720/Math.max(1,kpis.criticas)), u:"dias", ok:true, clr:"#10b981" },
                { l:"Backlog", sub:"Trabalho Pendente", v:Math.ceil(MOCK_OS.filter(o=>o.status!=="concluida").reduce((s,o)=>s+o.hhNecessario,0)/10), u:"dias", ok:false, clr:"#f97316" },
                { l:"Aderência", sub:"Ordens no prazo", v:kpis.aderencia, u:"%", ok:kpis.aderencia>=80, clr:"#8b5cf6" },
              ].map((m,i) => (
                <div key={i} className="sigma-card" style={{ padding:20 }}>
                  <div style={{ fontSize:11, color:"var(--sigma-muted)", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600, marginBottom:8 }}>{m.l}</div>
                  <div style={{ fontSize:12, color:"var(--sigma-muted)", marginBottom:12 }}>{m.sub}</div>
                  <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:36, fontWeight:800, color:m.clr, letterSpacing:"-0.02em" }}>
                    {m.v}<span style={{ fontSize:16, fontWeight:400, marginLeft:4 }}>{m.u}</span>
                  </div>
                  <div style={{ marginTop:8, fontSize:12, color:m.ok?"#10b981":"#f97316" }}>{m.ok?"✅ Saudável":"⚠️ Atenção"}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="sigma-card" style={{ padding:24 }}>
              <div className="sigma-section-title">📅 Timeline — Próximos 30 dias</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {osData.filter(o=>o.diasPraza>=-5&&o.diasPraza<=30).sort((a,b)=>a.diasPraza-b.diasPraza).slice(0,8).map(os => {
                  const pct = Math.max(4, Math.min(96, ((os.diasPraza+5)/35)*100));
                  const clr = os.diasPraza<0?"#ef4444":STAT_CLR[os.status];
                  return (
                    <div key={os.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ width:52, fontFamily:"var(--sigma-font-mono)", fontSize:11, color:"#00d4ff", textAlign:"right" }}>{os.id}</span>
                      <div style={{ flex:1, height:32, borderRadius:8, background:"rgba(255,255,255,0.04)", position:"relative", overflow:"hidden", border:"1px solid var(--sigma-border)" }}>
                        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${clr}30,${clr}60)`, borderRadius:8, transition:"width 0.8s ease" }}/>
                        <div style={{ position:"absolute", left:`${pct}%`, top:"50%", transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:clr, boxShadow:`0 0 8px ${clr}` }}/>
                        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"rgba(255,255,255,0.6)", whiteSpace:"nowrap" }}>{os.descricao.substring(0,35)}</span>
                      </div>
                      <span style={{ width:36, fontFamily:"var(--sigma-font-mono)", fontSize:11, color: os.diasPraza<0?"#ef4444":"#10b981", textAlign:"right", fontWeight:700 }}>
                        {os.diasPraza>=0?"+":""}{os.diasPraza}d
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conflitos + Recomendações */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div className="sigma-card" style={{ padding:24, borderColor:"rgba(239,68,68,0.2)" }}>
                <div className="sigma-section-title"><AlertTriangle size={18} color="#ef4444"/> Conflitos Detectados
                  <span style={{ fontFamily:"var(--sigma-font-mono)", fontSize:12, color:"#ef4444", marginLeft:4 }}>({conflitos.length})</span>
                </div>
                {conflitos.length===0 ? (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:16, borderRadius:10, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
                    <CheckCircle2 size={18} color="#10b981"/>
                    <span style={{ fontSize:13, color:"#10b981" }}>Nenhum conflito detectado!</span>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {conflitos.map((c,i) => (
                      <div key={i} style={{ padding:14, borderRadius:10, background: c.sev==="critica"?"rgba(239,68,68,0.08)":"rgba(249,115,22,0.08)", borderLeft:`3px solid ${c.sev==="critica"?"#ef4444":"#f97316"}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color: c.sev==="critica"?"#ef4444":"#f97316" }}>{c.tipo}</span>
                          <span style={{ fontSize:10, background: c.sev==="critica"?"rgba(239,68,68,0.15)":"rgba(249,115,22,0.15)", color: c.sev==="critica"?"#ef4444":"#f97316", padding:"2px 8px", borderRadius:4, fontWeight:700 }}>
                            {c.sev.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize:12, color:"var(--sigma-muted)", marginBottom:6 }}>{c.msg}</p>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>💡 {c.rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sigma-card" style={{ padding:24, borderColor:"rgba(234,179,8,0.2)" }}>
                <div className="sigma-section-title"><Lightbulb size={18} color="#eab308"/> Recomendações IA
                  <span style={{ fontFamily:"var(--sigma-font-mono)", fontSize:12, color:"#eab308", marginLeft:4 }}>({recs.length})</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {recs.map((r,i) => (
                    <div key={i} style={{ padding:14, borderRadius:10, background: r.imp==="alta"?"rgba(239,68,68,0.06)":"rgba(234,179,8,0.06)", borderLeft:`3px solid ${r.imp==="alta"?"#ef4444":"#eab308"}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"var(--sigma-text)" }}>{r.titulo}</span>
                        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4, fontWeight:700, background: r.imp==="alta"?"rgba(239,68,68,0.15)":"rgba(234,179,8,0.15)", color: r.imp==="alta"?"#ef4444":"#eab308" }}>
                          {r.imp.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize:12, color:"var(--sigma-muted)", marginBottom:6 }}>{r.desc}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>✓ {r.acao}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: EQUIPE ─── */}
        {tab === "equipe" && (
          <div className="animate-fade-up" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Heatmap */}
            <div className="sigma-card" style={{ padding:24 }}>
              <div className="sigma-section-title"><Users size={18} color="#00d4ff"/> Heatmap da Equipe (HH/dia)</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ fontFamily:"var(--sigma-font-mono)", fontSize:11, color:"var(--sigma-muted)", padding:"6px 8px", textAlign:"left", fontWeight:500 }}>Membro</th>
                      {dias.map(d=><th key={d} style={{ fontFamily:"var(--sigma-font-mono)", fontSize:11, color:"var(--sigma-muted)", padding:"6px 6px", fontWeight:500 }}>{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.map(m => (
                      <tr key={m.nome}>
                        <td style={{ fontWeight:600, fontSize:13, padding:"6px 8px", whiteSpace:"nowrap" }}>{m.nome}</td>
                        {m.dias.map(({d,hh}) => (
                          <td key={d} style={{ padding:"4px 4px" }}>
                            <div style={{
                              width:36, height:36, borderRadius:8,
                              background: hh>=7?"#ef4444":hh>=5?"#f97316":hh>=3?"#eab308":hh>0?"#10b981":"rgba(255,255,255,0.04)",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontFamily:"var(--sigma-font-mono)", fontSize:12, fontWeight:700,
                              color: hh===0?"var(--sigma-muted)":"#fff",
                              boxShadow: hh>=7?`0 0 10px rgba(239,68,68,0.3)`:hh>=5?`0 0 10px rgba(249,115,22,0.3)`:"none",
                            }}>{hh||"-"}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:"flex", gap:12, marginTop:16, flexWrap:"wrap" }}>
                {[["#ef4444","7-8h"],["#f97316","5-6h"],["#eab308","3-4h"],["#10b981","1-2h"],["rgba(255,255,255,0.04)","Livre"]].map(([c,l])=>(
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--sigma-muted)" }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:c }}/>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Comparativo */}
            <div className="sigma-card" style={{ padding:24 }}>
              <div className="sigma-section-title"><TrendingUp size={18} color="#00d4ff"/> Comparativo — Mês vs Anterior</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {comp.map((c,i) => {
                  const diff = c.a - c.b;
                  const pct = Math.round((Math.abs(diff)/c.b)*100);
                  const good = c.reverse ? diff<0 : diff>0;
                  const Icon = good?TrendingDown:TrendingUp;
                  return (
                    <div key={i} style={{ padding:16, borderRadius:12, background:"rgba(255,255,255,0.03)", border:"1px solid var(--sigma-border)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <span style={{ fontSize:13, fontWeight:600 }}>{c.icon} {c.l}</span>
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:700, color: good?"#10b981":"#ef4444", background: good?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", padding:"3px 10px", borderRadius:20 }}>
                          <Icon size={12}/> {diff>0?"+":""}{diff} ({pct}%)
                        </span>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <div>
                          <div style={{ fontSize:11, color:"var(--sigma-muted)", marginBottom:4 }}>Mês Atual</div>
                          <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:28, fontWeight:800, color:"#00d4ff" }}>{c.a}{c.l==="Aderência"?"%":""}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:11, color:"var(--sigma-muted)", marginBottom:4 }}>Mês Anterior</div>
                          <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:28, fontWeight:800, color:"var(--sigma-muted)" }}>{c.b}{c.l==="Aderência"?"%":""}</div>
                        </div>
                      </div>
                      <div style={{ marginTop:10, height:4, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min(100,(c.a/Math.max(c.a,c.b))*100)}%`, background: good?"linear-gradient(90deg,#10b981,#00d4ff)":"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:2, transition:"width 1s ease" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL ─── */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16, backdropFilter:"blur(4px)" }} onClick={()=>setModal(null)}>
          <div className="animate-slide-in" style={{ background:"var(--sigma-surface)", border:"1px solid var(--sigma-border)", borderRadius:20, maxWidth:620, width:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 0 60px rgba(0,212,255,0.1)" }} onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding:24, borderBottom:"1px solid var(--sigma-border)", background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(139,92,246,0.08))", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:"var(--sigma-font-mono)", fontSize:12, color:"#00d4ff", marginBottom:6, letterSpacing:"0.06em" }}>{modal.id}</div>
                <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:20, fontWeight:700, lineHeight:1.2, marginBottom:6 }}>{modal.descricao}</div>
                <div style={{ fontSize:13, color:"var(--sigma-muted)" }}>{modal.ativo}</div>
              </div>
              <button onClick={()=>setModal(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid var(--sigma-border)", borderRadius:8, width:36, height:36, cursor:"pointer", color:"var(--sigma-muted)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16}/>
              </button>
            </div>

            <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
              {/* Badges */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span className="sigma-badge" style={{ background:CRIT_CLR[modal.criticidade]+"20", color:CRIT_CLR[modal.criticidade], border:`1px solid ${CRIT_CLR[modal.criticidade]}40` }}>
                  CRITICIDADE: {modal.criticidade.toUpperCase()}
                </span>
                <span className="sigma-badge" style={{ background:STAT_CLR[modal.status]+"20", color:STAT_CLR[modal.status], border:`1px solid ${STAT_CLR[modal.status]}40` }}>
                  {modal.status.toUpperCase()}
                </span>
                {modal.materialBloqueado && <span className="sigma-badge" style={{ background:"rgba(234,179,8,0.12)", color:"#eab308", border:"1px solid rgba(234,179,8,0.25)" }}>🔒 MATERIAL BLOQUEADO</span>}
              </div>

              {/* Score Sigma */}
              <div style={{ padding:20, borderRadius:14, background:"rgba(0,212,255,0.06)", border:"1px solid rgba(0,212,255,0.15)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
                  <ScoreRing score={modal.score} size={72}/>
                  <div>
                    <div style={{ fontSize:11, color:"var(--sigma-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Score Sigma™</div>
                    <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:22, fontWeight:800, color:scoreColor(modal.score) }}>{scoreLabel(modal.score)}</div>
                    <div style={{ fontSize:13, color:"var(--sigma-muted)", marginTop:4 }}>
                      {modal.score>=8?"Executar imediatamente":modal.score>=6?"Planejar com prioridade":"Dentro dos padrões"}
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {Object.entries(modal.detalhes).map(([k,v]:any) => (
                    <div key={k} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:10, textAlign:"center" }}>
                      <div style={{ fontSize:10, color:"var(--sigma-muted)", textTransform:"capitalize", marginBottom:4 }}>{k}</div>
                      <div style={{ fontFamily:"var(--sigma-font-mono)", fontSize:16, fontWeight:700, color:"#00d4ff" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { l:"HH Necessário", v:`${modal.hhNecessario}h`, clr:"#8b5cf6" },
                  { l:"Equipe Disponível", v:`${modal.equipDisponivel}%`, clr: modal.equipDisponivel<50?"#ef4444":"#10b981" },
                  { l:"Dias para Prazo", v:`${modal.diasPraza>=0?"+":""}${modal.diasPraza}d`, clr: modal.diasPraza<0?"#ef4444":modal.diasPraza<=5?"#f97316":"#10b981" },
                  { l:"Responsável", v:modal.responsavel, clr:"#00d4ff" },
                ].map((item,i) => (
                  <div key={i} style={{ padding:14, borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid var(--sigma-border)" }}>
                    <div style={{ fontSize:11, color:"var(--sigma-muted)", marginBottom:6, letterSpacing:"0.04em" }}>{item.l}</div>
                    <div style={{ fontFamily:"var(--sigma-font-display)", fontSize:20, fontWeight:700, color:item.clr }}>{item.v}</div>
                  </div>
                ))}
              </div>

              {/* IA */}
              <div style={{ padding:16, borderRadius:12, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ fontSize:11, color:"#8b5cf6", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                  <Brain size={14}/> Análise SIGMA AI
                </div>
                {iaLoading ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--sigma-muted)", fontSize:13 }}>
                    <div style={{ width:14, height:14, border:"2px solid #8b5cf6", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    Processando análise inteligente...
                  </div>
                ) : <p style={{ fontSize:13, lineHeight:1.7, color:"rgba(255,255,255,0.8)" }}>{iaText}</p>}
              </div>

              {/* Alertas */}
              {modal.diasPraza<0 && (
                <div style={{ padding:14, borderRadius:10, background:"rgba(239,68,68,0.08)", borderLeft:"3px solid #ef4444" }}>
                  <p style={{ fontWeight:700, color:"#ef4444", fontSize:13 }}>🔴 CRÍTICO: OS ATRASADA {Math.abs(modal.diasPraza)} dias!</p>
                  <p style={{ fontSize:12, color:"var(--sigma-muted)", marginTop:4 }}>Replanejamento urgente necessário. Considerar recursos adicionais.</p>
                </div>
              )}
              {modal.materialBloqueado && (
                <div style={{ padding:14, borderRadius:10, background:"rgba(234,179,8,0.08)", borderLeft:"3px solid #eab308" }}>
                  <p style={{ fontWeight:700, color:"#eab308", fontSize:13 }}>🔒 Materiais Bloqueados</p>
                  <p style={{ fontSize:12, color:"var(--sigma-muted)", marginTop:4 }}>Verificar pendências com fornecedores. Considerar alternativas.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding:16, borderTop:"1px solid var(--sigma-border)", display:"flex", gap:10, justifyContent:"flex-end", borderRadius:"0 0 20px 20px", background:"rgba(0,0,0,0.2)" }}>
              <button onClick={()=>setModal(null)} style={{ padding:"8px 20px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid var(--sigma-border)", color:"var(--sigma-muted)", cursor:"pointer", fontSize:13, fontWeight:600 }}>Fechar</button>
              <button onClick={()=>{setIaText("");setIaLoading(true);setTimeout(()=>{setIaText(analiseIA(modal,modal.score));setIaLoading(false);},1400);}} style={{ padding:"8px 20px", borderRadius:8, background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(0,212,255,0.2))", border:"1px solid rgba(139,92,246,0.4)", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                🤖 Reanalisar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
