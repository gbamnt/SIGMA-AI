"use client";
import { useState, useMemo, useCallback } from "react";
import Planejamento from "./planejamento";
import Preventivas from "./preventivas";
import AssistenteIA from "./assistente-ia";
import Inteligencia from "./inteligencia";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

type Role="admin"|"gestor"|"tecnico";
type Crit="critica"|"alta"|"media"|"baixa";
type Status="aberta"|"planejada"|"execucao"|"concluida"|"cancelada";
type Mod="dashboard"|"os"|"planejamento"|"preventivas"|"gantt"|"hh"|"ativos"|"materiais"|"inteligencia"|"relatorios"|"config";
interface User{id:string;nome:string;email:string;senha:string;role:Role;avatar:string;setor:string;}
interface Notif{id:string;tipo:"alerta"|"info"|"sucesso"|"erro";titulo:string;msg:string;lida:boolean;tempo:string;}
interface OS{id:string;descricao:string;ativo:string;criticidade:Crit;status:Status;dataPrevista:string;diasPraza:number;hhPlanejado:number;hhRealizado:number;equipDisponivel:number;responsavel:string;materialBloqueado:boolean;prioridade:number;risco:number;urgencia:number;impacto:number;obs:string;criadoEm:string;}
interface Ativo{id:string;nome:string;tipo:string;local:string;criticidade:Crit;mtbf:number;ultimaManut:string;status:string;valor:number;}
interface Material{id:string;nome:string;cat:string;estoque:number;minimo:number;custo:number;pendencias:number;fornecedor:string;}
interface ApontHH{id:string;osId:string;funcionario:string;data:string;hhPlan:number;hhReal:number;tarefas:string;}

const USERS:User[]=[
  {id:"u1",nome:"Gabriel Lucas",email:"admin@sigma.ai",senha:"admin123",role:"admin",avatar:"GL",setor:"Diretoria"},
  {id:"u2",nome:"Maria Costa",email:"gestor@sigma.ai",senha:"gestor123",role:"gestor",avatar:"MC",setor:"Manutenção"},
  {id:"u3",nome:"João Silva",email:"tecnico@sigma.ai",senha:"tecnico123",role:"tecnico",avatar:"JS",setor:"Operações"},
];
const NOTIFS0:Notif[]=[
  {id:"n1",tipo:"alerta",titulo:"OS Atrasada",msg:"OS-1039 atrasada há 3 dias!",lida:false,tempo:"2min"},
  {id:"n2",tipo:"alerta",titulo:"Material em Falta",msg:"Relé Térmico 10A — estoque zerado",lida:false,tempo:"15min"},
  {id:"n3",tipo:"info",titulo:"OS Criada",msg:"OS-1071 criada por Marcos Torres",lida:false,tempo:"1h"},
  {id:"n4",tipo:"sucesso",titulo:"OS Concluída",msg:"OS-1045 concluída com sucesso",lida:true,tempo:"2h"},
  {id:"n5",tipo:"alerta",titulo:"Score Crítico",msg:"OS-1071 Score 9.3 — ação imediata",lida:false,tempo:"3h"},
];
const OS0:OS[]=[
  {id:"OS-1052",descricao:"Cobertura com Vazamento — Torre A",ativo:"Cobertura Torre A",criticidade:"critica",status:"aberta",dataPrevista:"2025-02-15",diasPraza:2,hhPlanejado:12,hhRealizado:0,equipDisponivel:70,responsavel:"João Silva",materialBloqueado:true,prioridade:9,risco:9,urgencia:8,impacto:8,obs:"Chuva agravou o problema",criadoEm:"2025-02-01"},
  {id:"OS-1048",descricao:"Manutenção Bombas HVAC — Zona 2",ativo:"HVAC Zona 2",criticidade:"alta",status:"planejada",dataPrevista:"2025-02-20",diasPraza:7,hhPlanejado:8,hhRealizado:0,equipDisponivel:50,responsavel:"Maria Costa",materialBloqueado:true,prioridade:7,risco:7,urgencia:6,impacto:7,obs:"Aguardando filtros",criadoEm:"2025-02-03"},
  {id:"OS-1061",descricao:"Limpeza Filtros HVAC — Bloco B",ativo:"HVAC Bloco B",criticidade:"media",status:"aberta",dataPrevista:"2025-02-28",diasPraza:15,hhPlanejado:6,hhRealizado:0,equipDisponivel:80,responsavel:"Pedro Lima",materialBloqueado:false,prioridade:5,risco:4,urgencia:4,impacto:5,obs:"",criadoEm:"2025-02-05"},
  {id:"OS-1039",descricao:"Vazamento Emergencial — Subsolo",ativo:"Subsolo / Cisterna",criticidade:"critica",status:"execucao",dataPrevista:"2025-02-10",diasPraza:-3,hhPlanejado:16,hhRealizado:10,equipDisponivel:60,responsavel:"Ana Souza",materialBloqueado:false,prioridade:10,risco:10,urgencia:10,impacto:9,obs:"URGENTE - ameaça estrutura",criadoEm:"2025-01-28"},
  {id:"OS-1055",descricao:"Inspeção Estrutural — Torre B",ativo:"Estrutura Torre B",criticidade:"critica",status:"aberta",dataPrevista:"2025-03-08",diasPraza:20,hhPlanejado:20,hhRealizado:0,equipDisponivel:90,responsavel:"Carlos Neto",materialBloqueado:false,prioridade:9,risco:8,urgencia:7,impacto:9,obs:"",criadoEm:"2025-02-01"},
  {id:"OS-1064",descricao:"Luminárias LED — Garagem",ativo:"Garagem",criticidade:"alta",status:"planejada",dataPrevista:"2025-02-25",diasPraza:12,hhPlanejado:10,hhRealizado:0,equipDisponivel:40,responsavel:"Beatriz Melo",materialBloqueado:false,prioridade:6,risco:5,urgencia:5,impacto:6,obs:"",criadoEm:"2025-02-06"},
  {id:"OS-1047",descricao:"Inspeção SPDA / Para-Raios",ativo:"SPDA Geral",criticidade:"alta",status:"aberta",dataPrevista:"2025-03-01",diasPraza:16,hhPlanejado:8,hhRealizado:0,equipDisponivel:70,responsavel:"Fernando Dias",materialBloqueado:false,prioridade:7,risco:8,urgencia:6,impacto:7,obs:"",criadoEm:"2025-02-04"},
  {id:"OS-1059",descricao:"Pintura Fachada — Bloco C",ativo:"Fachada Bloco C",criticidade:"baixa",status:"planejada",dataPrevista:"2025-03-15",diasPraza:30,hhPlanejado:40,hhRealizado:0,equipDisponivel:60,responsavel:"Juliana Rosa",materialBloqueado:false,prioridade:3,risco:2,urgencia:2,impacto:3,obs:"",criadoEm:"2025-02-07"},
  {id:"OS-1063",descricao:"Manutenção Elevadores — Torres A/B",ativo:"Elevadores",criticidade:"alta",status:"planejada",dataPrevista:"2025-02-22",diasPraza:9,hhPlanejado:14,hhRealizado:0,equipDisponivel:30,responsavel:"Roberto Alves",materialBloqueado:false,prioridade:8,risco:7,urgencia:7,impacto:8,obs:"",criadoEm:"2025-02-02"},
  {id:"OS-1071",descricao:"Revisão Subestação Elétrica",ativo:"Subestação",criticidade:"critica",status:"aberta",dataPrevista:"2025-02-18",diasPraza:5,hhPlanejado:24,hhRealizado:0,equipDisponivel:50,responsavel:"Marcos Torres",materialBloqueado:true,prioridade:10,risco:10,urgencia:9,impacto:10,obs:"Laudo técnico necessário",criadoEm:"2025-01-30"},
];
const ATIVOS:Ativo[]=[
  {id:"AT-001",nome:"Sistema HVAC Zona 1",tipo:"HVAC",local:"3º Andar",criticidade:"critica",mtbf:720,ultimaManut:"2024-11-01",status:"ativo",valor:85000},
  {id:"AT-002",nome:"Bombas HVAC Zona 2",tipo:"HVAC",local:"4º Andar",criticidade:"alta",mtbf:960,ultimaManut:"2024-10-15",status:"ativo",valor:42000},
  {id:"AT-003",nome:"Subestação Principal",tipo:"Elétrico",local:"Subsolo",criticidade:"critica",mtbf:2160,ultimaManut:"2024-08-01",status:"ativo",valor:320000},
  {id:"AT-004",nome:"Para-Raios SPDA",tipo:"Segurança",local:"Cobertura",criticidade:"alta",mtbf:8760,ultimaManut:"2024-01-15",status:"ativo",valor:28000},
  {id:"AT-005",nome:"Elevadores Torres A/B",tipo:"Transporte",local:"Torres A/B",criticidade:"alta",mtbf:2160,ultimaManut:"2024-12-01",status:"manutencao",valor:180000},
  {id:"AT-006",nome:"Cisterna e Bombeamento",tipo:"Hidráulico",local:"Subsolo",criticidade:"critica",mtbf:1440,ultimaManut:"2024-09-01",status:"ativo",valor:65000},
];
const MATERIAIS:Material[]=[
  {id:"MAT-001",nome:"Filtro HVAC 16x20",cat:"HVAC",estoque:2,minimo:5,custo:85.50,pendencias:3,fornecedor:"TechFiltros LTDA"},
  {id:"MAT-002",nome:"Relé Térmico 10A",cat:"Elétrico",estoque:0,minimo:3,custo:145.00,pendencias:2,fornecedor:"ElétricaPro"},
  {id:"MAT-003",nome:"Bomba d'água 1HP",cat:"Hidráulico",estoque:1,minimo:1,custo:980.00,pendencias:0,fornecedor:"HidraMaq"},
  {id:"MAT-004",nome:"Cabo PP 4mm²",cat:"Elétrico",estoque:50,minimo:20,custo:12.50,pendencias:0,fornecedor:"CaboFlex"},
  {id:"MAT-005",nome:"Graxa Lubrificante",cat:"Mecânico",estoque:8,minimo:5,custo:45.00,pendencias:0,fornecedor:"LubriMax"},
  {id:"MAT-006",nome:"Disjuntor 70A",cat:"Elétrico",estoque:0,minimo:2,custo:220.00,pendencias:1,fornecedor:"ElétricaPro"},
  {id:"MAT-007",nome:"Mangueira Flexível 1\"",cat:"Hidráulico",estoque:15,minimo:10,custo:35.00,pendencias:0,fornecedor:"HidraMaq"},
  {id:"MAT-008",nome:"Lâmpada LED 20W",cat:"Elétrico",estoque:30,minimo:15,custo:18.90,pendencias:0,fornecedor:"LuminoPro"},
];
const APONTS0:ApontHH[]=[
  {id:"ap1",osId:"OS-1039",funcionario:"Ana Souza",data:"2025-02-08",hhPlan:8,hhReal:8,tarefas:"Inspeção inicial, localização do vazamento"},
  {id:"ap2",osId:"OS-1039",funcionario:"Pedro Lima",data:"2025-02-09",hhPlan:8,hhReal:7,tarefas:"Reparo parcial, vedação provisória"},
  {id:"ap3",osId:"OS-1052",funcionario:"João Silva",data:"2025-02-12",hhPlan:6,hhReal:6,tarefas:"Inspeção cobertura, mapeamento de falhas"},
];

