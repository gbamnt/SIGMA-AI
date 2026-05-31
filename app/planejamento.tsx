"use client";
import { useState, useMemo } from "react";

type Crit = "critica"|"alta"|"media"|"baixa";
type Status = "aberta"|"planejada"|"execucao"|"concluida"|"cancelada";

interface OS {
  id: string; descricao: string; ativo: string; criticidade: Crit; status: Status;
  hhPlanejado: number; responsavel: string; diasPraza: number; score: number;
}
interface Alocacao {
  id: string; osId: string; funcionarios: string[]; dia: number; // 0=Seg..5=Sáb
  horaInicio: number; duracao: number; semana: string; // "YYYY-Www"
  cor: string;
}

const CORES = ["#3b82f6","#8b5cf6","#10b981","#f97316","#ef4444","#06b6d4","#ec4899","#eab308"];
const FUNCIONARIOS = ["João Silva","Maria Costa","Pedro Lima","Ana Souza","Carlos Neto","Beatriz Melo","Fernando Dias","Roberto Alves"];
const HORAS = Array.from({length:11},(_,i)=>i+7); // 7h~17h
const DIAS_LABEL = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const DIAS_SHORT = ["Seg","Ter","Qua","Qui","Sex","Sáb"];

const CC: Record<string,string> = {critica:"#ef4444",alta:"#f97316",media:"#eab308",baixa:"#22c55e"};
const S = {bg:"#080c14",surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b"};

// Semana ISO: retorna "YYYY-Www"
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
}

// Retorna data de segunda-feira da semana ISO
function getMondayOfISOWeek(isoWeek: string): Date {
  const [year, week] = isoWeek.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  return monday;
}

function addWeeks(isoWeek: string, n: number): string {
  const monday = getMondayOfISOWeek(isoWeek);
  monday.setDate(monday.getDate() + n * 7);
  return getISOWeek(monday);
}

function getWeeksOfMonth(year: number, month: number): string[] {
  const weeks: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    const w = getISOWeek(d);
    if (!weeks.includes(w)) weeks.push(w);
    d.setDate(d.getDate() + 7);
  }
  return weeks;
}

function formatWeekLabel(isoWeek: string): string {
  const monday = getMondayOfISOWeek(isoWeek);
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  return `${fmt(monday)} – ${fmt(saturday)}`;
}

function getDayDate(isoWeek: string, dayIdx: number): Date {
  const monday = getMondayOfISOWeek(isoWeek);
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIdx);
  return d;
}

interface Props {
  osList: OS[];
  onUpdateStatus: (id: string, status: Status) => void;
  onToast: (msg: string) => void;
}

