"use client";
import { useState, useRef, useEffect } from "react";

interface Msg { role:"user"|"assistant"; content:string; ts:string; }

const QUICK_ACTIONS = [
  {l:"Analisar OS por criticidade",i:"🧠",p:"Analise as OS abertas e classifique em criticidade para planejamento. Considere: risco operacional, prazo, impacto e complexidade técnica. Responda com tabela de prioridades."},
  {l:"Criar OS preventiva PMOC",i:"❄️",p:"Me ajude a criar uma OS preventiva de PMOC para sistema HVAC. Inclua: título, ações detalhadas, materiais, frequência e critérios conforme NR-10 e ABNT NBR 6401."},
  {l:"Sugerir plano semanal",i:"📅",p:"Sugira um plano de execução para a semana distribuindo as atividades. Considere: Score Sigma, prazo, equipe disponível e 44h semanais (Seg-Sáb)."},
  {l:"Gerar base de locais",i:"🌳",p:"Crie uma árvore de locais para prédio comercial com: 2 torres (A e B), subsolo, área ADM e operacional. Formato hierárquico: Edifício > Bloco > Andar > Sala."},
  {l:"Calcular MTTR/MTBF",i:"📊",p:"Explique como calcular MTTR e MTBF para manutenção predial. Dê exemplos práticos e valores de referência para ativos críticos."},
  {l:"Lista de materiais PMOC",i:"📦",p:"Crie lista de materiais para manutenção PMOC de HVAC: filtros, lubrificantes, ferramentas e EPIs. Inclua código, quantidade mínima e fornecedor sugerido."},
  {l:"Analisar atrasos",i:"⚠️",p:"Analise causas comuns de atrasos em OS de manutenção predial e sugira ações corretivas e preventivas para melhorar aderência ao cronograma."},
  {l:"Relatório executivo",i:"📋",p:"Gere um modelo de relatório executivo mensal de manutenção com: KPIs principais, análise de tendências, OS críticas, eficiência da equipe e recomendações."},
];

const SYSTEM = `Você é o SIGMA IA, assistente especializado em gestão de manutenção predial.
Especialidades: OS preventivas/corretivas, PMOC (NR/ABNT), HVAC, elétrica (NR-10), hidráulica, civil, Score Sigma™, MTTR/MTBF.
Score Sigma™ = P×0.2 + R×0.25 + U×0.2 + I×0.15 + HH×0.1 + D×0.1 - Bloqueios×0.3 + Atraso×0.15
Ao analisar OS: classifique por criticidade, identifique conflitos, sugira ações, referencie normas.
Use emojis e seções para deixar respostas claras. Seja técnico, objetivo e prático. Responda em português.`;

