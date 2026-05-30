"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

// ═══════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════
type Crit = "critica"|"alta"|"media"|"baixa";
type Status = "aberta"|"planejada"|"execucao"|"concluida"|"cancelada";
type Modulo = "dashboard"|"os"|"gantt"|"hh"|"ativos"|"materiais"|"ia";

interface OS {
  id:string; descricao:string; ativo:string; criticidade:Crit; status:Status;
  dataPrevista:string; diasPraza:number; hhPlanejado:number; hhRealizado:number;
  equipDisponivel:number; responsavel:string; materialBloqueado:boolean;
  prioridade:number; risco:number; urgencia:number; impacto:number;
  obs:string; criadoEm:string;
}
interface Ativo { id:string; nome:string; tipo:string; local:string; criticidade:Crit; mtbf:number; ultimaManut:string; status:string; }
interface Material { id:string; nome:string; cat:string; estoque:number; minimo:number; custo:number; pendencias:number; }
interface ApontHH { osId:string; funcionario:string; data:string; hhPlan:number; hhReal:number; tarefas:string; }

// ═══════════════════════════════════════════════════
// DADOS INICIAIS
// ═══════════════════════════════════════════════════
const OS0: OS[] = [
  {id:"OS-1052",descricao:"Cobertura com Vazamento — Torre A",ativo:"Cobertura Torre A",criticidade:"critica",status:"aberta",dataPrevista:"2025-02-15",diasPraza:2,hhPlanejado:12,hhRealizado:0,equipDisponivel:70,responsavel:"João Silva",materialBloqueado:true,prioridade:9,risco:9,urgencia:8,impacto:8,obs:"Chuva forte agravou o problema",criadoEm:"2025-02-01"},
  {id:"OS-1048",descricao:"Manutenção Bombas HVAC — Zona 2",ativo:"HVAC Zona 2",criticidade:"alta",status:"planejada",dataPrevista:"2025-02-20",diasPraza:7,hhPlanejado:8,hhRealizado:0,equipDisponivel:50,responsavel:"Maria Costa",materialBloqueado:true,prioridade:7,risco:7,urgencia:6,impacto:7,obs:"Aguardando filtros",criadoEm:"2025-02-03"},
  {id:"OS-1061",descricao:"Limpeza Filtros HVAC — Bloco B",ativo:"HVAC Bloco B",criticidade:"media",status:"aberta",dataPrevista:"2025-02-28",diasPraza:15,hhPlanejado:6,hhRealizado:0,equipDisponivel:80,responsavel:"Pedro Lima",materialBloqueado:false,prioridade:5,risco:4,urgencia:4,impacto:5,obs:"",criadoEm:"2025-02-05"},
  {id:"OS-1039",descricao:"Vazamento Emergencial — Subsolo",ativo:"Subsolo / Cisterna",criticidade:"critica",status:"execucao",dataPrevista:"2025-02-10",diasPraza:-3,hhPlanejado:16,hhRealizado:10,equipDisponivel:60,responsavel:"Ana Souza",materialBloqueado:false,prioridade:10,risco:10,urgencia:10,impacto:9,obs:"URGENTE - ameaça estrutura",criadoEm:"2025-01-28"},
  {id:"OS-1055",descricao:"Inspeção Estrutural — Torre B",ativo:"Estrutura Torre B",criticidade:"critica",status:"aberta",dataPrevista:"2025-03-08",diasPraza:20,hhPlanejado:20,hhRealizado:0,equipDisponivel:90,responsavel:"Carlos Neto",materialBloqueado:false,prioridade:9,risco:8,urgencia:7,impacto:9,obs:"Última inspeção: 2024-06",criadoEm:"2025-02-01"},
  {id:"OS-1064",descricao:"Luminárias LED — Garagem",ativo:"Garagem",criticidade:"alta",status:"planejada",dataPrevista:"2025-02-25",diasPraza:12,hhPlanejado:10,hhRealizado:0,equipDisponivel:40,responsavel:"Beatriz Melo",materialBloqueado:false,prioridade:6,risco:5,urgencia:5,impacto:6,obs:"",criadoEm:"2025-02-06"},
  {id:"OS-1047",descricao:"Inspeção SPDA / Para-Raios",ativo:"SPDA Geral",criticidade:"alta",status:"aberta",dataPrevista:"2025-03-01",diasPraza:16,hhPlanejado:8,hhRealizado:0,equipDisponivel:70,responsavel:"Fernando Dias",materialBloqueado:false,prioridade:7,risco:8,urgencia:6,impacto:7,obs:"",criadoEm:"2025-02-04"},
  {id:"OS-1059",descricao:"Pintura Fachada — Bloco C",ativo:"Fachada Bloco C",criticidade:"baixa",status:"planejada",dataPrevista:"2025-03-15",diasPraza:30,hhPlanejado:40,hhRealizado:0,equipDisponivel:60,responsavel:"Juliana Rosa",materialBloqueado:false,prioridade:3,risco:2,urgencia:2,impacto:3,obs:"Aguardando aprovação",criadoEm:"2025-02-07"},
  {id:"OS-1063",descricao:"Manutenção Elevadores — Torres A/B",ativo:"Elevadores",criticidade:"alta",status:"planejada",dataPrevista:"2025-02-22",diasPraza:9,hhPlanejado:14,hhRealizado:0,equipDisponivel:30,responsavel:"Roberto Alves",materialBloqueado:false,prioridade:8,risco:7,urgencia:7,impacto:8,obs:"",criadoEm:"2025-02-02"},
  {id:"OS-1071",descricao:"Revisão Subestação Elétrica",ativo:"Subestação",criticidade:"critica",status:"aberta",dataPrevista:"2025-02-18",diasPraza:5,hhPlanejado:24,hhRealizado:0,equipDisponivel:50,responsavel:"Marcos Torres",materialBloqueado:true,prioridade:10,risco:10,urgencia:9,impacto:10,obs:"Laudo técnico necessário",criadoEm:"2025-01-30"},
];
const ATIVOS0: Ativo[] = [
  {id:"AT-001",nome:"Sistema HVAC Zona 1",tipo:"HVAC",local:"3º Andar",criticidade:"critica",mtbf:720,ultimaManut:"2024-11-01",status:"ativo"},
  {id:"AT-002",nome:"Bombas HVAC Zona 2",tipo:"HVAC",local:"4º Andar",criticidade:"alta",mtbf:960,ultimaManut:"2024-10-15",status:"ativo"},
  {id:"AT-003",nome:"Subestação Principal",tipo:"Elétrico",local:"Subsolo",criticidade:"critica",mtbf:2160,ultimaManut:"2024-08-01",status:"ativo"},
  {id:"AT-004",nome:"Para-Raios SPDA",tipo:"Segurança",local:"Cobertura",criticidade:"alta",mtbf:8760,ultimaManut:"2024-01-15",status:"ativo"},
  {id:"AT-005",nome:"Elevadores Torres A/B",tipo:"Transporte",local:"Torres A/B",criticidade:"alta",mtbf:2160,ultimaManut:"2024-12-01",status:"manutencao"},
  {id:"AT-006",nome:"Cisterna e Bombeamento",tipo:"Hidráulico",local:"Subsolo",criticidade:"critica",mtbf:1440,ultimaManut:"2024-09-01",status:"ativo"},
];
const MATERIAIS0: Material[] = [
  {id:"MAT-001",nome:"Filtro HVAC 16x20",cat:"HVAC",estoque:2,minimo:5,custo:85.50,pendencias:3},
  {id:"MAT-002",nome:"Relé Térmico 10A",cat:"Elétrico",estoque:0,minimo:3,custo:145.00,pendencias:2},
  {id:"MAT-003",nome:"Bomba d'água 1HP",cat:"Hidráulico",estoque:1,minimo:1,custo:980.00,pendencias:0},
  {id:"MAT-004",nome:"Cabo PP 4mm²",cat:"Elétrico",estoque:50,minimo:20,custo:12.50,pendencias:0},
  {id:"MAT-005",nome:"Graxa Lubrificante",cat:"Mecânico",estoque:8,minimo:5,custo:45.00,pendencias:0},
  {id:"MAT-006",nome:"Disjuntor 70A",cat:"Elétrico",estoque:0,minimo:2,custo:220.00,pendencias:1},
];
const APONTS0: ApontHH[] = [
  {osId:"OS-1039",funcionario:"Ana Souza",data:"2025-02-08",hhPlan:8,hhReal:8,tarefas:"Inspeção inicial, localização vazamento"},
  {osId:"OS-1039",funcionario:"Pedro Lima",data:"2025-02-09",hhPlan:8,hhReal:7,tarefas:"Reparo parcial, vedação provisória"},
  {osId:"OS-1052",funcionario:"João Silva",data:"2025-02-12",hhPlan:6,hhReal:6,tarefas:"Inspeção cobertura, mapeamento pontos"},
];