export default function Planejamento({ osList, onUpdateStatus, onToast }: Props) {
  const today = new Date();
  const [semana, setSemana] = useState<string>(getISOWeek(today));
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hoveredAloc, setHoveredAloc] = useState<string|null>(null);
  const [form, setForm] = useState({
    osId: "", funcionarios: [] as string[], dia: 0,
    horaInicio: 8, duracao: 2,
  });
  const [colorIdx, setColorIdx] = useState(0);

  // Navegação semana
  const [viewMonth, setViewMonth] = useState<{year:number;month:number}>({year:today.getFullYear(),month:today.getMonth()});
  const weeksOfMonth = getWeeksOfMonth(viewMonth.year, viewMonth.month);
  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const osAbertas = osList.filter(o => ["aberta","planejada"].includes(o.status));
  const alocSemana = alocacoes.filter(a => a.semana === semana);

  const inp = {background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 10px",fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",width:"100%"};
  const btn = (bg:string,c="#fff") => ({background:bg,border:"none",color:c,borderRadius:8,padding:"8px 14px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"});

  function toggleFuncionario(nome: string) {
    setForm(p => ({
      ...p,
      funcionarios: p.funcionarios.includes(nome)
        ? p.funcionarios.filter(f => f !== nome)
        : [...p.funcionarios, nome]
    }));
  }

  function alocar() {
    if (!form.osId) { onToast("⚠️ Selecione uma OS!"); return; }
    if (form.funcionarios.length === 0) { onToast("⚠️ Selecione ao menos um funcionário!"); return; }

    const conflito = alocacoes.find(a =>
      a.semana === semana && a.dia === form.dia &&
      form.funcionarios.some(f => a.funcionarios.includes(f)) &&
      !(form.horaInicio >= a.horaInicio + a.duracao || form.horaInicio + form.duracao <= a.horaInicio)
    );
    if (conflito) {
      onToast(`⚠️ Conflito de horário com ${conflito.osId}!`);
      return;
    }

    const nova: Alocacao = {
      id: `aloc-${Date.now()}`,
      osId: form.osId, funcionarios: form.funcionarios,
      dia: form.dia, horaInicio: form.horaInicio,
      duracao: form.duracao, semana,
      cor: CORES[colorIdx % CORES.length],
    };
    setAlocacoes(p => [...p, nova]);
    setColorIdx(c => c + 1);
    onUpdateStatus(form.osId, "planejada");
    setShowForm(false);
    setForm({osId:"",funcionarios:[],dia:0,horaInicio:8,duracao:2});
    onToast(`✅ ${form.osId} planejada para ${DIAS_SHORT[form.dia]} às ${form.horaInicio}h!`);
  }

  function removerAlocacao(id: string) {
    const aloc = alocacoes.find(a => a.id === id);
    if (aloc) {
      const outras = alocacoes.filter(a => a.id !== id && a.osId === aloc.osId);
      if (outras.length === 0) onUpdateStatus(aloc.osId, "aberta");
    }
    setAlocacoes(p => p.filter(a => a.id !== id));
    onToast("🗑 Alocação removida");
  }

  // Agrupamento por funcionário para o Gantt
  const funcComAlocacao = useMemo(() => {
    const set = new Set<string>();
    alocSemana.forEach(a => a.funcionarios.forEach(f => set.add(f)));
    return Array.from(set);
  }, [alocSemana]);

  const HORA_W = 72; // px por hora
  const HEADER_H = 40;
  const ROW_H = 44;
  const COL_W = HORA_W;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:S.text}}>📅 Planejamento Semanal</h2>
          <p style={{fontSize:12,color:S.muted,marginTop:2}}>Arraste e aloque OS nos turnos disponíveis</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{...btn("linear-gradient(135deg,#00d4ff,#3b82f6)"),padding:"10px 22px",borderRadius:12,boxShadow:"0 0 20px rgba(0,212,255,0.25)",fontSize:14}}>
          + Alocar OS
        </button>
      </div>

      {/* NAVEGAÇÃO SEMANA */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,padding:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          {/* Mês/Ano */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setViewMonth(p=>{const d=new Date(p.year,p.month-1);return{year:d.getFullYear(),month:d.getMonth()};})} style={{...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.7)"),padding:"6px 12px",border:`1px solid ${S.border}`}}>‹</button>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,color:S.text,minWidth:140,textAlign:"center"}}>
              {MONTHS[viewMonth.month]} {viewMonth.year}
            </div>
            <button onClick={()=>setViewMonth(p=>{const d=new Date(p.year,p.month+1);return{year:d.getFullYear(),month:d.getMonth()};})} style={{...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.7)"),padding:"6px 12px",border:`1px solid ${S.border}`}}>›</button>
          </div>

          {/* Semanas do mês */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {weeksOfMonth.map(w => {
              const isActive = w === semana;
              const isToday = w === getISOWeek(today);
              return (
                <button key={w} onClick={()=>setSemana(w)} style={{
                  background: isActive?"linear-gradient(135deg,#00d4ff30,#3b82f630)":"rgba(255,255,255,0.03)",
                  border: isActive?"1px solid rgba(0,212,255,0.4)":`1px solid ${S.border}`,
                  color: isActive?"#00d4ff":S.muted,
                  borderRadius:8, padding:"6px 14px", cursor:"pointer",
                  fontFamily:"DM Sans,sans-serif", fontSize:12, fontWeight:isActive?700:400,
                  position:"relative",
                }}>
                  {isToday && <span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#10b981",border:`2px solid ${S.bg}`}}/>}
                  {formatWeekLabel(w)}
                </button>
              );
            })}
          </div>

          {/* Pular semana */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setSemana(s=>addWeeks(s,-1))} style={{...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.7)"),padding:"6px 12px",border:`1px solid ${S.border}`}}>← Sem. ant.</button>
            <button onClick={()=>{const w=getISOWeek(today);setSemana(w);setViewMonth({year:today.getFullYear(),month:today.getMonth()});}} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),padding:"6px 12px",border:"1px solid rgba(0,212,255,0.25)"}}>Hoje</button>
            <button onClick={()=>setSemana(s=>addWeeks(s,1))} style={{...btn("rgba(255,255,255,0.06)","rgba(255,255,255,0.7)"),padding:"6px 12px",border:`1px solid ${S.border}`}}>Próx. sem. →</button>
          </div>
        </div>

        {/* Semana atual exibida */}
        <div style={{marginTop:12,fontSize:12,color:"#00d4ff",fontFamily:"DM Mono,monospace",display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#00d4ff",display:"inline-block"}}/>
          Semana {semana.split('-W')[1]} / {semana.split('-W')[0]} — {formatWeekLabel(semana)}
          <span style={{marginLeft:8,color:S.muted,fontSize:11}}>{alocSemana.length} alocação(ões)</span>
        </div>
      </div>

      {/* GANTT */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:14}}>📊 Gantt Semanal — {formatWeekLabel(semana)}</span>
          <div style={{display:"flex",gap:12,fontSize:11,color:S.muted}}>
            {CORES.slice(0,5).map((c,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:c,display:"inline-block"}}/></span>)}
            <span>= OS alocadas</span>
          </div>
        </div>

        {alocSemana.length === 0 ? (
          <div style={{padding:40,textAlign:"center",color:S.muted}}>
            <div style={{fontSize:40,marginBottom:12}}>📅</div>
            <p style={{fontSize:14,fontWeight:600,marginBottom:6}}>Nenhuma OS planejada para esta semana</p>
            <p style={{fontSize:12}}>Clique em "+ Alocar OS" para começar o planejamento</p>
          </div>
        ) : (
          <div style={{overflowX:"auto",padding:20}}>
            {/* Timeline por funcionário */}
            {funcComAlocacao.map(func => {
              const alocs = alocSemana.filter(a => a.funcionarios.includes(func));
              return (
                <div key={func} style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#00d4ff",marginBottom:8,fontFamily:"DM Mono,monospace"}}>{func}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4}}>
                    {DIAS_SHORT.map((dia, dIdx) => {
                      const dayAlocs = alocs.filter(a => a.dia === dIdx);
                      const dayDate = getDayDate(semana, dIdx);
                      const isToday = dayDate.toDateString() === today.toDateString();
                      return (
                        <div key={dIdx} style={{background: isToday?"rgba(0,212,255,0.05)":"rgba(255,255,255,0.02)",border:`1px solid ${isToday?"rgba(0,212,255,0.2)":S.border}`,borderRadius:8,minHeight:60,padding:4,position:"relative"}}>
                          <div style={{fontSize:9,color:isToday?"#00d4ff":S.muted,fontWeight:600,marginBottom:4,textAlign:"center"}}>
                            {dia} {dayDate.getDate()}/{dayDate.getMonth()+1}
                          </div>
                          {dayAlocs.map(aloc => {
                            const os = osList.find(o => o.id === aloc.osId);
                            return (
                              <div key={aloc.id} style={{background:`${aloc.cor}20`,border:`1px solid ${aloc.cor}60`,borderLeft:`3px solid ${aloc.cor}`,borderRadius:4,padding:"4px 6px",marginBottom:4,position:"relative",cursor:"pointer"}}
                                onMouseEnter={()=>setHoveredAloc(aloc.id)} onMouseLeave={()=>setHoveredAloc(null)}>
                                <div style={{fontSize:9,fontFamily:"DM Mono,monospace",color:aloc.cor,fontWeight:700}}>{aloc.osId}</div>
                                <div style={{fontSize:9,color:"rgba(255,255,255,0.6)"}}>{aloc.horaInicio}h – {aloc.horaInicio+aloc.duracao}h ({aloc.duracao}h)</div>
                                <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os?.descricao?.substring(0,25)}</div>
                                {hoveredAloc === aloc.id && (
                                  <button onClick={()=>removerAlocacao(aloc.id)} style={{position:"absolute",top:2,right:2,background:"rgba(239,68,68,0.8)",border:"none",borderRadius:3,color:"#fff",fontSize:9,cursor:"pointer",padding:"1px 4px",lineHeight:1}}>✕</button>
                                )}
                              </div>
                            );
                          })}
                          {dayAlocs.length === 0 && <div style={{fontSize:9,color:"rgba(255,255,255,0.1)",textAlign:"center",padding:"8px 0"}}>livre</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Linha do tempo de horas */}
            <div style={{marginTop:20,borderTop:`1px solid ${S.border}`,paddingTop:16}}>
              <div style={{fontSize:11,color:S.muted,marginBottom:10,fontWeight:600}}>Distribuição por hora — todos os funcionários</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4}}>
                {DIAS_SHORT.map((dia,dIdx)=>{
                  const dayAlocs = alocSemana.filter(a=>a.dia===dIdx);
                  const dayDate = getDayDate(semana,dIdx);
                  const isToday = dayDate.toDateString()===today.toDateString();
                  return(
                    <div key={dIdx}>
                      <div style={{fontSize:10,color:isToday?"#00d4ff":S.muted,textAlign:"center",marginBottom:4,fontWeight:600}}>{dia}</div>
                      <div style={{position:"relative",height:80,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.border}`,borderRadius:6,overflow:"hidden"}}>
                        {/* Marcas de hora */}
                        {HORAS.map(h=>(
                          <div key={h} style={{position:"absolute",left:`${((h-7)/11)*100}%`,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.04)"}}/>
                        ))}
                        {/* Blocos */}
                        {dayAlocs.map(aloc=>(
                          <div key={aloc.id} style={{
                            position:"absolute",
                            left:`${((aloc.horaInicio-7)/11)*100}%`,
                            width:`${(aloc.duracao/11)*100}%`,
                            top:4,bottom:4,
                            background:`${aloc.cor}80`,
                            border:`1px solid ${aloc.cor}`,
                            borderRadius:3,
                            display:"flex",alignItems:"center",justifyContent:"center",
                          }}>
                            <span style={{fontSize:8,color:"#fff",fontFamily:"DM Mono,monospace",overflow:"hidden",whiteSpace:"nowrap",padding:"0 2px"}}>{aloc.osId.replace("OS-","")}</span>
                          </div>
                        ))}
                        {/* Indicador atual */}
                        {isToday&&<div style={{position:"absolute",left:`${((today.getHours()-7)/11)*100}%`,top:0,bottom:0,width:1.5,background:"#00d4ff",boxShadow:"0 0 4px #00d4ff"}}/>}
                      </div>
                      {/* Escala */}
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:2,fontSize:8,color:"rgba(255,255,255,0.2)"}}>
                        <span>7h</span><span>12h</span><span>18h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LISTA OS ABERTAS */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:14}}>📋 OS Disponíveis para Planejamento <span style={{color:"#00d4ff",fontFamily:"DM Mono,monospace",fontSize:12}}>({osAbertas.length})</span></span>
          <div style={{fontSize:11,color:S.muted}}>Clique em "Alocar" para adicionar ao Gantt</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"rgba(13,20,35,0.8)"}}>
                {["Score Σ","ID","Descrição","Criticidade","Status","HH Plan","Responsável","Prazo","Alocar"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",color:S.muted,textTransform:"uppercase",borderBottom:`1px solid ${S.border}`,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {osAbertas.sort((a,b)=>b.score-a.score).map(os=>{
                const jaAlocadaSemana = alocSemana.some(a=>a.osId===os.id);
                return(
                  <tr key={os.id} style={{borderBottom:`1px solid rgba(99,179,237,0.06)`}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.03)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${os.score>=8?"#ef4444":os.score>=6?"#f97316":"#10b981"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Mono,monospace",fontSize:11,fontWeight:700,color:os.score>=8?"#ef4444":os.score>=6?"#f97316":"#10b981"}}>{os.score}</div>
                      </div>
                    </td>
                    <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:11,color:"#00d4ff"}}>{os.id}</td>
                    <td style={{padding:"10px 14px",fontSize:12,maxWidth:200}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{os.descricao}</div></td>
                    <td style={{padding:"10px 14px"}}><span style={{background:CC[os.criticidade]+"20",color:CC[os.criticidade],border:`1px solid ${CC[os.criticidade]}40`,padding:"3px 8px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{os.criticidade}</span></td>
                    <td style={{padding:"10px 14px"}}><span style={{background:os.status==="planejada"?"rgba(139,92,246,0.15)":"rgba(59,130,246,0.15)",color:os.status==="planejada"?"#a78bfa":"#60a5fa",border:`1px solid ${os.status==="planejada"?"rgba(139,92,246,0.3)":"rgba(59,130,246,0.3)"}`,padding:"3px 8px",borderRadius:20,fontSize:9,fontWeight:700}}>{os.status}</span></td>
                    <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:11}}>{os.hhPlanejado}h</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:S.muted}}>{os.responsavel}</td>
                    <td style={{padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:700,color:os.diasPraza<0?"#ef4444":os.diasPraza<=5?"#f97316":"#10b981"}}>{os.diasPraza>=0?"+":""}{os.diasPraza}d</td>
                    <td style={{padding:"10px 14px"}}>
                      <button onClick={()=>{setForm(p=>({...p,osId:os.id}));setShowForm(true);}} style={{
                        background:jaAlocadaSemana?"rgba(16,185,129,0.12)":"rgba(0,212,255,0.1)",
                        border:`1px solid ${jaAlocadaSemana?"rgba(16,185,129,0.3)":"rgba(0,212,255,0.25)"}`,
                        color:jaAlocadaSemana?"#10b981":"#00d4ff",
                        borderRadius:7,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"
                      }}>
                        {jaAlocadaSemana?"✅ Alocar +":"+ Alocar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE ALOCAÇÃO */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16,backdropFilter:"blur(6px)"}} onClick={()=>setShowForm(false)}>
          <div style={{background:S.surf,borderRadius:20,maxWidth:580,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.6)",border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{padding:24,background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(139,92,246,0.08))",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:S.text}}>+ Alocar OS no Gantt</div>
                <div style={{fontSize:12,color:S.muted,marginTop:4}}>Semana {semana.split('-W')[1]} — {formatWeekLabel(semana)}</div>
              </div>
              <button onClick={()=>setShowForm(false)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${S.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",color:S.muted,fontSize:16}}>✕</button>
            </div>

            <div style={{padding:24,display:"flex",flexDirection:"column",gap:18}}>
              {/* Selecionar OS */}
              <div>
                <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Ordem de Serviço *</div>
                <select value={form.osId} onChange={e=>setForm(p=>({...p,osId:e.target.value}))} style={inp}>
                  <option value="">Selecionar OS...</option>
                  {osAbertas.sort((a,b)=>b.score-a.score).map(os=>(
                    <option key={os.id} value={os.id}>{os.id} — Score {os.score} — {os.descricao.substring(0,40)} ({os.hhPlanejado}h)</option>
                  ))}
                </select>
                {form.osId&&(()=>{
                  const os=osAbertas.find(o=>o.id===form.osId);
                  if(!os)return null;
                  return(
                    <div style={{marginTop:8,padding:10,background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:8,display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${os.score>=8?"#ef4444":os.score>=6?"#f97316":"#10b981"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:700,color:os.score>=8?"#ef4444":os.score>=6?"#f97316":"#10b981"}}>{os.score}</div>
                      <div><div style={{fontSize:12,fontWeight:600}}>{os.descricao}</div><div style={{fontSize:11,color:S.muted}}>{os.ativo} · {os.hhPlanejado}h planejado · prazo {os.diasPraza>=0?"+":""}{os.diasPraza}d</div></div>
                    </div>
                  );
                })()}
              </div>

              {/* Funcionários */}
              <div>
                <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Funcionários * <span style={{color:"#00d4ff"}}>({form.funcionarios.length} selecionado{form.funcionarios.length!==1?"s":""})</span></div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {FUNCIONARIOS.map(f=>{
                    const sel = form.funcionarios.includes(f);
                    return(
                      <button key={f} onClick={()=>toggleFuncionario(f)} style={{
                        background:sel?"rgba(0,212,255,0.12)":"rgba(255,255,255,0.03)",
                        border:`1px solid ${sel?"rgba(0,212,255,0.4)":S.border}`,
                        color:sel?"#00d4ff":"rgba(255,255,255,0.5)",
                        borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:sel?600:400,cursor:"pointer",fontFamily:"DM Sans,sans-serif",transition:"all 0.15s"
                      }}>
                        {sel?"✓ ":""}{f.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dia */}
              <div>
                <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Dia da Semana *</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                  {DIAS_LABEL.map((dia,idx)=>{
                    const dayDate = getDayDate(semana,idx);
                    const isToday = dayDate.toDateString()===today.toDateString();
                    const sel = form.dia===idx;
                    return(
                      <button key={idx} onClick={()=>setForm(p=>({...p,dia:idx}))} style={{
                        background:sel?"rgba(0,212,255,0.12)":isToday?"rgba(16,185,129,0.06)":"rgba(255,255,255,0.03)",
                        border:`1px solid ${sel?"rgba(0,212,255,0.4)":isToday?"rgba(16,185,129,0.2)":S.border}`,
                        color:sel?"#00d4ff":isToday?"#10b981":"rgba(255,255,255,0.5)",
                        borderRadius:8,padding:"8px 4px",cursor:"pointer",fontFamily:"DM Sans,sans-serif",textAlign:"center" as const,
                      }}>
                        <div style={{fontSize:11,fontWeight:sel?700:400}}>{DIAS_SHORT[idx]}</div>
                        <div style={{fontSize:9,opacity:0.6}}>{dayDate.getDate()}/{dayDate.getMonth()+1}</div>
                        {isToday&&<div style={{fontSize:8,color:"#10b981",marginTop:2}}>hoje</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hora + Duração */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Hora de Início *</div>
                  <select value={form.horaInicio} onChange={e=>setForm(p=>({...p,horaInicio:+e.target.value}))} style={inp}>
                    {HORAS.map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}:00h</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Duração (horas) *</div>
                  <select value={form.duracao} onChange={e=>setForm(p=>({...p,duracao:+e.target.value}))} style={inp}>
                    {[1,2,3,4,5,6,7,8].map(h=><option key={h} value={h}>{h}h {h===8?"(turno completo)":h>=4?"(meio turno)":""}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div style={{padding:12,background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:10}}>
                <div style={{fontSize:11,color:"#00d4ff",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Preview da Alocação</div>
                <div style={{fontSize:13,color:S.text}}>
                  <span style={{fontFamily:"DM Mono,monospace",color:"#00d4ff"}}>{form.osId||"Nenhuma OS"}</span>
                  {" → "}<strong>{DIAS_LABEL[form.dia]}</strong>
                  {" · "}<strong>{String(form.horaInicio).padStart(2,'0')}:00</strong>
                  {" até "}<strong>{String(form.horaInicio+form.duracao).padStart(2,'0')}:00</strong>
                  {" ("}<strong>{form.duracao}h</strong>{")"}
                  {form.funcionarios.length>0&&<><br/><span style={{fontSize:11,color:S.muted}}>👥 {form.funcionarios.join(", ")}</span></>}
                </div>
              </div>

              {/* Botões */}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:"rgba(255,255,255,0.5)",borderRadius:10,padding:"12px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Cancelar</button>
                <button onClick={alocar} style={{flex:2,background:"linear-gradient(135deg,#00d4ff,#3b82f6)",border:"none",color:"#fff",borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"DM Sans,sans-serif",boxShadow:"0 0 20px rgba(0,212,255,0.3)"}}>
                  ✅ Confirmar Alocação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
