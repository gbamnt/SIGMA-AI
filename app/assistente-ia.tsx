"use client";
import { useState, useRef, useEffect } from "react";

// ═══════════ TIPOS ═══════════
interface Msg { role: "user"|"assistant"; content: string; ts: string; }
interface QuickAction { label: string; icon: string; prompt: string; }

// ═══════════ QUICK ACTIONS ═══════════
const QUICK_ACTIONS: QuickAction[] = [
  { label: "Analisar OS por criticidade", icon: "🧠", prompt: "Analise as ordens de serviço abertas e classifique em ordem de criticidade para o planejamento semanal. Considere: risco operacional, prazo, impacto no negócio e complexidade técnica." },
  { label: "Criar OS preventiva PMOC", icon: "❄️", prompt: "Me ajude a criar uma OS preventiva de PMOC para sistema HVAC. Preciso de: título, ações detalhadas, materiais necessários, frequência recomendada e critérios de criticidade conforme norma NR-10 e ABNT NBR 6401." },
  { label: "Sugerir plano semanal", icon: "📅", prompt: "Com base nas OS abertas e prioridades, sugira um plano de execução para a semana. Distribua as atividades considerando: Score Sigma, prazo, equipe disponível e carga horária de 44h semanais (Seg-Sáb)." },
  { label: "Gerar base de locais", icon: "🌳", prompt: "Ajude-me a criar uma árvore de locais de serviço para um prédio comercial com: 2 torres (A e B), subsolo, área administrativa e operacional. Formato: Local > Sublocal > Ambiente." },
  { label: "Calcular MTTR/MTBF", icon: "📊", prompt: "Com base nos apontamentos de HH e OS dos últimos meses, calcule o MTTR (Tempo Médio para Reparo) e MTBF (Tempo Médio Entre Falhas) para os principais ativos. Indique também tendências e recomendações." },
  { label: "Criar lista de materiais", icon: "📦", prompt: "Crie uma lista de materiais essenciais para manutenção predial incluindo: HVAC, elétrica, hidráulica e civil. Para cada item inclua quantidade mínima de estoque, código e fornecedor sugerido." },
  { label: "Analisar atrasos", icon: "⚠️", prompt: "Analise as OS atrasadas e os motivos mais comuns. Sugira ações corretivas e preventivas para reduzir o índice de atrasos e melhorar a aderência ao cronograma." },
  { label: "Relatório executivo IA", icon: "📋", prompt: "Gere um relatório executivo do período atual com: principais KPIs, análise de tendências, OS críticas, eficiência da equipe e recomendações estratégicas para a próxima semana." },
];

// ═══════════ CONTEXTO DO SISTEMA ═══════════
const SYSTEM_PROMPT = `Você é o SIGMA IA, assistente especializado em gestão de manutenção predial do sistema SIGMA AI. 

Suas especialidades:
- Gestão de Ordens de Serviço (OS) preventivas e corretivas
- PMOC (Plano de Manutenção, Operação e Controle) - NR e ABNT
- Manutenção de sistemas: HVAC, elétrica (NR-10), hidráulica, civil
- Análise de criticidade e priorização via Score Sigma™
- Gestão de ativos, MTTR, MTBF e indicadores de manutenção
- Criação de bases de dados: locais, atividades, materiais

Score Sigma™ = P×0.2 + R×0.25 + U×0.2 + I×0.15 + HH×0.1 + D×0.1 - Bloqueios×0.3 + Atraso×0.15

Ao analisar OS, sempre:
1. Classifique por criticidade (critica/alta/media/baixa)
2. Identifique conflitos e bloqueios
3. Sugira ações específicas e realizáveis
4. Referencie normas quando aplicável (NR-10, NR-12, NR-35, ABNT, PMOC)
5. Formate a resposta de forma clara com emojis e seções

Para criar OS, use o formato JSON estruturado quando solicitado.
Seja objetivo, técnico e prático. Responda em português.`;

