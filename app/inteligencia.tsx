"use client";
import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell
} from "recharts";
import AssistenteIA from "./assistente-ia";

const S = {surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b"};
const sc = (s:number) => s>=8?"#ef4444":s>=6?"#f97316":s>=4?"#eab308":"#10b981";
const card = (e?:any) => ({background:"#0d1423",border:"1px solid rgba(99,179,237,0.12)",borderRadius:14,...e});

interface OSItem {
  id:string; descricao:string; criticidade:string; status:string;
  score:number; diasPraza:number; hhPlanejado:number; hhRealizado:number;
  responsavel:string; materialBloqueado:boolean;
}
interface Props {
  osData: OSItem[];
  mttr: number;
  mtbf: number;
  backlog: number;
  kpis: any;
  onToast: (m:string) => void;
}

const CT = ({active,payload,label}:any) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:S.surf2,border:`1px solid ${S.border}`,borderRadius:8,padding:"10px 14px",fontSize:12,fontFamily:"DM Mono,monospace"}}>
      <p style={{color:S.muted,marginBottom:4}}>{label}</p>
      {payload.map((p:any,i:number)=>(
        <p key={i} style={{color:p.color||"#00d4ff"}}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

export default function Inteligencia({ osData, mttr, mtbf, backlog, kpis, onToast }: Props) {
  const [tab, setTab] = useState<"analise"|"graficos"|"chat">("analise");

  const conflitos: any[] = [];
  osData.forEach(o => {
    if(o.materialBloqueado && o.status!=="concluida")
      conflitos.push({sev:"alta",tp:"Material Bloqueado",msg:`${o.id}: materiais pendentes`,rec:"Acionar fornecedores."});
    if(o.diasPraza<0 && !["concluida","cancelada"].includes(o.status))
      conflitos.push({sev:"critica",tp:"OS Atrasada",msg:`${o.id}: ${Math.abs(o.diasPraza)}d de atraso`,rec:"Replanejamento urgente."});
    if(o.criticidade==="critica" && o.diasPraza<=5 && o.diasPraza>=0)
      conflitos.push({sev:"critica",tp:"Risco Alto",msg:`${o.id}: prazo crítico em ${o.diasPraza}d`,rec:"Executar HOJE."});
  });

  const scoreMedia = osData.length>0
    ? (osData.reduce((s,o)=>s+o.score,0)/osData.length).toFixed(1)
    : "0";

  const radarData = [
    {s:"MTTR",    A:Math.min(10,(10-mttr)*1.2)},
    {s:"MTBF",    A:Math.min(10,mtbf/30)},
    {s:"Aderência",A:(kpis?.adr||kpis?.aderencia||0)/10},
    {s:"Pontualidade",A:Math.max(0,10-(kpis?.at||kpis?.atrasos||0)*2)},
    {s:"Score",   A:parseFloat(scoreMedia)},
  ];

  const scoreBar = [...osData]
    .sort((a,b)=>b.score-a.score)
    .map(o=>({id:o.id.replace("OS-",""),score:o.score}));

  const tendencia = [
    {m:"Out",ab:14,co:9,at:3},
    {m:"Nov",ab:18,co:11,at:5},
    {m:"Dez",ab:12,co:14,at:2},
    {m:"Jan",ab:16,co:10,at:4},
  ];

  const burndown = [
    {d:"Seg",ideal:40,real:40},
    {d:"Ter",ideal:33,real:36},
    {d:"Qua",ideal:26,real:29},
    {d:"Qui",ideal:19,real:22},
    {d:"Sex",ideal:12,real:18},
    {d:"Sáb",ideal:5,real:12},
  ];

  const cargaDia = [
    {d:"Seg",c:18},{d:"Ter",c:32},{d:"Qua",c:28},
    {d:"Qui",c:40},{d:"Sex",c:22},{d:"Sáb",c:12},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Header */}
      <div>
        <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:"#e2e8f0"}}>🧠 Inteligência Operacional</h2>
        <p style={{fontSize:12,color:S.muted,marginTop:2}}>Score Sigma™ · Análise de Conflitos · Gráficos · Assistente IA</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {([
          ["analise","📊 Análise & KPIs"],
          ["graficos","📈 Gráficos de Planejamento"],
          ["chat","🤖 Chat com SIGMA IA"],
        ] as [typeof tab, string][]).map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            background:tab===id?"rgba(0,212,255,0.12)":"rgba(255,255,255,0.03)",
            border:`1px solid ${tab===id?"rgba(0,212,255,0.35)":S.border}`,
            color:tab===id?"#00d4ff":S.muted,
            borderRadius:8,padding:"9px 20px",cursor:"pointer",
            fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:tab===id?600:400,
          }}>{l}</button>
        ))}
      </div>

      {/* ── ANÁLISE & KPIs ── */}
      {tab==="analise" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Métricas principais */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12}}>
            {[
              {l:"MTTR",sub:"Tempo Médio Reparo",v:mttr,u:"dias",ok:mttr<5,c:"#3b82f6"},
              {l:"MTBF",sub:"Tempo Entre Falhas",v:mtbf,u:"dias",ok:mtbf>20,c:"#10b981"},
              {l:"Backlog",sub:"Trabalho Pendente",v:backlog,u:"d equiv.",ok:backlog<15,c:"#f97316"},
              {l:"Score Médio",sub:"Das OS abertas",v:scoreMedia,u:"/10",ok:true,c:"#8b5cf6"},
              {l:"Conflitos",sub:"Detectados agora",v:conflitos.length,u:"",ok:conflitos.length===0,c:conflitos.length>0?"#ef4444":"#10b981"},
            ].map((m,i)=>(
              <div key={i} style={{...card(),padding:18}}>
                <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{m.l}</div>
                <div style={{fontSize:11,color:S.muted,marginBottom:8}}>{m.sub}</div>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:m.c,letterSpacing:"-0.02em"}}>
                  {m.v}<span style={{fontSize:12,fontWeight:400,marginLeft:3}}>{m.u}</span>
                </div>
                <div style={{fontSize:11,marginTop:6,color:m.ok?"#10b981":"#f97316"}}>{m.ok?"✅ Saudável":"⚠️ Atenção"}</div>
              </div>
            ))}
          </div>

          {/* Radar + Score Bar */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{...card(),padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#e2e8f0"}}>🕸 Radar de Saúde Operacional</div>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(99,179,237,0.1)"/>
                  <PolarAngleAxis dataKey="s" tick={{fill:S.muted,fontSize:11}}/>
                  <Radar name="Operação" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2}/>
                  <Tooltip content={<CT/>}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{...card(),padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#e2e8f0"}}>📊 Score Sigma™ por OS</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scoreBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="id" stroke={S.muted} tick={{fill:S.muted,fontSize:10}}/>
                  <YAxis domain={[0,10]} stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <Tooltip content={<CT/>}/>
                  <Bar dataKey="score" name="Score" radius={[5,5,0,0]}>
                    {scoreBar.map((o,i)=><Cell key={i} fill={sc(o.score)}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conflitos + Recomendações */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{...card({borderColor:"rgba(239,68,68,0.2)"}),padding:20}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:14,color:"#fca5a5"}}>
                🚨 Conflitos Detectados ({conflitos.length})
              </div>
              {conflitos.length===0 ? (
                <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:14,fontSize:12,color:"#10b981"}}>
                  ✅ Nenhum conflito detectado! Cronograma saudável.
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {conflitos.map((c,i)=>(
                    <div key={i} style={{padding:10,borderRadius:8,background:c.sev==="critica"?"rgba(239,68,68,0.07)":"rgba(249,115,22,0.07)",borderLeft:`3px solid ${c.sev==="critica"?"#ef4444":"#f97316"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,fontWeight:700,color:c.sev==="critica"?"#ef4444":"#f97316"}}>{c.tp}</span>
                        <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,fontWeight:700,background:c.sev==="critica"?"rgba(239,68,68,0.15)":"rgba(249,115,22,0.15)",color:c.sev==="critica"?"#ef4444":"#f97316"}}>{c.sev.toUpperCase()}</span>
                      </div>
                      <p style={{fontSize:11,color:S.muted,marginBottom:2}}>{c.msg}</p>
                      <p style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>💡 {c.rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{...card({borderColor:"rgba(234,179,8,0.2)"}),padding:20}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:14,color:"#fde68a"}}>💡 Recomendações Automáticas</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {t:"🔴 Prioridade Máxima",d:`${osData[0]?.id||"—"}: score mais alto`,a:"Iniciar imediatamente.",imp:"alta"},
                  {t:"⚠️ Resolver Conflitos",d:`${conflitos.filter(c=>c.sev==="critica").length} crítico(s) aguardando`,a:"Ver seção de conflitos.",imp:"alta"},
                  {t:"🔧 Materiais Bloqueados",d:`${osData.filter(o=>o.materialBloqueado).length} OS bloqueadas`,a:"Acionar fornecedores hoje.",imp:"alta"},
                  {t:"📈 Aumentar Preventiva",d:"Meta: 70% preventiva",a:"Criar mais OS preventivas.",imp:"media"},
                  {t:"👥 Avaliar Capacidade",d:`Backlog: ${backlog}d equivalente`,a:"Considerar reforço de equipe.",imp:"media"},
                ].map((r,i)=>(
                  <div key={i} style={{padding:10,borderRadius:8,background:r.imp==="alta"?"rgba(239,68,68,0.06)":"rgba(234,179,8,0.06)",borderLeft:`3px solid ${r.imp==="alta"?"#ef4444":"#eab308"}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#e2e8f0"}}>{r.t}</span>
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,fontWeight:700,background:r.imp==="alta"?"rgba(239,68,68,0.15)":"rgba(234,179,8,0.15)",color:r.imp==="alta"?"#ef4444":"#eab308"}}>{r.imp.toUpperCase()}</span>
                    </div>
                    <p style={{fontSize:11,color:S.muted,marginBottom:2}}>{r.d}</p>
                    <p style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>✓ {r.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GRÁFICOS DE PLANEJAMENTO ── */}
      {tab==="graficos" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {/* Curva S */}
            <div style={{...card(),padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#e2e8f0"}}>📈 Curva S — Planejado vs Realizado</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={[{s:"S1",p:10,r:8},{s:"S2",p:22,r:19},{s:"S3",p:38,r:33},{s:"S4",p:56,r:48},{s:"S5",p:72,r:64},{s:"S6",p:88,r:80}]}>
                  <defs>
                    <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="s" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="p" name="Planejado" stroke="#3b82f6" fill="url(#gP)" strokeWidth={2}/>
                  <Area type="monotone" dataKey="r" name="Realizado" stroke="#00d4ff" fill="url(#gR)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Tendência Mensal */}
            <div style={{...card(),padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#e2e8f0"}}>📊 Tendência Mensal de OS</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={tendencia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="m" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <Tooltip content={<CT/>}/>
                  <Line type="monotone" dataKey="ab" name="Abertas" stroke="#ef4444" strokeWidth={2} dot={{r:4,fill:"#ef4444"}}/>
                  <Line type="monotone" dataKey="co" name="Concluídas" stroke="#10b981" strokeWidth={2} dot={{r:4,fill:"#10b981"}}/>
                  <Line type="monotone" dataKey="at" name="Atrasos" stroke="#f97316" strokeWidth={2} dot={{r:4,fill:"#f97316"}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Burndown */}
            <div style={{...card(),padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:"#e2e8f0"}}>🔥 Burndown Semanal</div>
              <div style={{fontSize:11,color:S.muted,marginBottom:14}}>OS restantes por dia — Ideal vs Real</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={burndown}>
                  <defs>
                    <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gRe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="d" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <Tooltip content={<CT/>}/>
                  <Area type="monotone" dataKey="ideal" name="Ideal" stroke="#10b981" fill="url(#gI)" strokeWidth={2} strokeDasharray="6 3"/>
                  <Area type="monotone" dataKey="real" name="Real" stroke="#ef4444" fill="url(#gRe)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Carga por dia */}
            <div style={{...card(),padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:"#e2e8f0"}}>📅 Carga de Trabalho por Dia</div>
              <div style={{fontSize:11,color:S.muted,marginBottom:14}}>HH alocados × capacidade total da equipe</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cargaDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                  <XAxis dataKey="d" stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                  <Tooltip content={<CT/>}/>
                  <Bar dataKey="c" name="HH Alocados" radius={[6,6,0,0]}>
                    {cargaDia.map((v,i)=>(
                      <Cell key={i} fill={v.c>=36?"#ef4444":v.c>=28?"#f97316":"#10b981"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:14,marginTop:10,fontSize:11,color:S.muted}}>
                <span>🟢 Normal (&lt;28h)</span>
                <span>🟠 Médio (28-36h)</span>
                <span>🔴 Sobrecarga (&gt;36h)</span>
              </div>
            </div>
          </div>

          {/* HH Planejado vs Realizado */}
          <div style={{...card(),padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#e2e8f0"}}>⏱ HH Planejado vs Realizado por OS</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={osData.slice(0,8).map(o=>({id:o.id.replace("OS-",""),plan:o.hhPlanejado,real:o.hhRealizado}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)"/>
                <XAxis dataKey="id" stroke={S.muted} tick={{fill:S.muted,fontSize:10}}/>
                <YAxis stroke={S.muted} tick={{fill:S.muted,fontSize:11}}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="plan" name="Planejado" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="real" name="Realizado" fill="#10b981" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── CHAT IA ── */}
      {tab==="chat" && <AssistenteIA onToast={onToast}/>}
    </div>
  );
}