// ═══════════════════════════════════════════════════
// SCORE SIGMA
// ═══════════════════════════════════════════════════
function calcScore(os: OS): { score: number; d: Record<string,number> } {
  const hh = Math.min(os.hhPlanejado / 4, 10);
  const disp = os.equipDisponivel / 10;
  const bloq = os.materialBloqueado ? 3 : 0;
  const atrasado = os.diasPraza < 0 ? 2 : 0;
  const s = Math.max(0, Math.min(10,
    os.prioridade*0.2 + os.risco*0.25 + os.urgencia*0.2 +
    os.impacto*0.15 + hh*0.1 + disp*0.1 - bloq*0.3 + atrasado*0.15
  ));
  return { score: parseFloat(s.toFixed(1)), d: {Prioridade:os.prioridade,Risco:os.risco,"Urgência":os.urgencia,Impacto:os.impacto,HH:parseFloat(hh.toFixed(1)),Disponib:parseFloat(disp.toFixed(1))} };
}

// Cores
const CC: Record<string,string> = {critica:"#ef4444",alta:"#f97316",media:"#eab308",baixa:"#22c55e"};
const CS: Record<string,string> = {aberta:"#3b82f6",planejada:"#8b5cf6",execucao:"#00d4ff",concluida:"#10b981",cancelada:"#6b7280"};
function sc(s:number){ return s>=8?"#ef4444":s>=6?"#f97316":s>=4?"#eab308":"#10b981"; }
function sl(s:number){ return s>=8?"CRÍTICO":s>=6?"ALTO":s>=4?"MÉDIO":"BAIXO"; }