const S = { bg:"#080c14",surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b" };

interface Props { onToast: (msg:string)=>void; }

export default function AssistenteIA({ onToast }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{
    role:"assistant",
    content:"👋 Olá! Sou o **SIGMA IA**, seu assistente especializado em gestão de manutenção predial.\n\nPosso te ajudar a:\n- 🧠 **Analisar e priorizar OS** por criticidade\n- 📅 **Sugerir plano semanal** de execução\n- 🔧 **Criar OS preventivas** (PMOC, Civil, Elétrica, Hidráulica)\n- 🌳 **Montar base de locais** de serviço\n- 📦 **Gerar lista de materiais**\n- 📊 **Calcular MTTR/MTBF** e indicadores\n- 📋 **Gerar relatórios executivos**\n\nUse os atalhos abaixo ou escreva sua pergunta!",
    ts: new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  async function sendMsg(text?: string) {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput("");
    setShowQuick(false);

    const userMsg: Msg = { role:"user", content:msgText, ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) };
    setMsgs(p => [...p, userMsg]);
    setLoading(true);

    try {
      const history = msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).map(m=>({ role:m.role, content:m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1500,
          system: SYSTEM_PROMPT,
          messages:[...history,{role:"user",content:msgText}]
        })
      });
      const data = await res.json();
      const txt = data?.content?.[0]?.text || "Desculpe, não consegui processar sua solicitação.";
      setMsgs(p=>[...p,{role:"assistant",content:txt,ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);
    } catch(e) {
      setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Erro de conexão com a IA. Verifique a configuração da API.",ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);
    }
    setLoading(false);
  }

  function clearChat() {
    setMsgs([{role:"assistant",content:"🔄 Conversa reiniciada! Como posso ajudar?",ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);
    setShowQuick(true);
    onToast("🧠 Chat reiniciado");
  }

  function copyMsg(content: string) {
    navigator.clipboard.writeText(content);
    onToast("📋 Copiado!");
  }

  // Renderiza markdown simples
  function renderText(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <div key={i} style={{fontWeight:700,fontSize:15,color:"#00d4ff",margin:"12px 0 4px"}}>{line.replace('### ','')}</div>;
      if (line.startsWith('## ')) return <div key={i} style={{fontWeight:700,fontSize:16,color:"#00d4ff",margin:"14px 0 6px"}}>{line.replace('## ','')}</div>;
      if (line.startsWith('# ')) return <div key={i} style={{fontWeight:800,fontSize:18,color:"#00d4ff",margin:"16px 0 8px",fontFamily:"Syne,sans-serif"}}>{line.replace('# ','')}</div>;
      // Listas
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{display:"flex",gap:8,margin:"2px 0",paddingLeft:8}}><span style={{color:"#00d4ff",flexShrink:0}}>›</span><span>{renderInline(line.slice(2))}</span></div>;
      if (/^\d+\./.test(line)) return <div key={i} style={{display:"flex",gap:8,margin:"2px 0",paddingLeft:8}}><span style={{color:"#00d4ff",flexShrink:0,minWidth:20}}>{line.match(/^\d+/)![0]}.</span><span>{renderInline(line.replace(/^\d+\.\s*/,''))}</span></div>;
      // Code block simples
      if (line.startsWith('```')) return null;
      if (line === '') return <div key={i} style={{height:6}}/>;
      return <div key={i} style={{margin:"1px 0",lineHeight:1.7}}>{renderInline(line)}</div>;
    }).filter(Boolean);
  }

  function renderInline(text: string) {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((p,i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{color:"#e2e8f0",fontWeight:700}}>{p.slice(2,-2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{background:"rgba(0,212,255,0.1)",color:"#00d4ff",padding:"1px 6px",borderRadius:4,fontFamily:"DM Mono,monospace",fontSize:"0.9em"}}>{p.slice(1,-1)}</code>;
      return p;
    });
  }

  const inp = { background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:S.text,borderRadius:12,padding:"12px 16px",fontFamily:"DM Sans,sans-serif",fontSize:14,outline:"none",width:"100%",resize:"none" as const };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 160px)",gap:0}}>
      {/* Header */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:"14px 14px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#8b5cf6,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 16px rgba(139,92,246,0.4)"}}>🧠</div>
          <div>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16}}>SIGMA IA</div>
            <div style={{fontSize:11,color:"#10b981",display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#10b981",display:"inline-block"}}/>
              Assistente Online · Claude Sonnet
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowQuick(!showQuick)} style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.25)",color:"#a78bfa",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"DM Sans,sans-serif",fontWeight:600}}>
            ⚡ Atalhos
          </button>
          <button onClick={clearChat} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"DM Sans,sans-serif",fontWeight:600}}>
            🗑 Limpar
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {showQuick && (
        <div style={{background:"rgba(13,20,35,0.6)",borderLeft:`1px solid ${S.border}`,borderRight:`1px solid ${S.border}`,padding:16,flexShrink:0,borderBottom:`1px solid ${S.border}`}}>
          <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,fontWeight:600}}>⚡ Ações Rápidas</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {QUICK_ACTIONS.map((qa,i)=>(
              <button key={i} onClick={()=>sendMsg(qa.prompt)} style={{
                background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,
                color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"6px 12px",
                cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,
                display:"flex",alignItems:"center",gap:6,transition:"all 0.15s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,212,255,0.08)";e.currentTarget.style.color="#00d4ff";e.currentTarget.style.borderColor="rgba(0,212,255,0.3)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color="rgba(255,255,255,0.7)";e.currentTarget.style.borderColor=S.border;}}>
                <span>{qa.icon}</span><span>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensagens */}
      <div style={{flex:1,overflowY:"auto",background:"rgba(8,12,20,0.5)",borderLeft:`1px solid ${S.border}`,borderRight:`1px solid ${S.border}`,padding:20,display:"flex",flexDirection:"column",gap:16}}>
        {msgs.map((msg,i)=>(
          <div key={i} style={{display:"flex",gap:12,flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
            {/* Avatar */}
            <div style={{
              width:34,height:34,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
              background:msg.role==="assistant"?"linear-gradient(135deg,#8b5cf6,#00d4ff)":"linear-gradient(135deg,#00d4ff,#3b82f6)",
              boxShadow:msg.role==="assistant"?"0 0 10px rgba(139,92,246,0.3)":"0 0 10px rgba(0,212,255,0.2)",
            }}>
              {msg.role==="assistant"?"🧠":"👤"}
            </div>
            {/* Bubble */}
            <div style={{maxWidth:"78%",minWidth:100}}>
              <div style={{
                padding:"12px 16px",borderRadius:msg.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",
                background:msg.role==="user"?"linear-gradient(135deg,rgba(0,212,255,0.12),rgba(59,130,246,0.12))":"rgba(13,20,35,0.8)",
                border:`1px solid ${msg.role==="user"?"rgba(0,212,255,0.2)":S.border}`,
                fontSize:13,lineHeight:1.7,color:S.text,
              }}>
                {renderText(msg.content)}
              </div>
              <div style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",alignItems:"center",gap:8,marginTop:4}}>
                <span style={{fontSize:10,color:S.muted}}>{msg.ts}</span>
                {msg.role==="assistant"&&<button onClick={()=>copyMsg(msg.content)} style={{background:"none",border:"none",cursor:"pointer",color:S.muted,fontSize:10,padding:"0 4px"}} title="Copiar">📋</button>}
              </div>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading&&(
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#8b5cf6,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 10px rgba(139,92,246,0.3)"}}>🧠</div>
            <div style={{padding:"14px 18px",borderRadius:"4px 14px 14px 14px",background:"rgba(13,20,35,0.8)",border:`1px solid ${S.border}`,display:"flex",gap:6,alignItems:"center"}}>
              {[0,1,2].map(j=>(
                <div key={j} style={{width:8,height:8,borderRadius:"50%",background:"#8b5cf6",animation:`bounce 1.2s ease infinite`,animationDelay:`${j*0.2}s`}}/>
              ))}
              <span style={{fontSize:12,color:S.muted,marginLeft:6}}>SIGMA IA analisando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{background:S.surf,border:`1px solid ${S.border}`,borderRadius:"0 0 14px 14px",padding:16,flexShrink:0}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1,position:"relative"}}>
            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
              placeholder="Pergunte sobre OS, planejamento, PMOC, relatórios... (Enter para enviar, Shift+Enter para nova linha)"
              rows={2}
              disabled={loading}
              style={{...inp,paddingRight:110,opacity:loading?0.6:1,lineHeight:1.6}}
            />
            <div style={{position:"absolute",right:10,bottom:10,display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:S.muted}}>Enter ↵</span>
            </div>
          </div>
          <button
            onClick={()=>sendMsg()}
            disabled={!input.trim()||loading}
            style={{
              background:input.trim()&&!loading?"linear-gradient(135deg,#8b5cf6,#00d4ff)":"rgba(255,255,255,0.06)",
              border:`1px solid ${input.trim()&&!loading?"rgba(139,92,246,0.4)":S.border}`,
              color:input.trim()&&!loading?"#fff":"rgba(255,255,255,0.3)",
              borderRadius:10,width:46,height:46,cursor:input.trim()&&!loading?"pointer":"default",
              fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:input.trim()&&!loading?"0 0 16px rgba(139,92,246,0.3)":"none",
              transition:"all 0.2s",flexShrink:0,
            }}
          >
            {loading?"⏳":"➤"}
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10,color:S.muted}}>
          <span>🧠 Powered by Claude Sonnet · Especializado em Manutenção Predial</span>
          <span>{input.length > 0 ? `${input.length} caracteres` : "Shift+Enter = nova linha"}</span>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.2);opacity:1} }
      `}</style>
    </div>
  );
}