const S = {surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b"};

interface Props { onToast:(msg:string)=>void; }

export default function AssistenteIA({ onToast }:Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{
    role:"assistant",
    content:"👋 Olá! Sou o **SIGMA IA**, assistente especializado em gestão de manutenção predial.\n\nPosso te ajudar com:\n- 🧠 **Analisar e priorizar OS** por criticidade\n- 📅 **Planejar execução semanal**\n- 🔧 **Criar OS preventivas** (PMOC, Civil, Elétrica, Hidráulica)\n- 🌳 **Montar base de locais** hierárquica\n- 📦 **Listas de materiais** e especificações\n- 📊 **MTTR/MTBF** e indicadores\n- 📋 **Relatórios executivos**\n\nUse os atalhos abaixo ou escreva sua pergunta!",
    ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQ, setShowQ] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  async function send(text?:string) {
    const t = text||input.trim();
    if(!t||loading) return;
    setInput(""); setShowQ(false);
    const userMsg:Msg = {role:"user",content:t,ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})};
    setMsgs(p=>[...p,userMsg]);
    setLoading(true);
    try {
      const history = msgs.slice(-10).map(m=>({role:m.role,content:m.content}));
      const r = await fetch("/api/ia/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages:[...history,{role:"user",content:t}], system:SYSTEM })
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data.error||"Erro na API");
      setMsgs(p=>[...p,{role:"assistant",content:data.text||"Sem resposta",ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);
    } catch(e:any) {
      setMsgs(p=>[...p,{role:"assistant",content:`⚠️ **Erro:** ${e.message}\n\nVerifique se a variável ANTHROPIC_API_KEY está configurada no Vercel.`,ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);
    }
    setLoading(false);
  }

  function clear() {
    setMsgs([{role:"assistant",content:"🔄 Conversa reiniciada! Como posso ajudar?",ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);
    setShowQ(true); onToast("🧠 Chat reiniciado");
  }

  function copyMsg(c:string) { navigator.clipboard.writeText(c); onToast("📋 Copiado!"); }

  function renderText(text:string) {
    return text.split('\n').map((line,i)=>{
      if(line.startsWith('### ')) return <div key={i} style={{fontWeight:700,fontSize:14,color:"#00d4ff",margin:"10px 0 3px"}}>{line.slice(4)}</div>;
      if(line.startsWith('## ')) return <div key={i} style={{fontWeight:700,fontSize:15,color:"#00d4ff",margin:"12px 0 4px"}}>{line.slice(3)}</div>;
      if(line.startsWith('# ')) return <div key={i} style={{fontWeight:800,fontSize:17,color:"#00d4ff",margin:"14px 0 6px",fontFamily:"Syne,sans-serif"}}>{line.slice(2)}</div>;
      if(line.startsWith('- ')||line.startsWith('• ')) return <div key={i} style={{display:"flex",gap:8,margin:"2px 0",paddingLeft:6}}><span style={{color:"#00d4ff",flexShrink:0}}>›</span><span>{renderInline(line.slice(2))}</span></div>;
      if(/^\d+\./.test(line)) return <div key={i} style={{display:"flex",gap:8,margin:"2px 0",paddingLeft:6}}><span style={{color:"#00d4ff",flexShrink:0,minWidth:18}}>{line.match(/^\d+/)![0]}.</span><span>{renderInline(line.replace(/^\d+\.\s*/,''))}</span></div>;
      if(line.startsWith('```')) return null;
      if(line==='') return <div key={i} style={{height:6}}/>;
      return <div key={i} style={{margin:"1px 0",lineHeight:1.7}}>{renderInline(line)}</div>;
    }).filter(Boolean);
  }

  function renderInline(text:string) {
    return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((p,i)=>{
      if(p.startsWith('**')&&p.endsWith('**')) return <strong key={i} style={{color:S.text,fontWeight:700}}>{p.slice(2,-2)}</strong>;
      if(p.startsWith('`')&&p.endsWith('`')) return <code key={i} style={{background:"rgba(0,212,255,0.1)",color:"#00d4ff",padding:"1px 6px",borderRadius:4,fontFamily:"DM Mono,monospace",fontSize:"0.9em"}}>{p.slice(1,-1)}</code>;
      return p;
    });
  }

  const inp = {background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:S.text,borderRadius:12,padding:"12px 16px",fontFamily:"DM Sans,sans-serif",fontSize:14,outline:"none",width:"100%",resize:"none" as const};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      {/* Header */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:"14px 14px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#8b5cf6,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 16px rgba(139,92,246,0.4)"}}>🧠</div>
          <div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16}}>SIGMA IA — Chat</div>
            <div style={{fontSize:11,color:"#10b981",display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#10b981",display:"inline-block"}}/>Powered by Claude · API Server-Side
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowQ(!showQ)} style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.25)",color:"#a78bfa",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"DM Sans,sans-serif",fontWeight:600}}>⚡ Atalhos</button>
          <button onClick={clear} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"DM Sans,sans-serif",fontWeight:600}}>🗑 Limpar</button>
        </div>
      </div>

      {/* Quick Actions */}
      {showQ&&(
        <div style={{background:"rgba(13,20,35,0.6)",borderLeft:`1px solid ${S.border}`,borderRight:`1px solid ${S.border}`,padding:14,flexShrink:0,borderBottom:`1px solid ${S.border}`}}>
          <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontWeight:600}}>⚡ Ações Rápidas</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {QUICK_ACTIONS.map((qa,i)=>(
              <button key={i} onClick={()=>send(qa.p)} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.08)";e.currentTarget.style.color="#00d4ff";e.currentTarget.style.borderColor="rgba(0,212,255,0.3)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color="rgba(255,255,255,0.7)";e.currentTarget.style.borderColor=S.border}}>
                <span>{qa.i}</span><span>{qa.l}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensagens */}
      <div style={{flex:1,overflowY:"auto",background:"rgba(8,12,20,0.5)",borderLeft:`1px solid ${S.border}`,borderRight:`1px solid ${S.border}`,padding:20,display:"flex",flexDirection:"column",gap:16}}>
        {msgs.map((msg,i)=>(
          <div key={i} style={{display:"flex",gap:12,flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:msg.role==="assistant"?"linear-gradient(135deg,#8b5cf6,#00d4ff)":"linear-gradient(135deg,#00d4ff,#3b82f6)",boxShadow:msg.role==="assistant"?"0 0 10px rgba(139,92,246,0.3)":"0 0 10px rgba(0,212,255,0.2)"}}>
              {msg.role==="assistant"?"🧠":"👤"}
            </div>
            <div style={{maxWidth:"78%",minWidth:100}}>
              <div style={{padding:"12px 16px",borderRadius:msg.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",background:msg.role==="user"?"linear-gradient(135deg,rgba(0,212,255,0.12),rgba(59,130,246,0.12))":"rgba(13,20,35,0.8)",border:`1px solid ${msg.role==="user"?"rgba(0,212,255,0.2)":S.border}`,fontSize:13,lineHeight:1.7,color:S.text}}>
                {renderText(msg.content)}
              </div>
              <div style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",alignItems:"center",gap:8,marginTop:4}}>
                <span style={{fontSize:10,color:S.muted}}>{msg.ts}</span>
                {msg.role==="assistant"&&<button onClick={()=>copyMsg(msg.content)} style={{background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:10,padding:"0 4px"}} title="Copiar">📋</button>}
              </div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#8b5cf6,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧠</div>
            <div style={{padding:"14px 18px",borderRadius:"4px 14px 14px 14px",background:"rgba(13,20,35,0.8)",border:`1px solid ${S.border}`,display:"flex",gap:6,alignItems:"center"}}>
              {[0,1,2].map(j=><div key={j} style={{width:8,height:8,borderRadius:"50%",background:"#8b5cf6",animation:`bounce 1.2s ease infinite`,animationDelay:`${j*0.2}s`}}/>)}
              <span style={{fontSize:12,color:S.muted,marginLeft:6}}>SIGMA IA analisando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:"0 0 14px 14px",padding:16,flexShrink:0}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="Pergunte sobre OS, PMOC, materiais, planejamento... (Enter para enviar)" rows={2} disabled={loading}
              style={{...inp,opacity:loading?0.6:1,lineHeight:1.6}}/>
          </div>
          <button onClick={()=>send()} disabled={!input.trim()||loading} style={{background:input.trim()&&!loading?"linear-gradient(135deg,#8b5cf6,#00d4ff)":"rgba(255,255,255,0.06)",border:`1px solid ${input.trim()&&!loading?"rgba(139,92,246,0.4)":S.border}`,color:input.trim()&&!loading?"#fff":"rgba(255,255,255,0.3)",borderRadius:10,width:46,height:46,cursor:input.trim()&&!loading?"pointer":"default",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:input.trim()&&!loading?"0 0 16px rgba(139,92,246,0.3)":"none",transition:"all 0.2s",flexShrink:0}}>
            {loading?"⏳":"➤"}
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10,color:S.muted}}>
          <span>🔒 API Server-Side · Dados protegidos</span>
          <span>Shift+Enter = nova linha</span>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.2);opacity:1}}`}</style>
    </div>
  );
}