// Score Ring
function Ring({score,size=52}:{score:number;size?:number}) {
  const r=(size-8)/2, circ=2*Math.PI*r, fill=(score/10)*circ, clr=sc(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth={5}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{filter:`drop-shadow(0 0 4px ${clr})`}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em" fill={clr}
        style={{fontFamily:"DM Mono,monospace",fontWeight:700,fontSize:size>48?13:11}}>{score}</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════
export default function SigmaAI() {
  const [mod, setMod] = useState<Modulo>("dashboard");
  const [osList, setOsList] = useState<OS[]>(OS0);
  const [ativos] = useState<Ativo[]>(ATIVOS0);
  const [materiais] = useState<Material[]>(MATERIAIS0);
  const [aponts, setAponts] = useState<ApontHH[]>(APONTS0);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fCrit, setFCrit] = useState("");
  const [sort, setSort] = useState("score");
  const [modal, setModal] = useState<any>(null);
  const [modalType, setModalType] = useState<"os"|"novaOS"|"apontHH"|"ativo"|null>(null);
  const [toast, setToast] = useState<string|null>(null);
  const [novaOS, setNovaOS] = useState<Partial<OS>>({criticidade:"media",status:"aberta",hhPlanejado:8,equipDisponivel:80,materialBloqueado:false,prioridade:5,risco:5,urgencia:5,impacto:5,diasPraza:15,hhRealizado:0,obs:""});
  const [novaAp, setNovaAp] = useState<Partial<ApontHH>>({hhPlan:8,hhReal:0,tarefas:""});
  const [sideOpen, setSideOpen] = useState(true);

  const osData = useMemo(()=>osList.map(o=>({...o,...calcScore(o)})),[osList]);
  const filtered = useMemo(()=>{
    let a = osData.filter(o=>(o.id+o.descricao+o.responsavel).toLowerCase().includes(search.toLowerCase())&&(!fStatus||o.status===fStatus)&&(!fCrit||o.criticidade===fCrit));
    if(sort==="score") a.sort((a,b)=>b.score-a.score);
    else if(sort==="prazo") a.sort((a,b)=>a.diasPraza-b.diasPraza);
    else a.sort((a,b)=>b.hhPlanejado-a.hhPlanejado);
    return a;
  },[osData,search,fStatus,fCrit,sort]);

  const kpis = useMemo(()=>({
    abertas: osList.filter(o=>["aberta","planejada","execucao"].includes(o.status)).length,
    hh: osList.reduce((s,o)=>s+o.hhPlanejado,0),
    atrasos: osList.filter(o=>o.diasPraza<0&&o.status!=="concluida").length,
    aderencia: Math.round((osList.filter(o=>o.diasPraza>=0).length/osList.length)*100),
    criticas: osList.filter(o=>o.criticidade==="critica"&&o.status!=="concluida").length,
    bloqueadas: osList.filter(o=>o.materialBloqueado).length,
    execucao: osList.filter(o=>o.status==="execucao").length,
    concluidas: osList.filter(o=>o.status==="concluida").length,
  }),[osList]);

  const mttr = 4, mtbf = Math.round(720/Math.max(1,kpis.criticas));
  const backlog = Math.ceil(osList.filter(o=>o.status!=="concluida").reduce((s,o)=>s+o.hhPlanejado,0)/10);

  function showToast(msg:string){ setToast(msg); setTimeout(()=>setToast(null),3000); }

  function salvarOS(){
    if(!novaOS.descricao||!novaOS.ativo||!novaOS.responsavel||!novaOS.dataPrevista){ showToast("⚠️ Preencha todos os campos obrigatórios!"); return; }
    const id = `OS-${1072+osList.length}`;
    setOsList(prev=>[...prev, {...novaOS,id,hhRealizado:0,obs:novaOS.obs||"",criadoEm:new Date().toISOString().split("T")[0]} as OS]);
    setNovaOS({criticidade:"media",status:"aberta",hhPlanejado:8,equipDisponivel:80,materialBloqueado:false,prioridade:5,risco:5,urgencia:5,impacto:5,diasPraza:15,hhRealizado:0,obs:""});
    setModalType(null);
    showToast(`✅ ${id} criada com sucesso!`);
  }

  function salvarApt(){
    if(!novaAp.osId||!novaAp.funcionario||!novaAp.data){ showToast("⚠️ Preencha todos os campos!"); return; }
    const apt = novaAp as ApontHH;
    setAponts(prev=>[...prev,apt]);
    setOsList(prev=>prev.map(o=>o.id===apt.osId?{...o,hhRealizado:o.hhRealizado+(apt.hhReal||0)}:o));
    setModalType(null);
    showToast("✅ Apontamento registrado!");
  }

  function updateStatus(id:string, s:Status){
    setOsList(prev=>prev.map(o=>o.id===id?{...o,status:s}:o));
    showToast(`✅ OS ${id} → ${s}`);
  }

  const S = {bg:"#080c14",surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b"};

  const card = (extra?:any)=>({background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,position:"relative" as any,...extra});
  const inp = {background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 12px",fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",width:"100%"};
  const btn = (bg:string,clr="#fff")=>({background:bg,border:"none",color:clr,borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"});

  const NAV = [
    {id:"dashboard",icon:"⌂",lbl:"Dashboard"},{id:"os",icon:"📋",lbl:"Ordens de Serviço"},
    {id:"gantt",icon:"📅",lbl:"Gantt / Timeline"},{id:"hh",icon:"⏱",lbl:"Apontamento HH"},
    {id:"ativos",icon:"🏗",lbl:"Ativos"},{id:"materiais",icon:"📦",lbl:"Materiais"},{id:"ia",icon:"🧠",lbl:"IA Sigma"},
  ];

  // Chart tooltip
  const CT = ({active,payload,label}:any)=>{
    if(!active||!payload?.length) return null;
    return <div style={{background:S.surf2,border:`1px solid ${S.border}`,borderRadius:8,padding:"10px 14px",fontSize:12,fontFamily:"DM Mono,monospace"}}>
      <p style={{color:S.muted,marginBottom:4}}>{label}</p>
      {payload.map((p:any,i:number)=><p key={i} style={{color:p.color||"#00d4ff"}}>{p.name}: <b>{p.value}</b></p>)}
    </div>;
  };

  // ─── DASHBOARD ───
  const renderDashboard = () => (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Alert Banner */}
      {kpis.atrasos>0&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"12px 20px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🚨</span>
        <span style={{fontSize:13,color:"#fca5a5"}}><b>{kpis.atrasos} OS atrasada(s)</b> — ação imediata necessária. Score Sigma ativado para replanejamento.</span>
      </div>}

      {/* KPI Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
        {[
          {l:"OS Abertas",v:kpis.abertas,c:"#00d4ff",sub:"de "+osList.length+" total",icon:"📋"},
          {l:"HH Planejado",v:kpis.hh+"h",c:"#8b5cf6",sub:"capacidade total",icon:"⏱"},
          {l:"Atrasos",v:kpis.atrasos,c:"#ef4444",sub:"requerem atenção",icon:"⚠️"},
          {l:"Aderência",v:kpis.aderencia+"%",c:"#10b981",sub:"OS no prazo",icon:"📈"},
          {l:"Críticas",v:kpis.criticas,c:"#f97316",sub:"ativos críticos",icon:"🔴"},
          {l:"Em Execução",v:kpis.execucao,c:"#06b6d4",sub:"em andamento",icon:"⚡"},
          {l:"Bloqueadas",v:kpis.bloqueadas,c:"#eab308",sub:"mat. pendente",icon:"🔒"},
          {l:"Concluídas",v:kpis.concluidas,c:"#22c55e",sub:"este período",icon:"✅"},
        ].map((k,i)=>(
          <div key={i} style={{...card(),padding:16,cursor:"default"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <span style={{fontSize:10,color:S.muted,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>{k.l}</span>
              <span style={{fontSize:18}}>{k.icon}</span>
            </div>
            <div style={{fontSize:30,fontWeight:800,color:k.c,letterSpacing:"-0.02em",fontFamily:"Syne,sans-serif"}}>{k.v}</div>
            <div style={{fontSize:11,color:S.muted,marginTop:4}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* IA Sigma Box */}
      <div style={{...card(),padding:20,borderColor:"rgba(139,92,246,0.25)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#a78bfa",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          🧠 SIGMA IA — Alertas & Prioridades Automáticas
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:8}}>
          {osData.sort((a,b)=>b.score-a.score).slice(0,3).map((os,i)=>(
            <div key={i} style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:10,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{os.id}</span>
                <Ring score={os.score} size={36}/>
              </div>
              <p style={{fontSize:12,marginBottom:4,color:S.text}}>{os.descricao}</p>
              <p style={{fontSize:11,color:S.muted}}>
                {os.diasPraza<0?`🔴 ATRASADO ${Math.abs(os.diasPraza)}d`:os.score>=8?"🔴 Executar imediatamente":os.score>=6?"🟠 Planejar nos próximos dias":"🟢 Dentro dos padrões"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{...card(),padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:16}}>📈 Curva S — Planejado vs Realizado</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[{s:"S1",p:10,r:8},{s:"S2",p:22,r:19},{s:"S3",p:38,r:33},{s:"S4",p:56,r:48},{s:"S5",p:72,r:64},{s:"S6",p:88,r:80}]}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
              <XAxis dataKey="s" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
              <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
              <Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11}}/>
              <Area type="monotone" dataKey="p" name="Planejado" stroke="#3b82f6" fill="url(#gP)" strokeWidth={2}/>
              <Area type="monotone" dataKey="r" name="Realizado" stroke="#00d4ff" fill="url(#gR)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{...card(),padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:16}}>🔧 Preventiva vs Corretiva</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[{n:"Preventiva",v:4,fill:"#10b981"},{n:"Corretiva",v:6,fill:"#ef4444"}]} cx="50%" cy="50%" outerRadius={80} dataKey="v" nameKey="n" label={({n,v})=>`${n}: ${v}`} labelLine={{stroke:"rgba(255,255,255,0.15)"}}>
                <Cell fill="#10b981"/><Cell fill="#ef4444"/>
              </Pie>
              <Tooltip content={<CT/>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top OS Table */}
      <div style={{...card(),overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:14}}>📋 Top OS por Score Sigma™</span>
          <button onClick={()=>setMod("os")} style={{...btn("rgba(0,212,255,0.12)","#00d4ff"),border:"1px solid rgba(0,212,255,0.25)",fontSize:12}}>Ver todas →</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"rgba(13,20,35,0.8)"}}>
              {["ID","Descrição","Criticidade","Status","Score","Prazo","Ação"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",color:S.muted,textTransform:"uppercase",borderBottom:`1px solid ${S.border}`}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.slice(0,6).map(os=>(
                <tr key={os.id} style={{borderBottom:`1px solid rgba(99,179,237,0.06)`}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{os.id}</td>
                  <td style={{padding:"12px 16px",fontSize:12,maxWidth:180}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.descricao}</div></td>
                  <td style={{padding:"12px 16px"}}><span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],border:`1px solid ${CC[os.criticidade]}40`,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{os.criticidade}</span></td>
                  <td style={{padding:"12px 16px"}}><span style={{background:CS[os.status]+"20",color:CS[os.status],border:`1px solid ${CS[os.status]}40`,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>{os.status}</span></td>
                  <td style={{padding:"12px 16px"}}><Ring score={os.score} size={40}/></td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:12,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981",fontWeight:700}}>{os.diasPraza>=0?"+":""}{os.diasPraza}d</td>
                  <td style={{padding:"12px 16px"}}>
                    <button onClick={()=>{setModal(os);setModalType("os");}} style={{...btn("rgba(0,212,255,0.12)","#00d4ff"),border:"1px solid rgba(0,212,255,0.25)",fontSize:11,padding:"5px 10px"}}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── MÓDULO OS ───
  const renderOS = () => (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>Ordens de Serviço</div>
        <button onClick={()=>setModalType("novaOS")} style={{...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),padding:"10px 20px",borderRadius:10,boxShadow:"0 0 20px rgba(0,212,255,0.2)"}}>+ Nova OS</button>
      </div>
      {/* Filters */}
      <div style={{...card(),padding:16}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Buscar</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ID, descrição, responsável..." style={inp}/>
          </div>
          {[{l:"Status",v:fStatus,fn:setFStatus,opts:[["","Todos"],["aberta","Aberta"],["planejada","Planejada"],["execucao","Execução"],["concluida","Concluída"]]},
            {l:"Criticidade",v:fCrit,fn:setFCrit,opts:[["","Todas"],["critica","Crítica"],["alta","Alta"],["media","Média"],["baixa","Baixa"]]},
            {l:"Ordenar",v:sort,fn:setSort,opts:[["score","Score Sigma"],["prazo","Prazo"],["hh","HH"]]},
          ].map((f,i)=>(
            <div key={i}>
              <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{f.l}</div>
              <select value={f.v} onChange={e=>f.fn(e.target.value)} style={{...inp,width:"auto",minWidth:130}}>{f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
            </div>
          ))}
        </div>
        {(search||fStatus||fCrit)&&<div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {[search&&["Busca: "+search,()=>setSearch("")],fStatus&&["Status: "+fStatus,()=>setFStatus("")],fCrit&&["Crit: "+fCrit,()=>setFCrit("")]].filter(Boolean).map((t:any,i)=>(
            <span key={i} style={{background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.2)",color:"#00d4ff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={t[1]}>{t[0]} ✕</span>
          ))}
          <span style={{fontSize:11,color:S.muted,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setSearch("");setFStatus("");setFCrit("");}}>Limpar</span>
        </div>}
      </div>
      {/* Table */}
      <div style={{...card(),overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontWeight:700,fontSize:13}}>Resultados <span style={{color:"#00d4ff",fontFamily:"DM Mono,monospace"}}>({filtered.length})</span></span>
          <div style={{display:"flex",gap:12,fontSize:11,color:S.muted}}>
            <span style={{color:"#ef4444"}}>● 8–10 Crítico</span>
            <span style={{color:"#f97316"}}>● 6–8 Alto</span>
            <span style={{color:"#10b981"}}>● 0–6 Normal</span>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"rgba(13,20,35,0.8)"}}>
              {["ID","Descrição","Ativo","Criticidade","Status","Score Σ","HH Plan/Real","Prazo","Responsável","Ação"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",color:S.muted,textTransform:"uppercase",borderBottom:`1px solid ${S.border}`,whiteSpace:"nowrap"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(os=>(
                <tr key={os.id} style={{borderBottom:`1px solid rgba(99,179,237,0.06)`}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff",whiteSpace:"nowrap"}}>{os.id}</td>
                  <td style={{padding:"12px 16px",fontSize:12,maxWidth:200}}>
                    <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.descricao}</div>
                    {os.materialBloqueado&&<span style={{fontSize:9,background:"rgba(234,179,8,0.12)",color:"#eab308",border:"1px solid rgba(234,179,8,0.2)",padding:"1px 6px",borderRadius:4,marginTop:2,display:"inline-block"}}>🔒 MATERIAL</span>}
                  </td>
                  <td style={{padding:"12px 16px",fontSize:11,color:S.muted,maxWidth:130}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.ativo}</div></td>
                  <td style={{padding:"12px 16px"}}><span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],border:`1px solid ${CC[os.criticidade]}40`,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{os.criticidade}</span></td>
                  <td style={{padding:"12px 16px"}}><span style={{background:CS[os.status]+"20",color:CS[os.status],border:`1px solid ${CS[os.status]}40`,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>{os.status}</span></td>
                  <td style={{padding:"12px 16px"}}><Ring score={os.score} size={44}/></td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11}}>
                    <span style={{color:S.text}}>{os.hhPlanejado}h</span>
                    <span style={{color:S.muted}}> / </span>
                    <span style={{color:os.hhRealizado>os.hhPlanejado?"#ef4444":"#10b981"}}>{os.hhRealizado}h</span>
                  </td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:12,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981",fontWeight:700}}>{os.diasPraza>=0?"+":""}{os.diasPraza}d</td>
                  <td style={{padding:"12px 16px",fontSize:12,color:S.muted}}>{os.responsavel}</td>
                  <td style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setModal(os);setModalType("os");}} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),border:"1px solid rgba(0,212,255,0.2)",padding:"5px 10px",fontSize:11}}>Ver</button>
                      <select onChange={e=>{if(e.target.value)updateStatus(os.id,e.target.value as Status);e.target.value="";}} style={{...inp,width:"auto",fontSize:10,padding:"5px 6px"}}>
                        <option value="">▸</option>
                        {["aberta","planejada","execucao","concluida","cancelada"].map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── GANTT ───
  const renderGantt = () => {
    const sorted = [...osData].filter(o=>o.diasPraza>=-10&&o.diasPraza<=35).sort((a,b)=>a.diasPraza-b.diasPraza);
    const MAX = 35;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>📅 Gantt — Timeline de Execução</div>
        <div style={{...card(),padding:20}}>
          <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
            {Object.entries(CS).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:S.muted}}><div style={{width:12,height:12,borderRadius:3,background:c}}/>{s}</div>)}
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#ef4444"}}><div style={{width:12,height:12,borderRadius:3,background:"#ef4444"}}/> atrasada</div>
          </div>
          {/* Header dias */}
          <div style={{display:"flex",marginBottom:8,paddingLeft:220}}>
            {[-5,0,5,10,15,20,25,30,35].map(d=>(
              <div key={d} style={{flex:1,fontSize:9,color:S.muted,textAlign:"center"}}>{d===0?"Hoje":d>0?"+"+d+"d":d+"d"}</div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sorted.map(os=>{
              const pct = Math.max(2,Math.min(98,((os.diasPraza+10)/(MAX+10))*100));
              const clr = os.diasPraza<0?"#ef4444":CS[os.status];
              const hhPct = os.hhPlanejado>0?Math.min(100,(os.hhRealizado/os.hhPlanejado)*100):0;
              return (
                <div key={os.id} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:220,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
                    <Ring score={os.score} size={32}/>
                    <div>
                      <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"#00d4ff"}}>{os.id}</div>
                      <div style={{fontSize:10,color:S.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:170}}>{os.descricao.substring(0,28)}</div>
                    </div>
                  </div>
                  <div style={{flex:1,position:"relative"}}>
                    {/* Track */}
                    <div style={{height:28,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:6,overflow:"hidden",position:"relative"}}>
                      {/* HH realizado */}
                      {hhPct>0&&<div style={{position:"absolute",height:"100%",width:`${hhPct*pct/100}%`,background:`${clr}30`,borderRadius:6}}/>}
                      {/* Barra principal */}
                      <div style={{position:"absolute",height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${clr}40,${clr}80)`,borderRadius:6,transition:"width 0.8s ease"}}/>
                      {/* Marker */}
                      <div style={{position:"absolute",left:`${pct}%`,top:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:clr,boxShadow:`0 0 8px ${clr}`,zIndex:1}}/>
                      <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"rgba(255,255,255,0.5)",zIndex:2,whiteSpace:"nowrap"}}>{os.hhRealizado}h/{os.hhPlanejado}h • {os.responsavel}</span>
                    </div>
                  </div>
                  <div style={{width:40,fontFamily:"DM Mono,monospace",fontSize:11,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981",fontWeight:700,textAlign:"right"}}>
                    {os.diasPraza>=0?"+":""}{os.diasPraza}d
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:16,padding:12,background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.12)",borderRadius:8,fontSize:12,color:"rgba(255,255,255,0.6)"}}>
            💡 <b>IA Sigma:</b> {kpis.atrasos>0?`${kpis.atrasos} OS atrasadas detectadas. Replanejamento automático sugerido para OS com score ≥8.`:"Cronograma dentro do esperado. Próxima revisão recomendada em 7 dias."}
          </div>
        </div>
      </div>
    );
  };

  // ─── HH ───
  const renderHH = () => {
    const totalPlan = aponts.reduce((s,a)=>s+a.hhPlan,0);
    const totalReal = aponts.reduce((s,a)=>s+a.hhReal,0);
    const eficiencia = totalPlan>0?Math.round((totalReal/totalPlan)*100):0;
    const porFunc: Record<string,{p:number,r:number}> = {};
    aponts.forEach(a=>{ if(!porFunc[a.funcionario]) porFunc[a.funcionario]={p:0,r:0}; porFunc[a.funcionario].p+=a.hhPlan; porFunc[a.funcionario].r+=a.hhReal; });
    const funcData = Object.entries(porFunc).map(([n,v])=>({nome:n,...v}));
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>⏱ Apontamento de HH</div>
          <button onClick={()=>setModalType("apontHH")} style={{...btn("linear-gradient(135deg,#8b5cf6,#6d28d9)"),padding:"10px 20px",borderRadius:10}}>+ Registrar Apontamento</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {[{l:"HH Planejado",v:totalPlan+"h",c:"#3b82f6"},{l:"HH Realizado",v:totalReal+"h",c:"#10b981"},{l:"Eficiência",v:eficiencia+"%",c:eficiencia>=90?"#10b981":eficiencia>=70?"#f97316":"#ef4444"},{l:"Apontamentos",v:aponts.length,c:"#8b5cf6"}].map((k,i)=>(
            <div key={i} style={{...card(),padding:16}}>
              <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{k.l}</div>
              <div style={{fontSize:28,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{...card(),padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:16}}>📊 Planejado vs Realizado por Funcionário</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funcData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                <XAxis dataKey="nome" stroke={S.muted} tick={{fill:S.muted,fontSize:10}}/>
                <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                <Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="p" name="Planejado" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="r" name="Realizado" fill="#10b981" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{...card(),padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>📋 Histórico de Apontamentos</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:220,overflowY:"auto"}}>
              {aponts.map((a,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,borderRadius:8,padding:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{a.osId}</span>
                    <span style={{fontSize:11,color:a.hhReal>a.hhPlan?"#ef4444":"#10b981",fontWeight:700}}>{a.hhReal}h/{a.hhPlan}h</span>
                  </div>
                  <div style={{fontSize:11,color:S.muted}}>{a.funcionario} • {a.data}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>{a.tarefas}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── ATIVOS ───
  const renderAtivos = () => (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>🏗 Ativos & Infraestrutura</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
        {ativos.map(a=>{
          const diasSemManut = Math.floor((Date.now()-new Date(a.ultimaManut).getTime())/(1000*60*60*24));
          const risco = Math.min(10,(diasSemManut/a.mtbf)*10);
          const rClr = risco>=7?"#ef4444":risco>=4?"#f97316":"#10b981";
          return (
            <div key={a.id} style={{...card({borderColor:risco>=7?"rgba(239,68,68,0.25)":S.border}),padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"#00d4ff",marginBottom:4}}>{a.id}</div>
                  <div style={{fontWeight:600,fontSize:13}}>{a.nome}</div>
                  <div style={{fontSize:11,color:S.muted}}>{a.local} • {a.tipo}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{background:CC[a.criticidade]+"20",color:CC[a.criticidade],padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase",border:`1px solid ${CC[a.criticidade]}40`}}>{a.criticidade}</span>
                  <div style={{marginTop:6,fontSize:11,color:a.status==="ativo"?"#10b981":"#f97316"}}>{a.status==="ativo"?"✅ Ativo":"⚠️ Em Manutenção"}</div>
                </div>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                <div style={{height:"100%",width:`${Math.min(100,risco*10)}%`,background:`linear-gradient(90deg,${rClr}60,${rClr})`,borderRadius:2}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:10}}>
                <div><div style={{color:S.muted,marginBottom:2}}>MTBF</div><div style={{color:S.text,fontWeight:700}}>{a.mtbf}h</div></div>
                <div><div style={{color:S.muted,marginBottom:2}}>Última Manut.</div><div style={{color:S.text,fontWeight:700,fontFamily:"DM Mono,monospace",fontSize:9}}>{a.ultimaManut}</div></div>
                <div><div style={{color:S.muted,marginBottom:2}}>Risco</div><div style={{color:rClr,fontWeight:700}}>{risco.toFixed(1)}/10</div></div>
              </div>
              {diasSemManut>a.mtbf&&<div style={{marginTop:8,padding:6,background:"rgba(239,68,68,0.1)",borderRadius:6,fontSize:10,color:"#fca5a5"}}>⚠️ Manutenção VENCIDA há {diasSemManut-a.mtbf} dias!</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── MATERIAIS ───
  const renderMateriais = () => (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>📦 Controle de Materiais</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
        {[
          {l:"Itens em Estoque",v:materiais.filter(m=>m.estoque>0).length,c:"#10b981"},
          {l:"Em Falta",v:materiais.filter(m=>m.estoque===0).length,c:"#ef4444"},
          {l:"Abaixo do Mínimo",v:materiais.filter(m=>m.estoque<m.minimo&&m.estoque>0).length,c:"#f97316"},
          {l:"Pendências",v:materiais.reduce((s,m)=>s+m.pendencias,0),c:"#eab308"},
        ].map((k,i)=>(
          <div key={i} style={{...card(),padding:16}}>
            <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{k.l}</div>
            <div style={{fontSize:28,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{...card(),overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"rgba(13,20,35,0.8)"}}>
            {["ID","Nome","Categoria","Estoque","Mínimo","Status","Custo Unit.","Pendências"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",color:S.muted,textTransform:"uppercase",borderBottom:`1px solid ${S.border}`}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {materiais.map(m=>{
              const stat = m.estoque===0?"SEM ESTOQUE":m.estoque<m.minimo?"BAIXO":"OK";
              const sclr = stat==="SEM ESTOQUE"?"#ef4444":stat==="BAIXO"?"#f97316":"#10b981";
              return (
                <tr key={m.id} style={{borderBottom:`1px solid rgba(99,179,237,0.06)`}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{m.id}</td>
                  <td style={{padding:"12px 16px",fontSize:12}}>{m.nome}</td>
                  <td style={{padding:"12px 16px",fontSize:11,color:S.muted}}>{m.cat}</td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:700,color:sclr}}>{m.estoque}</td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11,color:S.muted}}>{m.minimo}</td>
                  <td style={{padding:"12px 16px"}}><span style={{background:sclr+"20",color:sclr,border:`1px solid ${sclr}40`,padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700}}>{stat}</span></td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11}}>R$ {m.custo.toFixed(2)}</td>
                  <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:12,color:m.pendencias>0?"#eab308":"#10b981",fontWeight:700}}>{m.pendencias>0?`⚠️ ${m.pendencias}`:"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── IA SIGMA ───
  const renderIA = () => {
    const conflitos: any[] = [];
    osList.forEach(o=>{
      if(o.materialBloqueado&&o.status!=="concluida") conflitos.push({sev:"alta",tipo:"🔒 Material",msg:`${o.id}: Materiais bloqueando execução`,rec:"Contatar fornecedores. Avaliar substitutos."});
      if(o.diasPraza<0&&!["concluida","cancelada"].includes(o.status)) conflitos.push({sev:"critica",tipo:"⏱ Atraso",msg:`${o.id}: ATRASADA ${Math.abs(o.diasPraza)} dias`,rec:"Replanejamento urgente. Considerar recursos extras."});
      if(o.equipDisponivel<40&&["aberta","planejada"].includes(o.status)) conflitos.push({sev:"alta",tipo:"👥 Equipe",msg:`${o.id}: Equipe ${o.equipDisponivel}% disponível`,rec:"Redistribuir ou contratar temporariamente."});
      if(o.criticidade==="critica"&&o.diasPraza<=5&&o.diasPraza>=0) conflitos.push({sev:"critica",tipo:"⚡ Risco",msg:`${o.id}: Ativo crítico prazo em ${o.diasPraza}d`,rec:"Executar HOJE. Preparar plano B."});
    });
    const recs = [
      {t:"🔴 Prioridade Máxima",d:osData.sort((a,b)=>b.score-a.score)[0]?.id+": "+osData[0]?.descricao,a:"Iniciar execução imediatamente.",imp:"alta"},
      {t:"⚠️ Conflitos Críticos",d:`${conflitos.filter(c=>c.sev==="critica").length} conflito(s) aguardando resolução`,a:"Revisar seção Conflitos.",imp:"alta"},
      {t:"🔧 Materiais Pendentes",d:`${kpis.bloqueadas} OS(s) com materiais bloqueados`,a:"Verificar fornecedores urgente.",imp:"media"},
      {t:"📅 Replanejamento",d:`${kpis.atrasos} OS(s) atrasadas precisam de novo prazo`,a:"Reorganizar Gantt com Score Sigma.",imp:"alta"},
      {t:"📈 Aumentar Preventiva",d:"60% corretiva vs 40% preventiva",a:"Aumentar investimento em preventiva.",imp:"media"},
    ];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>🧠 IA Sigma — Inteligência Operacional</div>
        {/* Métricas */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
          {[
            {l:"MTTR",sub:"Tempo Médio de Reparo",v:mttr,u:"dias",ok:mttr<5,c:"#3b82f6"},
            {l:"MTBF",sub:"Tempo Entre Falhas",v:mtbf,u:"dias",ok:mtbf>20,c:"#10b981"},
            {l:"Backlog",sub:"Trabalho Pendente",v:backlog,u:"dias equiv.",ok:backlog<15,c:"#f97316"},
            {l:"Score Médio",sub:"Das OS abertas",v:(osData.reduce((s,o)=>s+o.score,0)/osData.length).toFixed(1),u:"/10",ok:true,c:"#8b5cf6"},
          ].map((m,i)=>(
            <div key={i} style={{...card(),padding:20}}>
              <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600,marginBottom:6}}>{m.l}</div>
              <div style={{fontSize:12,color:S.muted,marginBottom:10}}>{m.sub}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:34,fontWeight:800,color:m.c,letterSpacing:"-0.02em"}}>{m.v}<span style={{fontSize:14,fontWeight:400,marginLeft:4}}>{m.u}</span></div>
              <div style={{fontSize:11,marginTop:8,color:m.ok?"#10b981":"#f97316"}}>{m.ok?"✅ Saudável":"⚠️ Atenção necessária"}</div>
            </div>
          ))}
        </div>
        {/* Score de todas OS */}
        <div style={{...card(),padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:16}}>📊 Distribuição de Score Sigma™ por OS</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={osData.sort((a,b)=>b.score-a.score).map(o=>({id:o.id.replace("OS-",""),score:o.score,fill:sc(o.score)}))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
              <XAxis dataKey="id" stroke={S.muted} tick={{fill:S.muted,fontSize:10}}/>
              <YAxis domain={[0,10]} stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
              <Tooltip content={<CT/>}/>
              <Bar dataKey="score" name="Score" radius={[6,6,0,0]}>
                {osData.sort((a,b)=>b.score-a.score).map((o,i)=><Cell key={i} fill={sc(o.score)}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Conflitos + Recomendações */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{...card({borderColor:"rgba(239,68,68,0.2)"}),padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:"#fca5a5"}}>🚨 Conflitos Detectados ({conflitos.length})</div>
            {conflitos.length===0?<div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:12,fontSize:12,color:"#10b981"}}>✅ Nenhum conflito! Cronograma saudável.</div>:
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {conflitos.map((c,i)=>(
                <div key={i} style={{padding:12,borderRadius:8,background:c.sev==="critica"?"rgba(239,68,68,0.08)":"rgba(249,115,22,0.08)",borderLeft:`3px solid ${c.sev==="critica"?"#ef4444":"#f97316"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:c.sev==="critica"?"#ef4444":"#f97316"}}>{c.tipo}</span>
                    <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,fontWeight:700,background:c.sev==="critica"?"rgba(239,68,68,0.15)":"rgba(249,115,22,0.15)",color:c.sev==="critica"?"#ef4444":"#f97316"}}>{c.sev.toUpperCase()}</span>
                  </div>
                  <p style={{fontSize:11,color:S.muted,marginBottom:4}}>{c.msg}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>💡 {c.rec}</p>
                </div>
              ))}
            </div>}
          </div>
          <div style={{...card({borderColor:"rgba(234,179,8,0.2)"}),padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:"#fde68a"}}>💡 Recomendações Automáticas</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {recs.map((r,i)=>(
                <div key={i} style={{padding:12,borderRadius:8,background:r.imp==="alta"?"rgba(239,68,68,0.06)":"rgba(234,179,8,0.06)",borderLeft:`3px solid ${r.imp==="alta"?"#ef4444":"#eab308"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:700}}>{r.t}</span>
                    <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,fontWeight:700,background:r.imp==="alta"?"rgba(239,68,68,0.15)":"rgba(234,179,8,0.15)",color:r.imp==="alta"?"#ef4444":"#eab308"}}>{r.imp.toUpperCase()}</span>
                  </div>
                  <p style={{fontSize:11,color:S.muted,marginBottom:4}}>{r.d}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>✓ {r.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL OS ───
  const renderModalOS = () => {
    const os = modal;
    const ia = os.diasPraza<0?`🔴 OS ATRASADA ${Math.abs(os.diasPraza)} dias. Replanejamento urgente necessário com alocação máxima de recursos.`:os.score>=8?`🔴 Score ${os.score}/10 — prioridade máxima. Executar em até ${os.diasPraza} dias com equipe preferencial. Monitoramento diário.`:os.score>=6?`🟠 Score ${os.score}/10 — monitorar. Planejar execução nos próximos ${os.diasPraza} dias. Verificar materiais.`:`🟢 Score ${os.score}/10 — situação controlada. Executar conforme cronograma em ${os.diasPraza} dias.`;
    return (
      <div style={{background:S.surf,borderRadius:20,maxWidth:640,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 0 60px rgba(0,212,255,0.12)"}}>
        <div style={{padding:24,background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(139,92,246,0.08))",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${S.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff",marginBottom:6,letterSpacing:"0.06em"}}>{os.id}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:18,fontWeight:700,marginBottom:4}}>{os.descricao}</div>
              <div style={{fontSize:12,color:S.muted}}>{os.ativo}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Ring score={os.score} size={60}/>
              <button onClick={()=>setModalType(null)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${S.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",color:S.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✕</button>
            </div>
          </div>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
          {/* Badges */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],border:`1px solid ${CC[os.criticidade]}40`,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>CRITICIDADE: {os.criticidade}</span>
            <span style={{background:CS[os.status]+"20",color:CS[os.status],border:`1px solid ${CS[os.status]}40`,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700}}>{os.status.toUpperCase()}</span>
            {os.materialBloqueado&&<span style={{background:"rgba(234,179,8,0.12)",color:"#eab308",border:"1px solid rgba(234,179,8,0.25)",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700}}>🔒 MATERIAL BLOQUEADO</span>}
          </div>
          {/* Score Sigma */}
          <div style={{padding:16,borderRadius:12,background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)"}}>
            <div style={{marginBottom:10,fontSize:12,fontWeight:700,color:"#00d4ff"}}>📊 Score Sigma™ Detalhado</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
              {Object.entries(os.d).map(([k,v]:any)=>(
                <div key={k} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:9,color:S.muted,textTransform:"capitalize",marginBottom:4}}>{k}</div>
                  <div style={{fontFamily:"DM Mono,monospace",fontSize:16,fontWeight:700,color:"#00d4ff"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,height:8,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${os.score*10}%`,background:`linear-gradient(90deg,${sc(os.score)}60,${sc(os.score)})`,borderRadius:6,transition:"width 0.8s ease"}}/>
            </div>
            <div style={{fontSize:12}}>{os.score>=8?"🔴 CRÍTICO — Executar imediatamente!":os.score>=6?"🟠 ALTO — Monitorar e planejar":"🟢 NORMAL — Dentro dos padrões"}</div>
          </div>
          {/* Info Grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {l:"HH Planejado",v:`${os.hhPlanejado}h`,c:"#8b5cf6"},
              {l:"HH Realizado",v:`${os.hhRealizado}h`,c:os.hhRealizado>os.hhPlanejado?"#ef4444":"#10b981"},
              {l:"Equipe Disponível",v:`${os.equipDisponivel}%`,c:os.equipDisponivel<50?"#ef4444":"#10b981"},
              {l:"Prazo",v:`${os.diasPraza>=0?"+":""}${os.diasPraza}d`,c:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981"},
              {l:"Responsável",v:os.responsavel,c:"#00d4ff"},
              {l:"Criado em",v:os.criadoEm,c:S.muted},
            ].map((item,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,border:`1px solid ${S.border}`}}>
                <div style={{fontSize:10,color:S.muted,marginBottom:6,letterSpacing:"0.04em"}}>{item.l}</div>
                <div style={{fontSize:15,fontWeight:700,color:item.c,fontFamily:"Syne,sans-serif"}}>{item.v}</div>
              </div>
            ))}
          </div>
          {/* Observações */}
          {os.obs&&<div style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,fontSize:12,color:"rgba(255,255,255,0.6)"}}>💬 {os.obs}</div>}
          {/* IA */}
          <div style={{padding:16,borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
            <div style={{fontSize:10,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:8}}>🤖 Análise SIGMA IA</div>
            <p style={{fontSize:13,lineHeight:1.7,color:"rgba(255,255,255,0.8)"}}>{ia}</p>
          </div>
          {/* Alertas */}
          {os.diasPraza<0&&<div style={{padding:12,borderRadius:10,background:"rgba(239,68,68,0.08)",borderLeft:"3px solid #ef4444"}}><p style={{fontWeight:700,color:"#ef4444",fontSize:12}}>🔴 CRÍTICO: OS ATRASADA {Math.abs(os.diasPraza)} dias!</p></div>}
          {os.materialBloqueado&&<div style={{padding:12,borderRadius:10,background:"rgba(234,179,8,0.08)",borderLeft:"3px solid #eab308"}}><p style={{fontWeight:700,color:"#eab308",fontSize:12}}>🔒 Materiais Bloqueados — verificar fornecedores</p></div>}
          {/* Alterar Status */}
          <div style={{display:"flex",gap:8}}>
            <select onChange={e=>{if(e.target.value){updateStatus(os.id,e.target.value as Status);setModalType(null);}}} style={{...inp,flex:1}}>
              <option value="">Alterar status...</option>
              {["aberta","planejada","execucao","concluida","cancelada"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={()=>{setModalType("apontHH");setNovaAp({...novaAp,osId:os.id});}} style={{...btn("rgba(139,92,246,0.2)","#a78bfa"),border:"1px solid rgba(139,92,246,0.3)",whiteSpace:"nowrap"}}>+ Apontamento HH</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── MODAL NOVA OS ───
  const renderModalNovaOS = () => (
    <div style={{background:S.surf,borderRadius:20,maxWidth:560,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{padding:24,borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18}}>+ Nova Ordem de Serviço</div>
        <button onClick={()=>setModalType(null)} style={{background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:20}}>✕</button>
      </div>
      <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>
        {[
          {l:"Descrição *",k:"descricao",type:"text",ph:"Ex: Manutenção bomba HVAC"},
          {l:"Ativo/Local *",k:"ativo",type:"text",ph:"Ex: HVAC Zona 2"},
          {l:"Responsável *",k:"responsavel",type:"text",ph:"Nome do responsável"},
          {l:"Data Prevista *",k:"dataPrevista",type:"date",ph:""},
          {l:"Observações",k:"obs",type:"text",ph:"Informações adicionais..."},
        ].map((f,i)=>(
          <div key={i}>
            <div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>{f.l}</div>
            <input type={f.type} value={(novaOS as any)[f.k]||""} onChange={e=>setNovaOS(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Criticidade</div>
            <select value={novaOS.criticidade} onChange={e=>setNovaOS(p=>({...p,criticidade:e.target.value as Crit}))} style={inp}>
              {["critica","alta","media","baixa"].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>HH Planejado</div>
            <input type="number" value={novaOS.hhPlanejado} onChange={e=>setNovaOS(p=>({...p,hhPlanejado:+e.target.value}))} style={inp}/>
          </div>
          <div>
            <div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Prioridade (0-10)</div>
            <input type="number" min="0" max="10" value={novaOS.prioridade} onChange={e=>setNovaOS(p=>({...p,prioridade:+e.target.value}))} style={inp}/>
          </div>
          <div>
            <div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Material Bloqueado?</div>
            <select value={novaOS.materialBloqueado?"sim":"nao"} onChange={e=>setNovaOS(p=>({...p,materialBloqueado:e.target.value==="sim"}))} style={inp}>
              <option value="nao">Não</option><option value="sim">Sim</option>
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={()=>setModalType(null)} style={{flex:1,...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.5)"),border:`1px solid ${S.border}`}}>Cancelar</button>
          <button onClick={salvarOS} style={{flex:2,...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),boxShadow:"0 0 20px rgba(0,212,255,0.2)"}}>✅ Criar OS</button>
        </div>
      </div>
    </div>
  );

  // ─── MODAL APONTAMENTO HH ───
  const renderModalApt = () => (
    <div style={{background:S.surf,borderRadius:20,maxWidth:480,width:"100%"}}>
      <div style={{padding:24,borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}>
        <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18}}>⏱ Registrar Apontamento HH</div>
        <button onClick={()=>setModalType(null)} style={{background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:20}}>✕</button>
      </div>
      <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>
        {[
          {l:"OS *",k:"osId",type:"select",opts:osList.map(o=>o.id)},
          {l:"Funcionário *",k:"funcionario",type:"text",ph:"Nome"},
          {l:"Data *",k:"data",type:"date",ph:""},
        ].map((f,i)=>(
          <div key={i}>
            <div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase"}}>{f.l}</div>
            {f.type==="select"?<select value={(novaAp as any)[f.k]||""} onChange={e=>setNovaAp(p=>({...p,[f.k]:e.target.value}))} style={inp}><option value="">Selecionar OS...</option>{f.opts?.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input type={f.type} value={(novaAp as any)[f.k]||""} onChange={e=>setNovaAp(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/>}
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase"}}>HH Planejado</div><input type="number" step="0.5" value={novaAp.hhPlan} onChange={e=>setNovaAp(p=>({...p,hhPlan:+e.target.value}))} style={inp}/></div>
          <div><div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase"}}>HH Realizado</div><input type="number" step="0.5" value={novaAp.hhReal} onChange={e=>setNovaAp(p=>({...p,hhReal:+e.target.value}))} style={inp}/></div>
        </div>
        <div><div style={{fontSize:11,color:S.muted,marginBottom:6,textTransform:"uppercase"}}>Tarefas Realizadas</div><input value={novaAp.tarefas||""} onChange={e=>setNovaAp(p=>({...p,tarefas:e.target.value}))} placeholder="Descreva as tarefas..." style={inp}/></div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={()=>setModalType(null)} style={{flex:1,...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.5)"),border:`1px solid ${S.border}`}}>Cancelar</button>
          <button onClick={salvarApt} style={{flex:2,...btn("linear-gradient(135deg,#8b5cf6,#6d28d9)")}} >✅ Registrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh",background:S.bg,color:S.text,fontFamily:"DM Sans,sans-serif"}}>
      {/* TOAST */}
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:13,background:"rgba(13,20,35,0.96)",border:`1px solid ${toast.includes("⚠️")?"rgba(234,179,8,0.4)":"rgba(16,185,129,0.4)"}`,color:toast.includes("⚠️")?"#eab308":"#10b981",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",backdropFilter:"blur(12px)"}}>{toast}</div>}

      {/* SIDEBAR */}
      <div style={{width:sideOpen?240:60,background:"rgba(13,20,35,0.95)",borderRight:`1px solid ${S.border}`,display:"flex",flexDirection:"column",transition:"width 0.3s ease",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"hidden",zIndex:30}}>
        {/* Logo */}
        <div style={{padding:"20px 16px",borderBottom:`1px solid ${S.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00d4ff,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"#fff",flexShrink:0,boxShadow:"0 0 16px rgba(0,212,255,0.3)"}}>Σ</div>
          {sideOpen&&<div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,letterSpacing:"-0.02em"}}>SIGMA AI</div>
            <div style={{fontSize:9,color:S.muted,letterSpacing:"0.06em"}}>MANUTENÇÃO</div>
          </div>}
        </div>
        {/* Nav */}
        <nav style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setMod(n.id as Modulo)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,background:mod===n.id?"rgba(0,212,255,0.12)":"transparent",color:mod===n.id?"#00d4ff":S.muted,outline:mod===n.id?"1px solid rgba(0,212,255,0.2)":"none",fontSize:13,fontWeight:mod===n.id?600:400,transition:"all 0.2s",fontFamily:"DM Sans,sans-serif",textAlign:"left"}}>
              <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
              {sideOpen&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.lbl}</span>}
            </button>
          ))}
        </nav>
        {/* Toggle + Status */}
        <div style={{padding:"12px 8px",borderTop:`1px solid ${S.border}`}}>
          {sideOpen&&<div style={{marginBottom:10,padding:"8px 12px",background:"rgba(16,185,129,0.08)",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,color:"#10b981",fontWeight:600}}>Sistema Online</span>
          </div>}
          <button onClick={()=>setSideOpen(!sideOpen)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${S.border}`,background:"transparent",color:S.muted,cursor:"pointer",fontSize:12,fontFamily:"DM Sans,sans-serif"}}>
            {sideOpen?"◀ Minimizar":"▶"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <div style={{background:"rgba(13,20,35,0.9)",borderBottom:`1px solid ${S.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:16,color:S.text}}>
            {NAV.find(n=>n.id===mod)?.icon} {NAV.find(n=>n.id===mod)?.lbl}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button onClick={()=>{
              const csv="ID,Descricao,Criticidade,Status,Score,HH,Prazo,Responsavel\n"+filtered.map(o=>`${o.id},"${o.descricao}",${o.criticidade},${o.status},${o.score},${o.hhPlanejado},${o.diasPraza}d,"${o.responsavel}"`).join("\n");
              const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="sigma-ai.csv";a.click();showToast("📊 CSV exportado!");
            }} style={{...btn("rgba(16,185,129,0.12)","#10b981"),border:"1px solid rgba(16,185,129,0.25)",fontSize:12,padding:"6px 14px"}}>📥 CSV</button>
            {mod==="os"&&<button onClick={()=>setModalType("novaOS")} style={{...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),fontSize:12,padding:"6px 14px",borderRadius:8}}>+ Nova OS</button>}
            {mod==="hh"&&<button onClick={()=>setModalType("apontHH")} style={{...btn("linear-gradient(135deg,#8b5cf6,#6d28d9)"),fontSize:12,padding:"6px 14px",borderRadius:8}}>+ Apontamento</button>}
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {mod==="dashboard"&&renderDashboard()}
          {mod==="os"&&renderOS()}
          {mod==="gantt"&&renderGantt()}
          {mod==="hh"&&renderHH()}
          {mod==="ativos"&&renderAtivos()}
          {mod==="materiais"&&renderMateriais()}
          {mod==="ia"&&renderIA()}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {modalType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16,backdropFilter:"blur(4px)"}} onClick={()=>setModalType(null)}>
        <div onClick={e=>e.stopPropagation()}>
          {modalType==="os"&&modal&&renderModalOS()}
          {modalType==="novaOS"&&renderModalNovaOS()}
          {modalType==="apontHH"&&renderModalApt()}
        </div>
      </div>}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} * {scrollbar-width:thin;scrollbar-color:rgba(99,179,237,0.2) transparent;}`}</style>
    </div>
  );
}