function calcScore(os:OS){
  const hh=Math.min(os.hhPlanejado/4,10),d=os.equipDisponivel/10,b=os.materialBloqueado?3:0,at=os.diasPraza<0?2:0;
  const s=Math.max(0,Math.min(10,os.prioridade*0.2+os.risco*0.25+os.urgencia*0.2+os.impacto*0.15+hh*0.1+d*0.1-b*0.3+at*0.15));
  return{score:parseFloat(s.toFixed(1)),d:{Prioridade:os.prioridade,Risco:os.risco,"Urgência":os.urgencia,Impacto:os.impacto,HH:parseFloat(hh.toFixed(1)),Disponib:parseFloat(d.toFixed(1))}};
}
const CC:Record<string,string>={critica:"#ef4444",alta:"#f97316",media:"#eab308",baixa:"#22c55e"};
const CS:Record<string,string>={aberta:"#3b82f6",planejada:"#8b5cf6",execucao:"#00d4ff",concluida:"#10b981",cancelada:"#6b7280"};
const sc=(s:number)=>s>=8?"#ef4444":s>=6?"#f97316":s>=4?"#eab308":"#10b981";
const sl=(s:number)=>s>=8?"CRÍTICO":s>=6?"ALTO":s>=4?"MÉDIO":"BAIXO";
const S={bg:"#080c14",surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b"};
const rC:Record<Role,string>={admin:"#00d4ff",gestor:"#10b981",tecnico:"#f97316"};
const rL:Record<Role,string>={admin:"Administrador",gestor:"Gestor",tecnico:"Técnico"};

function Ring({score,size=48}:{score:number;size?:number}){
  const r=(size-8)/2,circ=2*Math.PI*r,fill=(score/10)*circ,clr=sc(score);
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth={5}
      strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
      transform={`rotate(-90 ${size/2} ${size/2})`} style={{filter:`drop-shadow(0 0 4px ${clr})`}}/>
    <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em" fill={clr}
      style={{fontFamily:"DM Mono,monospace",fontWeight:700,fontSize:size>48?14:11}}>{score}</text>
  </svg>);
}
function Av({u,size=36}:{u:User;size?:number}){
  const g:Record<Role,string>={admin:"linear-gradient(135deg,#00d4ff,#8b5cf6)",gestor:"linear-gradient(135deg,#10b981,#3b82f6)",tecnico:"linear-gradient(135deg,#f97316,#ef4444)"};
  return(<div style={{width:size,height:size,borderRadius:"50%",background:g[u.role],display:"flex",alignItems:"center",justifyContent:"center",fontSize:size>36?14:11,fontWeight:700,color:"#fff",flexShrink:0,fontFamily:"Syne,sans-serif"}}>{u.avatar}</div>);
}
const CT=({active,payload,label}:any)=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:S.surf2,border:`1px solid ${S.border}`,borderRadius:8,padding:"10px 14px",fontSize:12,fontFamily:"DM Mono,monospace"}}>
    <p style={{color:S.muted,marginBottom:4}}>{label}</p>
    {payload.map((p:any,i:number)=><p key={i} style={{color:p.color||"#00d4ff"}}>{p.name}: <b>{p.value}</b></p>)}
  </div>);
};

export default function App(){
  const[user,setUser]=useState<User|null>(null);
  const[ld,setLd]=useState({email:"",senha:""});
  const[lErr,setLErr]=useState("");
  const[lLoad,setLLoad]=useState(false);
  const[mod,setMod]=useState<Mod>("dashboard");
  const[osList,setOsList]=useState<OS[]>(OS0);
  const[aponts,setAponts]=useState<ApontHH[]>(APONTS0);
  const[notifs,setNotifs]=useState<Notif[]>(NOTIFS0);
  const[search,setSearch]=useState("");
  const[fSt,setFSt]=useState("");
  const[fCr,setFCr]=useState("");
  const[sortBy,setSortBy]=useState("score");
  const[modal,setModal]=useState<any>(null);
  const[mType,setMType]=useState<string|null>(null);
  const[side,setSide]=useState(true);
  const[showN,setShowN]=useState(false);
  const[showP,setShowP]=useState(false);
  const[toast,setToast]=useState<{m:string;t:string}|null>(null);
  const[gs,setGs]=useState("");
  const[showGs,setShowGs]=useState(false);
  const[nOS,setNOS]=useState<Partial<OS>>({criticidade:"media",status:"aberta",hhPlanejado:8,equipDisponivel:80,materialBloqueado:false,prioridade:5,risco:5,urgencia:5,impacto:5,diasPraza:15,hhRealizado:0,obs:""});
  const[nAp,setNAp]=useState<Partial<ApontHH>>({hhPlan:8,hhReal:0,tarefas:""});
  const[cfgTab,setCfgTab]=useState("geral");

  const osD=useMemo(()=>osList.map(o=>({...o,...calcScore(o)})),[osList]);
  const nL=notifs.filter(n=>!n.lida).length;

  const mkToast=useCallback((m:string,t="success")=>{setToast({m,t});setTimeout(()=>setToast(null),3500);},[]);

  const doLogin=()=>{
    setLLoad(true);setLErr("");
    setTimeout(()=>{
      const u=USERS.find(u=>u.email===ld.email&&u.senha===ld.senha);
      if(u){setUser(u);mkToast(`✅ Bem-vindo, ${u.nome}!`);}else{setLErr("E-mail ou senha incorretos");}
      setLLoad(false);
    },1200);
  };

  const fOS=useMemo(()=>{
    let a=osD.filter(o=>(o.id+o.descricao+o.responsavel+o.ativo).toLowerCase().includes(search.toLowerCase())&&(!fSt||o.status===fSt)&&(!fCr||o.criticidade===fCr));
    if(sortBy==="score")a.sort((a,b)=>b.score-a.score);
    else if(sortBy==="prazo")a.sort((a,b)=>a.diasPraza-b.diasPraza);
    else a.sort((a,b)=>b.hhPlanejado-a.hhPlanejado);
    return a;
  },[osD,search,fSt,fCr,sortBy]);

  const kpis=useMemo(()=>({
    ab:osList.filter(o=>["aberta","planejada","execucao"].includes(o.status)).length,
    hh:osList.reduce((s,o)=>s+o.hhPlanejado,0),
    at:osList.filter(o=>o.diasPraza<0&&o.status!=="concluida").length,
    adr:Math.round((osList.filter(o=>o.diasPraza>=0).length/osList.length)*100),
    cr:osList.filter(o=>o.criticidade==="critica"&&o.status!=="concluida").length,
    bl:osList.filter(o=>o.materialBloqueado).length,
    ex:osList.filter(o=>o.status==="execucao").length,
    co:osList.filter(o=>o.status==="concluida").length,
    va:ATIVOS.reduce((s,a)=>s+a.valor,0),
  }),[osList]);

  const mttr=4,mtbf=Math.round(720/Math.max(1,kpis.cr));
  const bkl=Math.ceil(osList.filter(o=>o.status!=="concluida").reduce((s,o)=>s+o.hhPlanejado,0)/10);

  function crOS(){
    if(!nOS.descricao||!nOS.ativo||!nOS.responsavel||!nOS.dataPrevista){mkToast("⚠️ Preencha todos os campos!","w");return;}
    const id=`OS-${1072+osList.length}`;
    setOsList(p=>[...p,{...nOS,id,hhRealizado:0,obs:nOS.obs||"",criadoEm:new Date().toISOString().split("T")[0]} as OS]);
    setNotifs(p=>[{id:"n"+Date.now(),tipo:"sucesso",titulo:"OS Criada",msg:`${id} criada`,lida:false,tempo:"agora"},...p]);
    setMType(null);mkToast(`✅ ${id} criada!`);
  }
  function salApt(){
    if(!nAp.osId||!nAp.funcionario||!nAp.data){mkToast("⚠️ Preencha campos!","w");return;}
    const ap={...nAp,id:"ap"+Date.now()} as ApontHH;
    setAponts(p=>[...p,ap]);
    setOsList(p=>p.map(o=>o.id===ap.osId?{...o,hhRealizado:o.hhRealizado+(ap.hhReal||0)}:o));
    setMType(null);mkToast("✅ Apontamento registrado!");
  }
  function updSt(id:string,s:Status){
    setOsList(p=>p.map(o=>o.id===id?{...o,status:s}:o));
    if(s==="concluida")setNotifs(p=>[{id:"n"+Date.now(),tipo:"sucesso",titulo:"OS Concluída",msg:`${id} concluída!`,lida:false,tempo:"agora"},...p]);
    mkToast(`✅ ${id} → ${s}`);
  }

  const card=(e?:any)=>({background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,...e});
  const inp={background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 12px",fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",width:"100%"};
  const btn=(bg:string,c="#fff")=>({background:bg,border:"none",color:c,borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"});

  const gsR=useMemo(()=>{
    if(!gs||gs.length<2)return[];
    const q=gs.toLowerCase();
    return[...osList.filter(o=>(o.id+o.descricao+o.ativo).toLowerCase().includes(q)).slice(0,4).map(o=>({tp:"OS",id:o.id,ds:o.descricao,ex:o.criticidade})),
      ...ATIVOS.filter(a=>(a.id+a.nome).toLowerCase().includes(q)).slice(0,2).map(a=>({tp:"Ativo",id:a.id,ds:a.nome,ex:a.tipo})),
      ...MATERIAIS.filter(m=>(m.id+m.nome).toLowerCase().includes(q)).slice(0,2).map(m=>({tp:"Material",id:m.id,ds:m.nome,ex:m.cat}))];
  },[gs,osList]);

  // ── LOGIN PAGE ──
  if(!user)return(
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"DM Sans,sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)"}}/>
        <svg width="100%" height="100%" style={{position:"absolute",opacity:0.03}}><defs><pattern id="g" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00d4ff" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
      </div>
      <div style={{width:"100%",maxWidth:900,display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,borderRadius:24,overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,0.6)",border:`1px solid ${S.border}`,position:"relative",zIndex:1}}>
        <div style={{background:"linear-gradient(135deg,rgba(0,212,255,0.06) 0%,rgba(139,92,246,0.10) 100%)",borderRight:`1px solid ${S.border}`,padding:48,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:40}}>
              <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#00d4ff,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:24,color:"#fff",boxShadow:"0 0 24px rgba(0,212,255,0.4)"}}>Σ</div>
              <div><div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:S.text}}>SIGMA AI</div><div style={{fontSize:11,color:S.muted,letterSpacing:"0.08em"}}>SISTEMA DE MANUTENÇÃO</div></div>
            </div>
            <h2 style={{fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,lineHeight:1.3,marginBottom:16}}>O Waze da<br/><span style={{color:"#00d4ff"}}>Manutenção</span><br/>Predial</h2>
            <p style={{fontSize:13,color:S.muted,lineHeight:1.7,marginBottom:32}}>Gerencie ordens de serviço com IA, priorização automática Score Sigma™ e insights em tempo real.</p>
            {[{i:"🏗",t:"7 módulos completos de gestão"},{i:"🧠",t:"IA com Score Sigma™ automático"},{i:"📊",t:"Dashboards e relatórios avançados"},{i:"🔔",t:"Notificações e alertas em tempo real"},{i:"👥",t:"Controle por perfis e permissões"}].map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:16}}>{f.i}</span><span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{f.t}</span></div>
            ))}
          </div>
          <div style={{background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:12,padding:16}}>
            <div style={{fontSize:10,color:"#00d4ff",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Credenciais de Demo</div>
            {USERS.map(u=>(
              <div key={u.id} onClick={()=>setLd({email:u.email,senha:u.senha})} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:11,cursor:"pointer",padding:"5px 8px",borderRadius:6,transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.08)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><Av u={u} size={22}/><span style={{color:S.text}}>{u.email}</span></div>
                <span style={{color:S.muted,fontFamily:"DM Mono,monospace"}}>{u.senha}</span>
              </div>
            ))}
            <div style={{fontSize:10,color:S.muted,marginTop:6}}>💡 Clique numa linha para preencher</div>
          </div>
        </div>
        <div style={{background:S.surf,padding:48,display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{marginBottom:32}}><h3 style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,marginBottom:6}}>Entrar na plataforma</h3><p style={{fontSize:13,color:S.muted}}>Use suas credenciais de acesso</p></div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>E-mail</div>
            <input type="email" value={ld.email} onChange={e=>setLd(p=>({...p,email:e.target.value}))} placeholder="seu@email.com" style={{...inp,padding:"12px 16px"}} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
          </div>
          <div style={{marginBottom:28}}>
            <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Senha</div>
            <input type="password" value={ld.senha} onChange={e=>setLd(p=>({...p,senha:e.target.value}))} placeholder="••••••••" style={{...inp,padding:"12px 16px"}} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
          </div>
          {lErr&&<div style={{padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,fontSize:12,color:"#fca5a5",marginBottom:20}}>⚠️ {lErr}</div>}
          <button onClick={doLogin} disabled={lLoad} style={{...btn("linear-gradient(135deg,#00d4ff,#3b82f6,#8b5cf6)"),padding:"14px",fontSize:15,borderRadius:12,width:"100%",boxShadow:"0 0 30px rgba(0,212,255,0.2)",opacity:lLoad?0.7:1}}>
            {lLoad?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}}/>Autenticando...</span>:"Entrar →"}
          </button>
          <div style={{marginTop:24,padding:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.border}`,borderRadius:10}}>
            <div style={{fontSize:10,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Perfis disponíveis</div>
            <div style={{display:"flex",gap:8}}>{([["admin","Admin","#00d4ff"],["gestor","Gestor","#10b981"],["tecnico","Técnico","#f97316"]] as [Role,string,string][]).map(([r,l,c])=>(
              <span key={r} style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:`${c}15`,color:c,border:`1px solid ${c}30`,fontWeight:600}}>{l}</span>
            ))}</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{scrollbar-width:thin;scrollbar-color:rgba(99,179,237,0.2) transparent;}`}</style>
    </div>
  );

  // ── MAIN APP ──
  const NAV=[{id:"dashboard",i:"⌂",l:"Dashboard"},{id:"os",i:"📋",l:"Ordens de Serviço"},{id:"planejamento",i:"🗓",l:"Planejamento"},{id:"preventivas",i:"🔧",l:"Preventivas"},{id:"gantt",i:"📅",l:"Gantt / Timeline"},{id:"hh",i:"⏱",l:"Apontamento HH"},{id:"ativos",i:"🏗",l:"Ativos"},{id:"materiais",i:"📦",l:"Materiais"},{id:"ia",i:"🧠",l:"IA Sigma"},{id:"relatorios",i:"📈",l:"Relatórios"},{id:"assistente",i:"🤖",l:"Assistente IA"},...(user.role==="admin"?[{id:"config",i:"⚙️",l:"Configurações"}]:[])];

  const conflitos:any[]=[];
  osList.forEach(o=>{
    if(o.materialBloqueado&&o.status!=="concluida")conflitos.push({sev:"alta",tp:"🔒 Material",msg:`${o.id}: Materiais bloqueando`,rec:"Contatar fornecedores."});
    if(o.diasPraza<0&&!["concluida","cancelada"].includes(o.status))conflitos.push({sev:"critica",tp:"⏱ Atraso",msg:`${o.id}: ATRASADA ${Math.abs(o.diasPraza)}d`,rec:"Replanejamento urgente."});
    if(o.equipDisponivel<40&&["aberta","planejada"].includes(o.status))conflitos.push({sev:"alta",tp:"👥 Equipe",msg:`${o.id}: Equipe ${o.equipDisponivel}%`,rec:"Redistribuir recursos."});
    if(o.criticidade==="critica"&&o.diasPraza<=5&&o.diasPraza>=0)conflitos.push({sev:"critica",tp:"⚡ Risco",msg:`${o.id}: Prazo em ${o.diasPraza}d`,rec:"Executar HOJE."});
  });

  const CONTENT:Record<string,React.ReactNode>={
    dashboard:(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><h1 style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800,marginBottom:4}}>Olá, {user.nome.split(" ")[0]}! 👋</h1><p style={{fontSize:13,color:S.muted}}>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} · {rL[user.role]}</p></div>
          {kpis.at>0&&<div style={{padding:"10px 20px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,display:"flex",gap:8,cursor:"pointer"}} onClick={()=>setMod("os")}><span>🚨</span><span style={{fontSize:13,color:"#fca5a5",fontWeight:600}}>{kpis.at} OS atrasada{kpis.at>1?"s":""}</span></div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
          {[{l:"OS Abertas",v:kpis.ab,c:"#00d4ff",i:"📋"},{l:"HH Planejado",v:kpis.hh+"h",c:"#8b5cf6",i:"⏱"},{l:"Atrasos",v:kpis.at,c:"#ef4444",i:"⚠️"},{l:"Aderência",v:kpis.adr+"%",c:"#10b981",i:"📈"},{l:"Críticas",v:kpis.cr,c:"#f97316",i:"🔴"},{l:"Em Execução",v:kpis.ex,c:"#06b6d4",i:"⚡"},{l:"Bloqueadas",v:kpis.bl,c:"#eab308",i:"🔒"},{l:"Concluídas",v:kpis.co,c:"#22c55e",i:"✅"}].map((k,i)=>(
            <div key={i} style={{...card(),padding:16,cursor:"pointer",overflow:"hidden"}} onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(0,212,255,0.3)")} onMouseLeave={e=>(e.currentTarget.style.borderColor=S.border)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><span style={{fontSize:10,color:S.muted,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>{k.l}</span><span style={{fontSize:18}}>{k.i}</span></div>
              <div style={{fontSize:28,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{...card({borderColor:"rgba(139,92,246,0.25)"}),padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#a78bfa",marginBottom:12}}>🧠 SIGMA IA — Top Prioridades & Alertas</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:8}}>
            {osD.sort((a,b)=>b.score-a.score).slice(0,3).map((os,i)=>(
              <div key={i} style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:10,padding:12,cursor:"pointer"}} onClick={()=>{setModal(os);setMType("os");}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"#00d4ff"}}>{os.id}</span><Ring score={os.score} size={36}/></div>
                <p style={{fontSize:12,marginBottom:4}}>{os.descricao.substring(0,40)}</p>
                <p style={{fontSize:11,color:S.muted}}>{os.diasPraza<0?`🔴 ATRASADO ${Math.abs(os.diasPraza)}d`:os.score>=8?"🔴 Executar imediatamente":os.score>=6?"🟠 Planejar com urgência":"🟢 Dentro dos padrões"}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
          <div style={{...card(),padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📈 Curva S — Planejado vs Realizado</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={[{s:"S1",p:10,r:8},{s:"S2",p:22,r:19},{s:"S3",p:38,r:33},{s:"S4",p:56,r:48},{s:"S5",p:72,r:64},{s:"S6",p:88,r:80}]}>
                <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/><XAxis dataKey="s" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/><YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                <Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11}}/>
                <Area type="monotone" dataKey="p" name="Planejado" stroke="#3b82f6" fill="url(#gP)" strokeWidth={2}/>
                <Area type="monotone" dataKey="r" name="Realizado" stroke="#00d4ff" fill="url(#gR)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{...card(),padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📊 Status OS</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={[{n:"Abertas",v:kpis.ab},{n:"Planejadas",v:osList.filter(o=>o.status==="planejada").length},{n:"Execução",v:kpis.ex},{n:"Concluídas",v:kpis.co}]} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="v" nameKey="n">
                <Cell fill="#3b82f6"/><Cell fill="#8b5cf6"/><Cell fill="#00d4ff"/><Cell fill="#10b981"/>
              </Pie><Tooltip content={<CT/>}/></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{...card()}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,fontSize:13}}>🔥 Prioridades</span><button onClick={()=>setMod("os")} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),border:"1px solid rgba(0,212,255,0.2)",fontSize:11,padding:"4px 10px"}}>Ver todas →</button></div>
          {osD.sort((a,b)=>b.score-a.score).slice(0,5).map((os,i)=>(
            <div key={i} style={{padding:"12px 20px",borderBottom:`1px solid rgba(99,179,237,0.06)`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>{setModal(os);setMType("os");}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
              <div style={{width:22,height:22,borderRadius:6,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:S.muted,fontWeight:700}}>#{i+1}</div>
              <Ring score={os.score} size={36}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.descricao}</div><div style={{fontSize:11,color:S.muted}}>{os.id} · {os.responsavel}</div></div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{os.criticidade}</span>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981",fontWeight:700}}>{os.diasPraza>=0?"+":""}{os.diasPraza}d</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    os:(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>Ordens de Serviço</h2>
          {(user.role==="admin"||user.role==="gestor")&&<button onClick={()=>setMType("novaOS")} style={{...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),padding:"10px 20px",borderRadius:10,boxShadow:"0 0 20px rgba(0,212,255,0.2)"}}>+ Nova OS</button>}
        </div>
        <div style={{...card(),padding:16}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:200}}><div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Buscar</div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ID, descrição, responsável..." style={inp}/></div>
            {[{l:"Status",v:fSt,fn:setFSt,o:[["","Todos"],["aberta","Aberta"],["planejada","Planejada"],["execucao","Execução"],["concluida","Concluída"],["cancelada","Cancelada"]]},{l:"Criticidade",v:fCr,fn:setFCr,o:[["","Todas"],["critica","Crítica"],["alta","Alta"],["media","Média"],["baixa","Baixa"]]},{l:"Ordenar",v:sortBy,fn:setSortBy,o:[["score","Score"],["prazo","Prazo"],["hh","HH"]]}].map((f,i)=>(
              <div key={i}><div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{f.l}</div><select value={f.v} onChange={e=>f.fn(e.target.value)} style={{...inp,width:"auto",minWidth:120}}>{f.o.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
            ))}
          </div>
          {(search||fSt||fCr)&&<div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {[[search,"busca",()=>setSearch("")],[fSt,"status",()=>setFSt("")],[fCr,"criticidade",()=>setFCr("")]].filter(([v])=>v).map(([v,l,fn]:any,i)=>(
              <span key={i} style={{background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.2)",color:"#00d4ff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer"}} onClick={fn}>{l}: {v} ✕</span>
            ))}
            <span style={{fontSize:11,color:S.muted,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setSearch("");setFSt("");setFCr("");}}>Limpar</span>
          </div>}
        </div>
        <div style={{...card(),overflow:"hidden"}}>
          <div style={{padding:"12px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:13}}>Resultados <span style={{color:"#00d4ff",fontFamily:"DM Mono,monospace"}}>({fOS.length})</span></span>
            <div style={{display:"flex",gap:12,fontSize:11}}>{[["#ef4444","8–10 Crítico"],["#f97316","6–8 Alto"],["#10b981","0–6 Normal"]].map(([c,l])=><span key={l} style={{color:c as string}}>● {l}</span>)}</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"rgba(13,20,35,0.8)"}}>
                {["ID","Descrição","Ativo","Criticidade","Status","Score Σ","HH","Prazo","Responsável","Ação"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",color:S.muted,textTransform:"uppercase",borderBottom:`1px solid ${S.border}`,whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {fOS.map(os=>(
                  <tr key={os.id} style={{borderBottom:`1px solid rgba(99,179,237,0.06)`,cursor:"pointer"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                    <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{os.id}</td>
                    <td style={{padding:"12px 16px",maxWidth:200}}><div style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.descricao}</div>{os.materialBloqueado&&<span style={{fontSize:9,background:"rgba(234,179,8,0.12)",color:"#eab308",border:"1px solid rgba(234,179,8,0.2)",padding:"1px 6px",borderRadius:4,marginTop:2,display:"inline-block"}}>🔒 MATERIAL</span>}</td>
                    <td style={{padding:"12px 16px",fontSize:11,color:S.muted,maxWidth:120}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.ativo}</div></td>
                    <td style={{padding:"12px 16px"}}><span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],border:`1px solid ${CC[os.criticidade]}40`,padding:"3px 8px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{os.criticidade}</span></td>
                    <td style={{padding:"12px 16px"}}><span style={{background:CS[os.status]+"20",color:CS[os.status],border:`1px solid ${CS[os.status]}40`,padding:"3px 8px",borderRadius:20,fontSize:9,fontWeight:700}}>{os.status}</span></td>
                    <td style={{padding:"12px 16px"}}><Ring score={os.score} size={42}/></td>
                    <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:11}}><span>{os.hhPlanejado}h</span><span style={{color:S.muted}}>/</span><span style={{color:os.hhRealizado>os.hhPlanejado?"#ef4444":"#10b981"}}>{os.hhRealizado}h</span></td>
                    <td style={{padding:"12px 16px",fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:700,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981"}}>{os.diasPraza>=0?"+":""}{os.diasPraza}d</td>
                    <td style={{padding:"12px 16px",fontSize:12,color:S.muted}}>{os.responsavel}</td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>{setModal(os);setMType("os");}} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),border:"1px solid rgba(0,212,255,0.2)",padding:"4px 10px",fontSize:11}}>Ver</button>
                        {(user.role==="admin"||user.role==="gestor")&&<select onChange={e=>{if(e.target.value){updSt(os.id,e.target.value as Status);e.target.value="";}}} style={{...inp,width:36,padding:"4px 2px",fontSize:10}}><option value="">▸</option>{["aberta","planejada","execucao","concluida","cancelada"].map(s=><option key={s} value={s}>{s}</option>)}</select>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    planejamento:(
      <Planejamento
        osList={osList.map(o=>({...o,...calcScore(o)}))}
        onUpdateStatus={(id,s)=>{setOsList(p=>p.map(o=>o.id===id?{...o,status:s}:o));}}
        onToast={mkToast}
      />
    ),
    gantt:(()=>{
      const sorted=[...osD].filter(o=>o.diasPraza>=-10&&o.diasPraza<=35).sort((a,b)=>a.diasPraza-b.diasPraza);
      return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>📅 Gantt — Timeline</h2>
        <div style={{...card(),padding:20}}>
          <div style={{display:"flex",gap:14,marginBottom:16,flexWrap:"wrap"}}>{Object.entries(CS).map(([s,c])=><div key={s} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:S.muted}}><div style={{width:10,height:10,borderRadius:3,background:c}}/>{s}</div>)}</div>
          <div style={{display:"flex",marginBottom:8,paddingLeft:220}}>{[-5,0,5,10,15,20,25,30,35].map(d=><div key={d} style={{flex:1,fontSize:9,color:S.muted,textAlign:"center"}}>{d===0?"Hoje":d>0?"+"+d+"d":d+"d"}</div>)}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sorted.map(os=>{
              const pct=Math.max(2,Math.min(98,((os.diasPraza+10)/45)*100));
              const clr=os.diasPraza<0?"#ef4444":CS[os.status];
              const hhP=os.hhPlanejado>0?Math.min(100,(os.hhRealizado/os.hhPlanejado)*100):0;
              return(<div key={os.id} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:220,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
                  <Ring score={os.score} size={30}/>
                  <div style={{minWidth:0}}><div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"#00d4ff"}}>{os.id}</div><div style={{fontSize:9,color:S.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>{os.descricao.substring(0,28)}</div></div>
                </div>
                <div style={{flex:1}}>
                  <div style={{height:26,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:6,overflow:"hidden",position:"relative"}}>
                    {hhP>0&&<div style={{position:"absolute",height:"100%",width:`${hhP*pct/100}%`,background:`${clr}20`}}/>}
                    <div style={{position:"absolute",height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${clr}30,${clr}70)`,borderRadius:6}}/>
                    <div style={{position:"absolute",left:`${pct}%`,top:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:clr,boxShadow:`0 0 8px ${clr}`,zIndex:1}}/>
                    <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"rgba(255,255,255,0.45)",zIndex:2,whiteSpace:"nowrap"}}>{os.hhRealizado}h/{os.hhPlanejado}h · {os.responsavel}</span>
                  </div>
                </div>
                <div style={{width:36,fontFamily:"DM Mono,monospace",fontSize:10,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981",fontWeight:700,textAlign:"right"}}>{os.diasPraza>=0?"+":""}{os.diasPraza}d</div>
              </div>);
            })}
          </div>
          <div style={{marginTop:14,padding:10,background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.12)",borderRadius:8,fontSize:11,color:"rgba(255,255,255,0.5)"}}>
            💡 IA: {kpis.at>0?`${kpis.at} OS atrasadas — replanejamento sugerido para Score ≥ 8`:"Cronograma saudável. Revisar em 7 dias."}
          </div>
        </div>
      </div>);
    })(),
    hh:(()=>{
      const tP=aponts.reduce((s,a)=>s+a.hhPlan,0),tR=aponts.reduce((s,a)=>s+a.hhReal,0),ef=tP>0?Math.round((tR/tP)*100):0;
      const pF:Record<string,{p:number,r:number}>={};
      aponts.forEach(a=>{if(!pF[a.funcionario])pF[a.funcionario]={p:0,r:0};pF[a.funcionario].p+=a.hhPlan;pF[a.funcionario].r+=a.hhReal;});
      const fD=Object.entries(pF).map(([n,v])=>({nome:n,...v}));
      return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>⏱ Apontamento HH</h2><button onClick={()=>setMType("apontHH")} style={{...btn("linear-gradient(135deg,#8b5cf6,#6d28d9)"),padding:"10px 20px",borderRadius:10}}>+ Registrar</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {[{l:"HH Planejado",v:tP+"h",c:"#3b82f6"},{l:"HH Realizado",v:tR+"h",c:"#10b981"},{l:"Eficiência",v:ef+"%",c:ef>=90?"#10b981":ef>=70?"#f97316":"#ef4444"},{l:"Registros",v:aponts.length,c:"#8b5cf6"}].map((k,i)=>(
            <div key={i} style={{...card(),padding:16}}><div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{k.l}</div><div style={{fontSize:28,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div></div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{...card(),padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📊 HH por Funcionário</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fD}><CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/><XAxis dataKey="nome" stroke={S.muted} tick={{fill:S.muted,fontSize:10}}/><YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/><Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="p" name="Planejado" fill="#3b82f6" radius={[4,4,0,0]}/><Bar dataKey="r" name="Realizado" fill="#10b981" radius={[4,4,0,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{...card(),padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>📋 Histórico</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:220,overflowY:"auto"}}>
              {aponts.map((a,i)=>(<div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,borderRadius:8,padding:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{a.osId}</span><span style={{fontSize:11,color:a.hhReal>a.hhPlan?"#ef4444":"#10b981",fontWeight:700}}>{a.hhReal}h/{a.hhPlan}h</span></div>
                <div style={{fontSize:11,color:S.muted}}>{a.funcionario} · {a.data}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{a.tarefas}</div>
              </div>))}
            </div>
          </div>
        </div>
      </div>);
    })(),
    ativos:(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>🏗 Ativos & Infraestrutura</h2><div style={{fontSize:13,color:S.muted}}>Valor total: <span style={{color:"#10b981",fontWeight:700}}>R$ {(kpis.va/1000).toFixed(0)}k</span></div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
          {ATIVOS.map(a=>{
            const dias=Math.floor((Date.now()-new Date(a.ultimaManut).getTime())/(1000*60*60*24));
            const risco=Math.min(10,(dias/a.mtbf)*10),rClr=risco>=7?"#ef4444":risco>=4?"#f97316":"#10b981";
            return(<div key={a.id} style={{...card({borderColor:risco>=7?"rgba(239,68,68,0.2)":S.border}),padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"#00d4ff",marginBottom:3}}>{a.id}</div><div style={{fontWeight:600,fontSize:13}}>{a.nome}</div><div style={{fontSize:11,color:S.muted,marginTop:2}}>{a.local} · {a.tipo}</div></div>
                <div style={{textAlign:"right"}}><span style={{background:CC[a.criticidade]+"20",color:CC[a.criticidade],padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase",border:`1px solid ${CC[a.criticidade]}40`,display:"block",marginBottom:4}}>{a.criticidade}</span><span style={{fontSize:11,color:a.status==="ativo"?"#10b981":"#f97316"}}>{a.status==="ativo"?"● Ativo":"⚠ Manutenção"}</span></div>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",width:`${Math.min(100,risco*10)}%`,background:`linear-gradient(90deg,${rClr}60,${rClr})`,borderRadius:2}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,fontSize:10}}>
                <div><div style={{color:S.muted,marginBottom:2}}>MTBF</div><div style={{fontWeight:700}}>{a.mtbf}h</div></div>
                <div><div style={{color:S.muted,marginBottom:2}}>Última</div><div style={{fontWeight:700,fontSize:9,fontFamily:"DM Mono,monospace"}}>{a.ultimaManut}</div></div>
                <div><div style={{color:S.muted,marginBottom:2}}>Risco</div><div style={{color:rClr,fontWeight:700}}>{risco.toFixed(1)}/10</div></div>
                <div><div style={{color:S.muted,marginBottom:2}}>Valor</div><div style={{fontWeight:700,fontSize:9}}>R${(a.valor/1000).toFixed(0)}k</div></div>
              </div>
              {dias>a.mtbf&&<div style={{marginTop:8,padding:6,background:"rgba(239,68,68,0.1)",borderRadius:6,fontSize:10,color:"#fca5a5"}}>⚠️ VENCIDA há {dias-a.mtbf} dias!</div>}
            </div>);
          })}
        </div>
      </div>
    ),
    materiais:(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>📦 Controle de Materiais</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {[{l:"Em Estoque",v:MATERIAIS.filter(m=>m.estoque>0).length,c:"#10b981"},{l:"Em Falta",v:MATERIAIS.filter(m=>m.estoque===0).length,c:"#ef4444"},{l:"Abaixo Mínimo",v:MATERIAIS.filter(m=>m.estoque<m.minimo&&m.estoque>0).length,c:"#f97316"},{l:"Pendências",v:MATERIAIS.reduce((s,m)=>s+m.pendencias,0),c:"#eab308"}].map((k,i)=>(
            <div key={i} style={{...card(),padding:16}}><div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{k.l}</div><div style={{fontSize:28,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div></div>
          ))}
        </div>
        <div style={{...card(),overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"rgba(13,20,35,0.8)"}}>{["ID","Nome","Categoria","Estoque","Mínimo","Status","Custo Unit.","Pendências","Fornecedor"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",color:S.muted,textTransform:"uppercase",borderBottom:`1px solid ${S.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{MATERIAIS.map(m=>{
              const st=m.estoque===0?"SEM ESTOQUE":m.estoque<m.minimo?"BAIXO":"OK",mc=st==="SEM ESTOQUE"?"#ef4444":st==="BAIXO"?"#f97316":"#10b981";
              return(<tr key={m.id} style={{borderBottom:`1px solid rgba(99,179,237,0.06)`}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:10,color:"#00d4ff"}}>{m.id}</td>
                <td style={{padding:"10px 14px",fontSize:12}}>{m.nome}</td>
                <td style={{padding:"10px 14px",fontSize:11,color:S.muted}}>{m.cat}</td>
                <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:700,color:mc}}>{m.estoque}</td>
                <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:11,color:S.muted}}>{m.minimo}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:mc+"20",color:mc,border:`1px solid ${mc}40`,padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700}}>{st}</span></td>
                <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:11}}>R$ {m.custo.toFixed(2)}</td>
                <td style={{padding:"10px 14px",color:m.pendencias>0?"#eab308":"#10b981",fontWeight:700,fontFamily:"DM Mono,monospace",fontSize:11}}>{m.pendencias>0?`⚠️ ${m.pendencias}`:"—"}</td>
                <td style={{padding:"10px 14px",fontSize:11,color:S.muted}}>{m.fornecedor}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
    ),
preventivas:(
      <Preventivas onToast={mkToast}/>
    ),
    inteligencia:(
      <Inteligencia
        osData={osD}
        mttr={mttr}
        mtbf={mtbf}
        backlog={bkl}
        kpis={kpis}
        onToast={mkToast}
      />
    ),
    relatorios:(()=>{
      const hhOS=osD.map(o=>({id:o.id.replace("OS-",""),plan:o.hhPlanejado,real:o.hhRealizado}));
      const crit=[{n:"Crítica",v:osList.filter(o=>o.criticidade==="critica").length,f:"#ef4444"},{n:"Alta",v:osList.filter(o=>o.criticidade==="alta").length,f:"#f97316"},{n:"Média",v:osList.filter(o=>o.criticidade==="media").length,f:"#eab308"},{n:"Baixa",v:osList.filter(o=>o.criticidade==="baixa").length,f:"#22c55e"}];
      return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>📈 Relatórios</h2>
          <button onClick={()=>{
            const csv=["RELATÓRIO SIGMA AI",`Gerado: ${new Date().toLocaleString("pt-BR")}`,`Usuário: ${user.nome} (${rL[user.role]})`,"","RESUMO",`OS Abertas,${kpis.ab}`,`HH Planejado,${kpis.hh}h`,`Atrasos,${kpis.at}`,`Aderência,${kpis.adr}%`,"","ORDENS DE SERVIÇO","ID,Descrição,Criticidade,Status,Score,HH Plan,HH Real,Prazo,Responsável",...osD.map(o=>`${o.id},"${o.descricao}",${o.criticidade},${o.status},${o.score},${o.hhPlanejado}h,${o.hhRealizado}h,${o.diasPraza}d,"${o.responsavel}"`)].join("\n");
            const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download=`sigma-ai-${Date.now()}.csv`;a.click();
            mkToast("📊 Relatório exportado!");
          }} style={{...btn("linear-gradient(135deg,#10b981,#059669)"),padding:"10px 20px",borderRadius:10}}>⬇️ Exportar CSV</button>
        </div>
        <div style={{...card({borderColor:"rgba(0,212,255,0.2)"}),padding:20}}>
          <div style={{fontWeight:700,fontSize:14,color:"#00d4ff",marginBottom:16}}>📋 Resumo Executivo</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
            {[{l:"Período",v:"Fev/2025",c:S.text},{l:"OS Gerenciadas",v:osList.length,c:"#00d4ff"},{l:"Taxa Conclusão",v:kpis.co>0?Math.round((kpis.co/osList.length)*100)+"%":"0%",c:"#10b981"},{l:"Economia Estim.",v:"R$ 48.5k",c:"#10b981"},{l:"Ativos Monitor.",v:ATIVOS.length,c:"#f97316"},{l:"Score Médio",v:(osD.reduce((s,o)=>s+o.score,0)/osD.length).toFixed(1),c:"#8b5cf6"}].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:14,border:`1px solid ${S.border}`}}>
                <div style={{fontSize:10,color:S.muted,marginBottom:6,textTransform:"uppercase"}}>{k.l}</div>
                <div style={{fontSize:22,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{...card(),padding:20}}><div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📊 HH Planejado vs Realizado</div>
            <ResponsiveContainer width="100%" height={220}><BarChart data={hhOS.slice(0,7)}><CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/><XAxis dataKey="id" stroke={S.muted} tick={{fill:S.muted,fontSize:10}}/><YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/><Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="plan" name="Planejado" fill="#3b82f6" radius={[4,4,0,0]}/><Bar dataKey="real" name="Realizado" fill="#10b981" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
          </div>
          <div style={{...card(),padding:20}}><div style={{fontWeight:700,fontSize:14,marginBottom:16}}>⚠️ Por Criticidade</div>
            <ResponsiveContainer width="100%" height={220}><BarChart data={crit} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/><XAxis type="number" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/><YAxis dataKey="n" type="category" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/><Tooltip content={<CT/>}/><Bar dataKey="v" name="OS" radius={[0,5,5,0]}>{crit.map((e,i)=><Cell key={i} fill={e.f}/>)}</Bar></BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>);
    })(),
    config:(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>⚙️ Configurações</h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["geral","⚙️ Geral"],["usuarios","👥 Usuários"],["alertas","🔔 Alertas"],["sobre","ℹ️ Sobre"]].map(([id,l])=>(
            <button key={id} onClick={()=>setCfgTab(id)} style={{...btn(cfgTab===id?"rgba(0,212,255,0.12)":"transparent",cfgTab===id?"#00d4ff":S.muted),border:`1px solid ${cfgTab===id?"rgba(0,212,255,0.3)":S.border}`,padding:"8px 18px",borderRadius:8}}>{l}</button>
          ))}
        </div>
        {cfgTab==="geral"&&<div style={{...card(),padding:24,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontWeight:700,fontSize:14}}>Configurações Gerais</div>
          {[["Nome do Sistema","SIGMA AI"],["Versão","6.0.0"],["Empresa","Construtora XYZ LTDA"],["CNPJ","12.345.678/0001-90"]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>{l}</div><input defaultValue={v} style={inp}/></div>
          ))}
          <button onClick={()=>mkToast("✅ Configurações salvas!")} style={{...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),padding:"10px",borderRadius:10}}>Salvar</button>
        </div>}
        {cfgTab==="usuarios"&&<div style={{...card()}}>
          <div style={{padding:"12px 20px",borderBottom:`1px solid ${S.border}`,fontWeight:700,fontSize:13}}>Usuários Cadastrados</div>
          {USERS.map(u=>(
            <div key={u.id} style={{padding:"14px 20px",borderBottom:`1px solid rgba(99,179,237,0.06)`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}><Av u={u} size={40}/><div><div style={{fontWeight:600,fontSize:13}}>{u.nome}</div><div style={{fontSize:11,color:S.muted}}>{u.email} · {u.setor}</div></div></div>
              <span style={{background:rC[u.role]+"20",color:rC[u.role],border:`1px solid ${rC[u.role]}40`,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{rL[u.role]}</span>
            </div>
          ))}
        </div>}
        {cfgTab==="alertas"&&<div style={{...card(),padding:24,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontWeight:700,fontSize:14}}>Regras de Alerta</div>
          {[["Notif. atrasos acima de","1 dia"],["Score Sigma crítico acima de","8.0"],["Estoque abaixo do mínimo","Habilitado"],["E-mail de resumo","Diário 08:00"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{l}</span>
              <span style={{fontSize:12,color:"#00d4ff",fontWeight:600,fontFamily:"DM Mono,monospace"}}>{v}</span>
            </div>
          ))}
        </div>}
        {cfgTab==="sobre"&&<div style={{...card(),padding:24,textAlign:"center"}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#00d4ff,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32,fontFamily:"Syne,sans-serif",fontWeight:800,color:"#fff",boxShadow:"0 0 30px rgba(0,212,255,0.3)"}}>Σ</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800,marginBottom:4}}>SIGMA AI v6.0</div>
          <div style={{color:S.muted,marginBottom:16}}>Sistema Inteligente de Planejamento de Manutenção</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"left"}}>
            {[["Framework","Next.js 14.2"],["Runtime","Node.js 24"],["IA","Score Sigma™"],["Deploy","Vercel Edge"],["GitHub","gbamnt/SIGMA-AI"],["Status","Production Ready"]].map(([l,v])=>(
              <div key={l} style={{padding:10,background:"rgba(255,255,255,0.03)",borderRadius:8,border:`1px solid ${S.border}`}}>
                <div style={{fontSize:10,color:S.muted,marginBottom:3}}>{l}</div>
                <div style={{fontSize:12,fontFamily:"DM Mono,monospace",color:"#00d4ff"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    ),
  };

  // ── MODAL OS ──
  const ModalOS=()=>{
    if(!modal)return null;
    const os=modal;
    const ia=os.diasPraza<0?`🔴 OS ATRASADA ${Math.abs(os.diasPraza)} dias. Replanejamento urgente.`:os.score>=8?`🔴 Score ${os.score}/10 — executar em ${os.diasPraza} dias.`:os.score>=6?`🟠 Score ${os.score}/10 — planejar nos próximos ${os.diasPraza} dias.`:`🟢 Score ${os.score}/10 — situação controlada.`;
    return(<div style={{background:S.surf,borderRadius:20,maxWidth:640,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
      <div style={{padding:24,background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(139,92,246,0.08))",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff",marginBottom:4}}>{os.id}</div><div style={{fontFamily:"Syne,sans-serif",fontSize:18,fontWeight:700,marginBottom:4}}>{os.descricao}</div><div style={{fontSize:12,color:S.muted}}>{os.ativo}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><Ring score={os.score} size={60}/><button onClick={()=>setMType(null)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${S.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",color:S.muted,fontSize:16}}>✕</button></div>
      </div>
      <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],border:`1px solid ${CC[os.criticidade]}40`,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>CRITICIDADE: {os.criticidade}</span>
          <span style={{background:CS[os.status]+"20",color:CS[os.status],border:`1px solid ${CS[os.status]}40`,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700}}>{os.status.toUpperCase()}</span>
          {os.materialBloqueado&&<span style={{background:"rgba(234,179,8,0.12)",color:"#eab308",border:"1px solid rgba(234,179,8,0.25)",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700}}>🔒 MATERIAL BLOQUEADO</span>}
        </div>
        <div style={{padding:16,borderRadius:12,background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)"}}>
          <div style={{fontSize:11,color:"#00d4ff",fontWeight:700,marginBottom:10}}>📊 Score Sigma™ Detalhado</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {Object.entries(os.d).map(([k,v]:any)=>(
              <div key={k} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:8,textAlign:"center"}}><div style={{fontSize:9,color:S.muted,textTransform:"capitalize",marginBottom:3}}>{k}</div><div style={{fontFamily:"DM Mono,monospace",fontSize:16,fontWeight:700,color:"#00d4ff"}}>{v}</div></div>
            ))}
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:4,height:6,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${os.score*10}%`,background:`linear-gradient(90deg,${sc(os.score)}60,${sc(os.score)})`,borderRadius:4}}/></div>
          <p style={{fontSize:12}}>{sl(os.score)} — {os.score>=8?"Executar imediatamente!":os.score>=6?"Planejar com prioridade":"Dentro dos padrões"}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{l:"HH Planejado",v:`${os.hhPlanejado}h`,c:"#8b5cf6"},{l:"HH Realizado",v:`${os.hhRealizado}h`,c:"#10b981"},{l:"Equipe",v:`${os.equipDisponivel}%`,c:os.equipDisponivel<50?"#ef4444":"#10b981"},{l:"Prazo",v:`${os.diasPraza>=0?"+":""}${os.diasPraza}d`,c:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981"},{l:"Responsável",v:os.responsavel,c:"#00d4ff"},{l:"Criado em",v:os.criadoEm,c:S.muted}].map((item,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,border:`1px solid ${S.border}`}}><div style={{fontSize:10,color:S.muted,marginBottom:4}}>{item.l}</div><div style={{fontSize:15,fontWeight:700,color:item.c,fontFamily:"Syne,sans-serif"}}>{item.v}</div></div>
          ))}
        </div>
        {os.obs&&<div style={{padding:10,borderRadius:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,fontSize:12,color:"rgba(255,255,255,0.55)"}}>💬 {os.obs}</div>}
        <div style={{padding:14,borderRadius:10,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
          <div style={{fontSize:10,color:"#a78bfa",fontWeight:700,textTransform:"uppercase",marginBottom:6}}>🤖 Análise SIGMA IA</div>
          <p style={{fontSize:12,lineHeight:1.7,color:"rgba(255,255,255,0.75)"}}>{ia}</p>
        </div>
        {os.diasPraza<0&&<div style={{padding:10,borderRadius:8,background:"rgba(239,68,68,0.08)",borderLeft:"3px solid #ef4444",fontSize:12,color:"#fca5a5"}}><b>🔴 CRÍTICO: OS ATRASADA {Math.abs(os.diasPraza)} dias!</b></div>}
        {os.materialBloqueado&&<div style={{padding:10,borderRadius:8,background:"rgba(234,179,8,0.08)",borderLeft:"3px solid #eab308",fontSize:12,color:"#fde68a"}}>🔒 Materiais bloqueados — acionar fornecedores.</div>}
        {(user.role==="admin"||user.role==="gestor")&&<div style={{display:"flex",gap:8}}>
          <select onChange={e=>{if(e.target.value){updSt(os.id,e.target.value as Status);setMType(null);}}} style={{...inp,flex:1}}>
            <option value="">Alterar status...</option>
            {["aberta","planejada","execucao","concluida","cancelada"].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={()=>{setNAp({...nAp,osId:os.id});setMType("apontHH");}} style={{...btn("rgba(139,92,246,0.15)","#a78bfa"),border:"1px solid rgba(139,92,246,0.3)",whiteSpace:"nowrap"}}>+ HH</button>
        </div>}
      </div>
    </div>);
  };

  const ModalNovaOS=()=>(
    <div style={{background:S.surf,borderRadius:20,maxWidth:560,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
      <div style={{padding:24,borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18}}>+ Nova Ordem de Serviço</div><button onClick={()=>setMType(null)} style={{background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:20}}>✕</button></div>
      <div style={{padding:24,display:"flex",flexDirection:"column",gap:12}}>
        {[{l:"Descrição *",k:"descricao",ph:"Ex: Manutenção bomba HVAC"},{l:"Ativo/Local *",k:"ativo",ph:"Ex: HVAC Zona 2"},{l:"Responsável *",k:"responsavel",ph:"Nome"},{l:"Data Prevista *",k:"dataPrevista",type:"date"},{l:"Observações",k:"obs",ph:"Notas..."}].map((f,i)=>(
          <div key={i}><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>{f.l}</div><input type={f.type||"text"} value={(nOS as any)[f.k]||""} onChange={e=>setNOS(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{l:"Criticidade",k:"criticidade",opts:["critica","alta","media","baixa"]},{l:"HH Planejado",k:"hhPlanejado",tp:"number"},{l:"Prioridade (0-10)",k:"prioridade",tp:"number"},{l:"Risco (0-10)",k:"risco",tp:"number"},{l:"Urgência (0-10)",k:"urgencia",tp:"number"},{l:"Impacto (0-10)",k:"impacto",tp:"number"}].map((f,i)=>(
            <div key={i}><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
            {(f as any).opts?<select value={(nOS as any)[f.k]} onChange={e=>setNOS(p=>({...p,[f.k]:e.target.value}))} style={inp}>{(f as any).opts.map((o:string)=><option key={o} value={o}>{o}</option>)}</select>:
            <input type="number" min="0" max="10" value={(nOS as any)[f.k]} onChange={e=>setNOS(p=>({...p,[f.k]:+e.target.value}))} style={inp}/>}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={()=>setMType(null)} style={{flex:1,...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.5)"),border:`1px solid ${S.border}`}}>Cancelar</button>
          <button onClick={crOS} style={{flex:2,...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),boxShadow:"0 0 20px rgba(0,212,255,0.2)"}}>✅ Criar OS</button>
        </div>
      </div>
    </div>
  );

  const ModalApt=()=>(
    <div style={{background:S.surf,borderRadius:20,maxWidth:480,width:"100%",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
      <div style={{padding:24,borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18}}>⏱ Apontamento HH</div><button onClick={()=>setMType(null)} style={{background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:20}}>✕</button></div>
      <div style={{padding:24,display:"flex",flexDirection:"column",gap:12}}>
        <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>OS *</div><select value={nAp.osId||""} onChange={e=>setNAp(p=>({...p,osId:e.target.value}))} style={inp}><option value="">Selecionar OS...</option>{osList.map(o=><option key={o.id} value={o.id}>{o.id} — {o.descricao.substring(0,30)}</option>)}</select></div>
        <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Funcionário *</div><input value={nAp.funcionario||""} onChange={e=>setNAp(p=>({...p,funcionario:e.target.value}))} placeholder="Nome" style={inp}/></div>
        <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Data *</div><input type="date" value={nAp.data||""} onChange={e=>setNAp(p=>({...p,data:e.target.value}))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>HH Planejado</div><input type="number" step="0.5" value={nAp.hhPlan} onChange={e=>setNAp(p=>({...p,hhPlan:+e.target.value}))} style={inp}/></div>
          <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>HH Realizado</div><input type="number" step="0.5" value={nAp.hhReal} onChange={e=>setNAp(p=>({...p,hhReal:+e.target.value}))} style={inp}/></div>
        </div>
        <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Tarefas Realizadas</div><input value={nAp.tarefas||""} onChange={e=>setNAp(p=>({...p,tarefas:e.target.value}))} placeholder="Descreva as tarefas..." style={inp}/></div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={()=>setMType(null)} style={{flex:1,...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.5)"),border:`1px solid ${S.border}`}}>Cancelar</button>
          <button onClick={salApt} style={{flex:2,...btn("linear-gradient(135deg,#8b5cf6,#6d28d9)")}}>✅ Registrar</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",minHeight:"100vh",background:S.bg,color:S.text,fontFamily:"DM Sans,sans-serif"}}>
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:13,background:"rgba(13,20,35,0.96)",border:`1px solid ${toast.t==="success"?"rgba(16,185,129,0.4)":"rgba(234,179,8,0.4)"}`,color:toast.t==="success"?"#10b981":"#eab308",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",backdropFilter:"blur(12px)"}}>{toast.m}</div>}

      {/* SIDEBAR */}
      <div style={{width:side?220:56,background:"rgba(13,20,35,0.98)",borderRight:`1px solid ${S.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s ease",flexShrink:0,position:"sticky",top:0,height:"100vh",zIndex:30,overflow:"hidden"}}>
        <div style={{padding:"14px 10px",borderBottom:`1px solid ${S.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00d4ff,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"#fff",flexShrink:0,boxShadow:"0 0 14px rgba(0,212,255,0.3)"}}>Σ</div>
          {side&&<div><div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14}}>SIGMA AI</div><div style={{fontSize:9,color:S.muted,letterSpacing:"0.06em"}}>MANUTENÇÃO</div></div>}
        </div>
        <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
          {NAV.map((n:any)=>(
            <button key={n.id} onClick={()=>setMod(n.id as Mod)} title={n.l} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:7,border:"none",cursor:"pointer",marginBottom:1,background:mod===n.id?"rgba(0,212,255,0.12)":"transparent",color:mod===n.id?"#00d4ff":S.muted,outline:mod===n.id?"1px solid rgba(0,212,255,0.2)":"none",fontSize:12,fontWeight:mod===n.id?600:400,transition:"all 0.15s",fontFamily:"DM Sans,sans-serif",textAlign:"left"}}>
              <span style={{fontSize:15,flexShrink:0,width:20,textAlign:"center"}}>{n.i}</span>
              {side&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.l}</span>}
              {side&&n.id==="ia"&&<span style={{marginLeft:"auto",background:"rgba(0,212,255,0.15)",color:"#00d4ff",fontSize:9,padding:"1px 5px",borderRadius:4,fontWeight:700}}>AI</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"8px 6px",borderTop:`1px solid ${S.border}`}}>
          {side&&<div style={{marginBottom:8,padding:"8px 10px",background:"rgba(16,185,129,0.08)",borderRadius:7,display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:"#10b981"}}/><span style={{fontSize:10,color:"#10b981",fontWeight:600}}>Online</span></div>}
          <button onClick={()=>setSide(!side)} style={{width:"100%",padding:"7px",borderRadius:7,border:`1px solid ${S.border}`,background:"transparent",color:S.muted,cursor:"pointer",fontSize:11,fontFamily:"DM Sans,sans-serif"}}>{side?"◀":"▶"}</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* TOPBAR */}
        <div style={{background:"rgba(13,20,35,0.95)",borderBottom:`1px solid ${S.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:20,gap:12}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,whiteSpace:"nowrap"}}>{NAV.find((n:any)=>n.id===mod)?.i} {NAV.find((n:any)=>n.id===mod)?.l}</div>
          <div style={{flex:1,maxWidth:380,position:"relative"}}>
            <input value={gs} onChange={e=>setGs(e.target.value)} onFocus={()=>setShowGs(true)} onBlur={()=>setTimeout(()=>setShowGs(false),200)} placeholder="⌕  Buscar OS, ativos, materiais..." style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"6px 12px",fontFamily:"DM Sans,sans-serif",fontSize:12,outline:"none",width:"100%"}}/>
            {showGs&&gsR.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:S.surf2,border:`1px solid ${S.border}`,borderRadius:10,marginTop:4,boxShadow:"0 16px 40px rgba(0,0,0,0.4)",zIndex:100}}>
              {gsR.map((r:any,i:number)=>(
                <div key={i} style={{padding:"10px 14px",display:"flex",gap:10,alignItems:"center",cursor:"pointer",borderBottom:`1px solid rgba(99,179,237,0.06)`}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.05)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:"rgba(0,212,255,0.12)",color:"#00d4ff",fontWeight:700,flexShrink:0}}>{r.tp}</span>
                  <div style={{minWidth:0}}><div style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.ds}</div><div style={{fontSize:10,color:S.muted}}>{r.id} · {r.ex}</div></div>
                </div>
              ))}
            </div>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <div style={{position:"relative"}}>
              <button onClick={()=>{setShowN(!showN);setShowP(false);}} style={{position:"relative",background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:8,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                🔔{nL>0&&<span style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#ef4444",fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${S.bg}`}}>{nL}</span>}
              </button>
              {showN&&<div style={{position:"absolute",top:"100%",right:0,width:320,background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,marginTop:8,boxShadow:"0 20px 50px rgba(0,0,0,0.5)",zIndex:100,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:700,fontSize:13}}>Notificações</span>
                  <button onClick={()=>setNotifs(p=>p.map(n=>({...n,lida:true})))} style={{background:"none",border:"none",cursor:"pointer",color:"#00d4ff",fontSize:11}}>Marcar lidas</button>
                </div>
                <div style={{maxHeight:320,overflowY:"auto"}}>
                  {notifs.slice(0,8).map(n=>(
                    <div key={n.id} style={{padding:"10px 14px",borderBottom:`1px solid rgba(99,179,237,0.06)`,display:"flex",gap:10,cursor:"pointer",background:n.lida?"":"rgba(0,212,255,0.02)"}} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,lida:true}:x))}>
                      <span style={{fontSize:16,flexShrink:0}}>{n.tipo==="alerta"?"⚠️":n.tipo==="sucesso"?"✅":n.tipo==="erro"?"🔴":"ℹ️"}</span>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:n.lida?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.titulo}</div><div style={{fontSize:11,color:S.muted}}>{n.msg}</div></div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><span style={{fontSize:10,color:S.muted}}>{n.tempo}</span>{!n.lida&&<div style={{width:6,height:6,borderRadius:"50%",background:"#00d4ff"}}/>}</div>
                    </div>
                  ))}
                </div>
              </div>}
            </div>
            <div style={{position:"relative"}}>
              <button onClick={()=>{setShowP(!showP);setShowN(false);}} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
                <Av u={user} size={28}/>{side&&<div style={{textAlign:"left"}}><div style={{fontSize:11,fontWeight:600,color:S.text,whiteSpace:"nowrap"}}>{user.nome.split(" ")[0]}</div><div style={{fontSize:9,color:rC[user.role]}}>{rL[user.role]}</div></div>}
              </button>
              {showP&&<div style={{position:"absolute",top:"100%",right:0,width:220,background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,marginTop:8,boxShadow:"0 20px 50px rgba(0,0,0,0.5)",zIndex:100,overflow:"hidden"}}>
                <div style={{padding:"16px",borderBottom:`1px solid ${S.border}`,display:"flex",gap:10,alignItems:"center"}}><Av u={user} size={44}/><div><div style={{fontWeight:700,fontSize:13}}>{user.nome}</div><div style={{fontSize:11,color:S.muted}}>{user.email}</div><span style={{fontSize:9,background:rC[user.role]+"20",color:rC[user.role],padding:"2px 8px",borderRadius:20,fontWeight:700,marginTop:4,display:"inline-block"}}>{rL[user.role]}</span></div></div>
                <div style={{padding:"8px"}}>
                  {user.role==="admin"&&<button onClick={()=>{setMod("config");setShowP(false);}} style={{width:"100%",padding:"9px 12px",borderRadius:7,border:"none",background:"transparent",color:S.text,cursor:"pointer",fontSize:12,textAlign:"left",fontFamily:"DM Sans,sans-serif"}}>⚙️ Configurações</button>}
                  <button onClick={()=>setUser(null)} style={{width:"100%",padding:"9px 12px",borderRadius:7,border:"none",background:"rgba(239,68,68,0.08)",color:"#f87171",cursor:"pointer",fontSize:12,textAlign:"left",fontFamily:"DM Sans,sans-serif",fontWeight:600}}>🚪 Sair</button>
                </div>
              </div>}
            </div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:20}}>{CONTENT[mod]||CONTENT["dashboard"]}</div>
      </div>

      {mType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16,backdropFilter:"blur(6px)"}} onClick={()=>setMType(null)}>
        <div onClick={e=>e.stopPropagation()}>
          {mType==="os"&&<ModalOS/>}
          {mType==="novaOS"&&<ModalNovaOS/>}
          {mType==="apontHH"&&<ModalApt/>}
        </div>
      </div>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{scrollbar-width:thin;scrollbar-color:rgba(99,179,237,0.2) transparent;} *::-webkit-scrollbar{width:5px;height:5px;} *::-webkit-scrollbar-thumb{background:rgba(99,179,237,0.2);border-radius:3px;}`}</style>
    </div>
  );
}