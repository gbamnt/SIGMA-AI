"use client";
import { useState, useMemo } from "react";

// ═══════════════════════ TIPOS ═══════════════════════
type TipoPreventiva = "pmoc"|"civil"|"eletrica"|"hidraulica"|"outro";
type Recorrencia = "diaria"|"semanal"|"quinzenal"|"mensal"|"bimestral"|"trimestral"|"semestral"|"anual";
type PrioridadeOS = "critica"|"alta"|"media"|"baixa";

interface Local {
  id: string; nome: string; parentId: string|null; descricao?: string; tipo?: string;
}
interface Atividade {
  id: string; nome: string; tipo: TipoPreventiva; descricao: string; duracaoHH: number;
  acoes: string[]; materiais: string[];
}
interface OSPreventiva {
  id: string; titulo: string; localId: string; atividadeId: string;
  tipo: TipoPreventiva; recorrencia: Recorrencia; prioridade: PrioridadeOS;
  responsavel: string; ativo: boolean; proxExecucao: string;
  acoes: string[]; materiais: string[]; obs: string; criadoEm: string;
  hhEstimado: number;
}

// ═══════════════════════ DADOS INICIAIS ═══════════════════════
const LOCAIS_INIT: Local[] = [
  {id:"l1",nome:"Edifício Principal",parentId:null,tipo:"edificio"},
  {id:"l2",nome:"ADM",parentId:"l1",tipo:"bloco"},
  {id:"l3",nome:"Térreo",parentId:"l2",tipo:"andar"},
  {id:"l4",nome:"Recepção",parentId:"l3",tipo:"sala"},
  {id:"l5",nome:"Sala de Reuniões",parentId:"l3",tipo:"sala"},
  {id:"l6",nome:"Primeiro Andar",parentId:"l2",tipo:"andar"},
  {id:"l7",nome:"Sala do Coordenador de Processos",parentId:"l6",tipo:"sala"},
  {id:"l8",nome:"Diretoria",parentId:"l6",tipo:"sala"},
  {id:"l9",nome:"Operacional",parentId:"l1",tipo:"bloco"},
  {id:"l10",nome:"Subsolo",parentId:"l9",tipo:"andar"},
  {id:"l11",nome:"Casa de Máquinas",parentId:"l10",tipo:"sala"},
  {id:"l12",nome:"Subestação",parentId:"l10",tipo:"sala"},
  {id:"l13",nome:"Térreo Operacional",parentId:"l9",tipo:"andar"},
  {id:"l14",nome:"HVAC Central",parentId:"l13",tipo:"sistema"},
  {id:"l15",nome:"Torre A",parentId:"l1",tipo:"bloco"},
  {id:"l16",nome:"Cobertura Torre A",parentId:"l15",tipo:"area"},
  {id:"l17",nome:"Torre B",parentId:"l1",tipo:"bloco"},
  {id:"l18",nome:"Cobertura Torre B",parentId:"l17",tipo:"area"},
  {id:"l19",nome:"Área Externa",parentId:null,tipo:"area"},
  {id:"l20",nome:"Estacionamento",parentId:"l19",tipo:"area"},
  {id:"l21",nome:"Jardins",parentId:"l19",tipo:"area"},
];

const ATIVIDADES_TEMPLATES: Atividade[] = [
  {id:"at1",nome:"Manutenção PMOC — Filtros HVAC",tipo:"pmoc",descricao:"Limpeza e substituição de filtros conforme PMOC vigente",duracaoHH:4,
    acoes:["Verificar estado dos filtros","Limpar ou substituir filtros G1/G2/G3","Registrar pressão antes/depois","Verificar bandeja de condensado","Anotar no livro de registros PMOC"],
    materiais:["Filtro G2 16x20","Filtro G3 20x20","Luvas de proteção","Máscara PFF2"]},
  {id:"at2",nome:"Verificação Sistemas PMOC — Mensal",tipo:"pmoc",descricao:"Inspeção mensal completa do sistema de climatização conforme NR e PMOC",duracaoHH:6,
    acoes:["Medir temperatura de insuflamento","Verificar corrente elétrica dos compressores","Checar nível de refrigerante (visualmente)","Inspecionar isolamento de dutos","Verificar funcionamento das dampers","Limpar bandejas e drenos","Registrar no PMOC"],
    materiais:["Termômetro de infravermelho","Alicate amperímetro","EPI completo","Formulário PMOC"]},
  {id:"at3",nome:"Inspeção Elétrica — Quadro Geral",tipo:"eletrica",descricao:"Verificação periódica dos quadros elétricos",duracaoHH:3,
    acoes:["Verificar aquecimento de disjuntores (termográfico)","Checar aperto dos terminais","Verificar identificação dos circuitos","Testar funcionamento dos DRs","Verificar aterramento","Limpar interior do quadro"],
    materiais:["Termômetro infravermelho","Chave de fenda isolada","Multímetro","Formulário de inspeção"]},
  {id:"at4",nome:"Manutenção Hidráulica — Bombas",tipo:"hidraulica",descricao:"Manutenção preventiva das bombas d'água",duracaoHH:4,
    acoes:["Verificar vibração e ruído anormal","Medir pressão de saída","Verificar gaxetas e vedações","Checar alinhamento do acoplamento","Lubrificar mancais","Verificar válvulas de retenção"],
    materiais:["Graxa LB3","Gaxeta 3/8\"","Manômetro","Luvas de proteção"]},
  {id:"at5",nome:"Inspeção Civil — Cobertura",tipo:"civil",descricao:"Inspeção periódica da cobertura e impermeabilização",duracaoHH:3,
    acoes:["Verificar integridade da impermeabilização","Checar rufos e calhas","Verificar drenos e ralos","Inspecionar juntas de dilatação","Documentar pontos de infiltração","Verificar fixação de antenas e equipamentos"],
    materiais:["Câmera fotográfica","EPI para trabalho em altura","Formulário de vistoria","Fita crepe"]},
  {id:"at6",nome:"Limpeza Reservatórios — Semestral",tipo:"hidraulica",descricao:"Limpeza e desinfecção dos reservatórios conforme NR e ABNT NBR 5626",duracaoHH:8,
    acoes:["Esvaziar reservatório gradualmente","Escovar paredes e fundo","Aplicar solução clorada (2–5 ppm)","Aguardar 4h de contato","Escoar e enxaguar 3 vezes","Coletar amostra para análise","Registrar no livro de manutenção","Afixar plaqueta de data"],
    materiais:["Hipoclorito de sódio 12%","EPI para trabalho em espaço confinado","Bomba submersa","Kit de análise de cloro","Escovas e rodos"]},
  {id:"at7",nome:"Verificação SPDA — Para-Raios",tipo:"eletrica",descricao:"Inspeção anual do sistema de proteção contra descargas atmosféricas",duracaoHH:5,
    acoes:["Verificar continuidade dos condutores","Medir resistência de aterramento (<10Ω)","Inspecionar captor e hastes","Verificar conectores e junções","Verificar sistema DPS nos quadros","Emitir laudo técnico"],
    materiais:["Terrômetro","EPI para trabalho em altura","Formulário de laudo","Câmera fotográfica"]},
  {id:"at8",nome:"Lubrificação Elevadores",tipo:"civil",descricao:"Lubrificação periódica dos equipamentos de transporte vertical",duracaoHH:3,
    acoes:["Lubrificar guias e roldanas","Verificar tensão de cabos","Checar freios","Testar portas automáticas","Verificar nivelamento","Registrar no livro do elevador"],
    materiais:["Graxa especial para elevadores","Óleo lubrificante","Chave de regulagem","EPI"]},
];

const OS_PREV_INIT: OSPreventiva[] = [
  {id:"OSP-001",titulo:"PMOC Mensal — HVAC Torre A",localId:"l16",atividadeId:"at2",tipo:"pmoc",recorrencia:"mensal",prioridade:"alta",responsavel:"Maria Costa",ativo:true,proxExecucao:"2025-02-15",acoes:ATIVIDADES_TEMPLATES.find(a=>a.id==="at2")!.acoes,materiais:ATIVIDADES_TEMPLATES.find(a=>a.id==="at2")!.materiais,obs:"Conforme contrato PMOC vigente",criadoEm:"2025-01-01",hhEstimado:6},
  {id:"OSP-002",titulo:"Inspeção Elétrica — Subestação",localId:"l12",atividadeId:"at3",tipo:"eletrica",recorrencia:"trimestral",prioridade:"critica",responsavel:"Marcos Torres",ativo:true,proxExecucao:"2025-02-20",acoes:ATIVIDADES_TEMPLATES.find(a=>a.id==="at3")!.acoes,materiais:ATIVIDADES_TEMPLATES.find(a=>a.id==="at3")!.materiais,obs:"Requer laudo técnico",criadoEm:"2025-01-01",hhEstimado:3},
  {id:"OSP-003",titulo:"Limpeza Reservatórios — Semestral",localId:"l11",atividadeId:"at6",tipo:"hidraulica",recorrencia:"semestral",prioridade:"alta",responsavel:"Pedro Lima",ativo:true,proxExecucao:"2025-03-01",acoes:ATIVIDADES_TEMPLATES.find(a=>a.id==="at6")!.acoes,materiais:ATIVIDADES_TEMPLATES.find(a=>a.id==="at6")!.materiais,obs:"Norma ABNT NBR 5626",criadoEm:"2025-01-01",hhEstimado:8},
];

// ═══════════════════════ ESTILOS ═══════════════════════
const S = {bg:"#080c14",surf:"#0d1423",surf2:"#111b2e",border:"rgba(99,179,237,0.12)",text:"#e2e8f0",muted:"#64748b"};
const TIPO_COLORS: Record<TipoPreventiva,string> = {pmoc:"#00d4ff",civil:"#f97316",eletrica:"#eab308",hidraulica:"#3b82f6",outro:"#8b5cf6"};
const TIPO_LABELS: Record<TipoPreventiva,string> = {pmoc:"PMOC",civil:"Civil",eletrica:"Elétrica",hidraulica:"Hidráulica",outro:"Outro"};
const PRIO_COLORS = {critica:"#ef4444",alta:"#f97316",media:"#eab308",baixa:"#22c55e"};
const REC_LABELS: Record<Recorrencia,string> = {diaria:"Diária",semanal:"Semanal",quinzenal:"Quinzenal",mensal:"Mensal",bimestral:"Bimestral",trimestral:"Trimestral",semestral:"Semestral",anual:"Anual"};

interface Props {
  onAddOSToPlanning?: (os: any) => void;
  onToast: (msg: string) => void;
}

// ═══════════════════════ TREE NODE ═══════════════════════
function TreeNode({ local, locais, level, selected, onSelect, onAdd, onDelete, expanded, onToggle }:
  { local: Local; locais: Local[]; level: number; selected: string|null; onSelect:(id:string)=>void;
    onAdd:(parentId:string)=>void; onDelete:(id:string)=>void; expanded:Set<string>; onToggle:(id:string)=>void }) {
  const children = locais.filter(l => l.parentId === local.id);
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(local.id);
  const isSelected = selected === local.id;

  const typeIcon: Record<string,string> = {
    edificio:"🏢",bloco:"🏗",andar:"📐",sala:"🚪",sistema:"⚙️",area:"🌿",default:"📍"
  };
  const icon = typeIcon[local.tipo||"default"] || "📍";

  return (
    <div>
      <div style={{
        display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderRadius:7,cursor:"pointer",
        marginLeft:level*16,background:isSelected?"rgba(0,212,255,0.1)":"transparent",
        border:isSelected?"1px solid rgba(0,212,255,0.25)":"1px solid transparent",
        transition:"all 0.15s",
      }}
        onMouseEnter={e=>!isSelected&&(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
        onMouseLeave={e=>!isSelected&&(e.currentTarget.style.background="transparent")}>
        <button onClick={()=>hasChildren&&onToggle(local.id)} style={{background:"none",border:"none",cursor:hasChildren?"pointer":"default",color:S.muted,fontSize:10,width:14,flexShrink:0,padding:0}}>
          {hasChildren?(isExpanded?"▾":"▸"):""}
        </button>
        <span style={{fontSize:13}}>{icon}</span>
        <span style={{flex:1,fontSize:13,color:isSelected?"#00d4ff":S.text,fontWeight:isSelected?600:400}} onClick={()=>onSelect(local.id)}>{local.nome}</span>
        <div style={{display:"flex",gap:4,opacity:0,transition:"opacity 0.15s"}} className="tree-actions">
          <button onClick={e=>{e.stopPropagation();onAdd(local.id);}} title="Adicionar filho" style={{background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.2)",color:"#00d4ff",borderRadius:4,width:18,height:18,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          <button onClick={e=>{e.stopPropagation();onDelete(local.id);}} title="Remover" style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:4,width:18,height:18,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
      </div>
      {isExpanded && children.map(child => (
        <TreeNode key={child.id} local={child} locais={locais} level={level+1} selected={selected}
          onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} expanded={expanded} onToggle={onToggle}/>
      ))}
    </div>
  );
}

// ═══════════════════════ MAIN ═══════════════════════
export default function Preventivas({ onToast, onAddOSToPlanning }: Props) {
  const [locais, setLocais] = useState<Local[]>(LOCAIS_INIT);
  const [atividades] = useState<Atividade[]>(ATIVIDADES_TEMPLATES);
  const [osPrev, setOsPrev] = useState<OSPreventiva[]>(OS_PREV_INIT);
  const [tab, setTab] = useState<"os"|"locais"|"atividades">("os");
  const [selectedLocal, setSelectedLocal] = useState<string|null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["l1","l2","l9","l15","l17","l19"]));
  const [showForm, setShowForm] = useState(false);
  const [showLocalForm, setShowLocalForm] = useState<{parentId:string|null}|null>(null);
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterPrio, setFilterPrio] = useState<string>("");
  const [newLocalForm, setNewLocalForm] = useState({nome:"",tipo:"sala",descricao:""});
  const [form, setForm] = useState<Partial<OSPreventiva>>({
    tipo:"pmoc",recorrencia:"mensal",prioridade:"media",ativo:true,
    acoes:[],materiais:[],obs:"",hhEstimado:4,
  });
  const [acoesInput, setAcoesInput] = useState("");
  const [materiaisInput, setMateriaisInput] = useState("");

  const inp = {background:"rgba(255,255,255,0.05)",border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 10px",fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",width:"100%"};
  const btn = (bg:string,c="#fff") => ({background:bg,border:"none",color:c,borderRadius:8,padding:"8px 14px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"});
  const card = (e?:any) => ({background:S.surf,border:`1px solid ${S.border}`,borderRadius:14,...e});

  // Raízes da árvore
  const rootLocais = locais.filter(l => !l.parentId);

  // Breadcrumb do local selecionado
  function getBreadcrumb(id: string): string {
    const parts: string[] = [];
    let current: Local|undefined = locais.find(l => l.id === id);
    while (current) {
      parts.unshift(current.nome);
      current = current.parentId ? locais.find(l => l.id === current!.parentId) : undefined;
    }
    return parts.join(" › ");
  }

  function toggleNode(id: string) {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addLocal(parentId: string|null) {
    setShowLocalForm({ parentId });
    setNewLocalForm({nome:"",tipo:"sala",descricao:""});
  }

  function saveLocal() {
    if (!newLocalForm.nome) { onToast("⚠️ Informe o nome do local!"); return; }
    const novo: Local = {
      id: "l" + Date.now(), nome: newLocalForm.nome,
      parentId: showLocalForm!.parentId, tipo: newLocalForm.tipo, descricao: newLocalForm.descricao
    };
    setLocais(p => [...p, novo]);
    if (showLocalForm!.parentId) {
      setExpandedNodes(prev => { const next = new Set(Array.from(prev)); next.add(showLocalForm!.parentId!); return next; });
    }
    setShowLocalForm(null);
    onToast(`✅ Local "${novo.nome}" criado!`);
  }

  function deleteLocal(id: string) {
    const children = locais.filter(l => l.parentId === id);
    if (children.length > 0) { onToast("⚠️ Remova os filhos antes!"); return; }
    setLocais(p => p.filter(l => l.id !== id));
    if (selectedLocal === id) setSelectedLocal(null);
    onToast("🗑 Local removido");
  }

  function selectAtividade(atId: string) {
    const at = atividades.find(a => a.id === atId);
    if (!at) return;
    setForm(p => ({...p, atividadeId: atId, acoes: [...at.acoes], materiais: [...at.materiais], hhEstimado: at.duracaoHH, tipo: at.tipo}));
  }

  function saveOS() {
    if (!form.titulo) { onToast("⚠️ Informe o título!"); return; }
    if (!form.localId) { onToast("⚠️ Selecione um local!"); return; }
    if (!form.responsavel) { onToast("⚠️ Informe o responsável!"); return; }
    if (!form.proxExecucao) { onToast("⚠️ Informe a próxima execução!"); return; }

    const id = `OSP-${String(osPrev.length + 1).padStart(3,'0')}`;
    const nova: OSPreventiva = {
      ...form as OSPreventiva, id,
      criadoEm: new Date().toISOString().split("T")[0],
      acoes: form.acoes || [], materiais: form.materiais || [],
    };
    setOsPrev(p => [...p, nova]);
    setShowForm(false);
    setForm({tipo:"pmoc",recorrencia:"mensal",prioridade:"media",ativo:true,acoes:[],materiais:[],obs:"",hhEstimado:4});
    onToast(`✅ ${id} criada com sucesso!`);
    if (onAddOSToPlanning) onAddOSToPlanning(nova);
  }

  const osFiltradas = useMemo(() => {
    return osPrev.filter(os =>
      (!filterTipo || os.tipo === filterTipo) &&
      (!filterPrio || os.prioridade === filterPrio)
    ).sort((a,b) => {
      const p = {critica:4,alta:3,media:2,baixa:1};
      return p[b.prioridade] - p[a.prioridade];
    });
  }, [osPrev, filterTipo, filterPrio]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22}}>🔧 OS Preventivas</h2>
          <p style={{fontSize:12,color:S.muted,marginTop:2}}>PMOC · Civil · Elétrica · Hidráulica</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{...btn("linear-gradient(135deg,#10b981,#059669)"),padding:"10px 22px",borderRadius:12,boxShadow:"0 0 20px rgba(16,185,129,0.25)",fontSize:14}}>
          + Nova OS Preventiva
        </button>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:6}}>
        {([["os","📋 OS Preventivas"],["locais","🌳 Locais de Serviço"],["atividades","⚙️ Modelos de Atividade"]] as [typeof tab, string][]).map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            background:tab===id?"rgba(0,212,255,0.12)":"rgba(255,255,255,0.03)",
            border:`1px solid ${tab===id?"rgba(0,212,255,0.35)":S.border}`,
            color:tab===id?"#00d4ff":S.muted, borderRadius:8, padding:"8px 18px",
            cursor:"pointer", fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:tab===id?600:400,
          }}>{l}</button>
        ))}
      </div>

      {/* ─── TAB: OS PREVENTIVAS ─── */}
      {tab==="os"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
            {[
              {l:"Total",v:osPrev.length,c:"#00d4ff"},
              {l:"Ativas",v:osPrev.filter(o=>o.ativo).length,c:"#10b981"},
              {l:"PMOC",v:osPrev.filter(o=>o.tipo==="pmoc").length,c:"#00d4ff"},
              {l:"Civil",v:osPrev.filter(o=>o.tipo==="civil").length,c:"#f97316"},
              {l:"Elétrica",v:osPrev.filter(o=>o.tipo==="eletrica").length,c:"#eab308"},
              {l:"Hidráulica",v:osPrev.filter(o=>o.tipo==="hidraulica").length,c:"#3b82f6"},
            ].map((k,i)=>(
              <div key={i} style={{...card(),padding:14}}>
                <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{k.l}</div>
                <div style={{fontSize:26,fontWeight:800,color:k.c,fontFamily:"Syne,sans-serif"}}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div style={{...card(),padding:14,display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            {[
              {l:"Tipo",v:filterTipo,fn:setFilterTipo,opts:[["","Todos"],[...Object.entries(TIPO_LABELS).map(([k,v])=>[k,v])].flat()].flat() as any},
              {l:"Prioridade",v:filterPrio,fn:setFilterPrio,opts:[["","Todas"],["critica","Crítica"],["alta","Alta"],["media","Média"],["baixa","Baixa"]]},
            ].map((f,i)=>(
              <div key={i}>
                <div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
                <select value={f.v} onChange={e=>f.fn(e.target.value)} style={{...inp,width:"auto",minWidth:130}}>
                  {f.opts.map(([v,l]:any)=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Lista */}
          <div style={{...card(),overflow:"hidden"}}>
            <div style={{padding:"12px 20px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:13}}>Ordens Preventivas <span style={{color:"#00d4ff",fontFamily:"DM Mono,monospace"}}>({osFiltradas.length})</span></span>
            </div>
            {osFiltradas.map(os=>{
              const local = locais.find(l=>l.id===os.localId);
              const breadcrumb = os.localId ? getBreadcrumb(os.localId) : "—";
              return(
                <div key={os.id} style={{padding:16,borderBottom:`1px solid rgba(99,179,237,0.06)`,display:"grid",gridTemplateColumns:"auto 1fr auto",gap:16,alignItems:"start"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,212,255,0.02)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                  {/* Left */}
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",width:80}}>
                    <div style={{padding:"4px 10px",borderRadius:20,background:TIPO_COLORS[os.tipo]+"20",border:`1px solid ${TIPO_COLORS[os.tipo]}40`,color:TIPO_COLORS[os.tipo],fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{TIPO_LABELS[os.tipo]}</div>
                    <div style={{padding:"2px 8px",borderRadius:20,background:PRIO_COLORS[os.prioridade]+"20",border:`1px solid ${PRIO_COLORS[os.prioridade]}40`,color:PRIO_COLORS[os.prioridade],fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{os.prioridade}</div>
                    <div style={{fontSize:9,color:S.muted,textAlign:"center"}}>{REC_LABELS[os.recorrencia]}</div>
                  </div>
                  {/* Middle */}
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"#10b981"}}>{os.id}</span>
                      <span style={{fontWeight:600,fontSize:13}}>{os.titulo}</span>
                      {!os.ativo&&<span style={{fontSize:9,background:"rgba(107,114,128,0.2)",color:"#9ca3af",padding:"1px 6px",borderRadius:4}}>INATIVA</span>}
                    </div>
                    <div style={{fontSize:11,color:S.muted,marginBottom:6}}>📍 {breadcrumb}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {os.acoes.slice(0,3).map((a,i)=>(
                        <span key={i} style={{fontSize:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,padding:"2px 8px",borderRadius:4,color:"rgba(255,255,255,0.5)"}}>✓ {a.substring(0,30)}</span>
                      ))}
                      {os.acoes.length>3&&<span style={{fontSize:10,color:S.muted}}>+{os.acoes.length-3} ações</span>}
                    </div>
                  </div>
                  {/* Right */}
                  <div style={{textAlign:"right",minWidth:120}}>
                    <div style={{fontSize:10,color:S.muted,marginBottom:4}}>Próx. execução</div>
                    <div style={{fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:700,color:"#00d4ff"}}>{os.proxExecucao}</div>
                    <div style={{fontSize:11,color:S.muted,marginTop:4}}>{os.hhEstimado}h · {os.responsavel.split(" ")[0]}</div>
                    <div style={{display:"flex",gap:4,marginTop:8,justifyContent:"flex-end"}}>
                      <button onClick={()=>{setOsPrev(p=>p.map(o=>o.id===os.id?{...o,ativo:!o.ativo}:o));onToast(`${os.ativo?"⏸":"▶"} OS ${os.ativo?"desativada":"ativada"}`);}} style={{...btn(os.ativo?"rgba(107,114,128,0.15)":"rgba(16,185,129,0.15)",os.ativo?"#9ca3af":"#10b981"),padding:"4px 10px",fontSize:10,border:`1px solid ${os.ativo?"rgba(107,114,128,0.2)":"rgba(16,185,129,0.2)"}`}}>{os.ativo?"Pausar":"Ativar"}</button>
                      <button onClick={()=>{setOsPrev(p=>p.filter(o=>o.id!==os.id));onToast("🗑 OS removida");}} style={{...btn("rgba(239,68,68,0.1)","#ef4444"),padding:"4px 10px",fontSize:10,border:"1px solid rgba(239,68,68,0.2)"}}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {osFiltradas.length===0&&<div style={{padding:40,textAlign:"center",color:S.muted}}><div style={{fontSize:40,marginBottom:12}}>🔧</div><p style={{fontSize:14}}>Nenhuma OS preventiva encontrada</p></div>}
          </div>
        </div>
      )}

      {/* ─── TAB: LOCAIS ─── */}
      {tab==="locais"&&(
        <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:16}}>
          {/* Árvore */}
          <div style={{...card(),overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700,fontSize:13}}>🌳 Árvore de Locais</span>
              <button onClick={()=>addLocal(null)} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),padding:"4px 10px",fontSize:11,border:"1px solid rgba(0,212,255,0.25)"}}>+ Raiz</button>
            </div>
            <div style={{padding:12,maxHeight:500,overflowY:"auto"}}>
              <style>{`.tree-actions{opacity:0!important} div:hover>.tree-actions{opacity:1!important}`}</style>
              {rootLocais.map(local=>(
                <TreeNode key={local.id} local={local} locais={locais} level={0} selected={selectedLocal}
                  onSelect={setSelectedLocal} onAdd={addLocal} onDelete={deleteLocal}
                  expanded={expandedNodes} onToggle={toggleNode}/>
              ))}
            </div>
          </div>

          {/* Detalhe do local selecionado */}
          <div style={{...card(),padding:20}}>
            {selectedLocal ? (()=>{
              const local = locais.find(l=>l.id===selectedLocal)!;
              const breadcrumb = getBreadcrumb(selectedLocal);
              const children = locais.filter(l=>l.parentId===selectedLocal);
              const osCount = osPrev.filter(o=>o.localId===selectedLocal).length;
              return(
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"#00d4ff",marginBottom:4}}>{local.id}</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:20}}>{local.nome}</div>
                      <div style={{fontSize:12,color:S.muted,marginTop:4}}>📍 {breadcrumb}</div>
                    </div>
                    <button onClick={()=>addLocal(selectedLocal)} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),border:"1px solid rgba(0,212,255,0.25)"}}>+ Adicionar filho</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    {[{l:"Tipo",v:local.tipo||"—"},{l:"Filhos",v:children.length},{l:"OS Preventivas",v:osCount}].map((k,i)=>(
                      <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,borderRadius:10,padding:12}}>
                        <div style={{fontSize:10,color:S.muted,marginBottom:4,textTransform:"uppercase"}}>{k.l}</div>
                        <div style={{fontSize:18,fontWeight:700,color:"#00d4ff",fontFamily:"Syne,sans-serif"}}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                  {children.length>0&&(
                    <div>
                      <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase"}}>Locais filhos</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {children.map(c=>(
                          <button key={c.id} onClick={()=>setSelectedLocal(c.id)} style={{...btn("rgba(0,212,255,0.08)","#00d4ff"),padding:"5px 12px",fontSize:11,border:"1px solid rgba(0,212,255,0.2)"}}>
                            {c.nome}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {osCount>0&&(
                    <div>
                      <div style={{fontSize:11,color:S.muted,marginBottom:8,textTransform:"uppercase"}}>OS Preventivas neste local</div>
                      {osPrev.filter(o=>o.localId===selectedLocal).map(os=>(
                        <div key={os.id} style={{padding:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,borderRadius:8,marginBottom:6}}>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"#10b981"}}>{os.id}</span>
                            <span style={{fontSize:12}}>{os.titulo}</span>
                            <span style={{marginLeft:"auto",fontSize:9,padding:"2px 8px",background:TIPO_COLORS[os.tipo]+"20",color:TIPO_COLORS[os.tipo],borderRadius:20,fontWeight:700}}>{TIPO_LABELS[os.tipo]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })() : (
              <div style={{textAlign:"center",padding:40,color:S.muted}}>
                <div style={{fontSize:40,marginBottom:12}}>🌳</div>
                <p style={{fontSize:14,fontWeight:600,marginBottom:6}}>Selecione um local na árvore</p>
                <p style={{fontSize:12}}>Clique em qualquer nó para ver detalhes</p>
                <button onClick={()=>addLocal(null)} style={{...btn("rgba(0,212,255,0.1)","#00d4ff"),border:"1px solid rgba(0,212,255,0.25)",marginTop:16}}>+ Adicionar local raiz</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: ATIVIDADES ─── */}
      {tab==="atividades"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:12}}>
          {atividades.map(at=>(
            <div key={at.id} style={{...card(),padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:20,background:TIPO_COLORS[at.tipo]+"20",color:TIPO_COLORS[at.tipo],border:`1px solid ${TIPO_COLORS[at.tipo]}40`,fontWeight:700,textTransform:"uppercase",display:"inline-block",marginBottom:6}}>{TIPO_LABELS[at.tipo]}</span>
                  <div style={{fontWeight:600,fontSize:13}}>{at.nome}</div>
                  <div style={{fontSize:11,color:S.muted,marginTop:3}}>{at.descricao}</div>
                </div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"#00d4ff",fontWeight:700,whiteSpace:"nowrap",marginLeft:12}}>{at.duracaoHH}h</div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>✓ Ações ({at.acoes.length})</div>
                {at.acoes.slice(0,4).map((a,i)=>(
                  <div key={i} style={{fontSize:11,color:"rgba(255,255,255,0.6)",padding:"2px 0",display:"flex",gap:6}}>
                    <span style={{color:TIPO_COLORS[at.tipo]}}>›</span>{a}
                  </div>
                ))}
                {at.acoes.length>4&&<div style={{fontSize:10,color:S.muted}}>+{at.acoes.length-4} mais...</div>}
              </div>
              {at.materiais.length>0&&(
                <div>
                  <div style={{fontSize:10,color:S.muted,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>📦 Materiais ({at.materiais.length})</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {at.materiais.map((m,i)=>(
                      <span key={i} style={{fontSize:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,padding:"2px 7px",borderRadius:4,color:"rgba(255,255,255,0.5)"}}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={()=>{setForm(p=>({...p,atividadeId:at.id,tipo:at.tipo,hhEstimado:at.duracaoHH,acoes:[...at.acoes],materiais:[...at.materiais]}));setShowForm(true);}} style={{...btn("rgba(16,185,129,0.1)","#10b981"),width:"100%",marginTop:14,border:"1px solid rgba(16,185,129,0.25)",padding:"8px"}}>
                + Criar OS com este modelo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL NOVO LOCAL ─── */}
      {showLocalForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,backdropFilter:"blur(6px)"}} onClick={()=>setShowLocalForm(null)}>
          <div style={{background:S.surf,borderRadius:16,width:420,padding:24,boxShadow:"0 40px 80px rgba(0,0,0,0.6)",border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:18,marginBottom:16}}>+ Novo Local de Serviço</div>
            {showLocalForm.parentId&&<div style={{fontSize:11,color:"#00d4ff",marginBottom:12,padding:"6px 10px",background:"rgba(0,212,255,0.06)",borderRadius:6}}>Filho de: {getBreadcrumb(showLocalForm.parentId)}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Nome *</div><input value={newLocalForm.nome} onChange={e=>setNewLocalForm(p=>({...p,nome:e.target.value}))} placeholder="Ex: Sala do Coordenador" style={inp} autoFocus/></div>
              <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Tipo</div>
                <select value={newLocalForm.tipo} onChange={e=>setNewLocalForm(p=>({...p,tipo:e.target.value}))} style={inp}>
                  {[["edificio","🏢 Edifício"],["bloco","🏗 Bloco/Ala"],["andar","📐 Andar/Nível"],["sala","🚪 Sala/Ambiente"],["sistema","⚙️ Sistema/Equipamento"],["area","🌿 Área Externa"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Descrição</div><input value={newLocalForm.descricao} onChange={e=>setNewLocalForm(p=>({...p,descricao:e.target.value}))} placeholder="Descrição opcional" style={inp}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={()=>setShowLocalForm(null)} style={{flex:1,...btn("rgba(255,255,255,0.05)","rgba(255,255,255,0.5)"),border:`1px solid ${S.border}`}}>Cancelar</button>
              <button onClick={saveLocal} style={{flex:2,...btn("linear-gradient(135deg,#00d4ff,#3b82f6)")}}>✅ Criar Local</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL NOVA OS PREVENTIVA ─── */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16,backdropFilter:"blur(6px)"}} onClick={()=>setShowForm(false)}>
          <div style={{background:S.surf,borderRadius:20,maxWidth:700,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.6)",border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:24,background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(59,130,246,0.08))",borderRadius:"20px 20px 0 0",borderBottom:`1px solid ${S.border}`,display:"flex",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18}}>+ Nova OS Preventiva</div>
                <div style={{fontSize:12,color:S.muted,marginTop:3}}>PMOC · Civil · Elétrica · Hidráulica</div>
              </div>
              <button onClick={()=>setShowForm(false)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${S.border}`,borderRadius:8,width:32,height:32,cursor:"pointer",color:S.muted,fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
              {/* Tipo */}
              <div>
                <div style={{fontSize:10,color:S.muted,marginBottom:8,textTransform:"uppercase",fontWeight:600}}>Tipo de Preventiva *</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {(Object.entries(TIPO_LABELS) as [TipoPreventiva,string][]).map(([t,l])=>(
                    <button key={t} onClick={()=>setForm(p=>({...p,tipo:t}))} style={{
                      background:form.tipo===t?`${TIPO_COLORS[t]}20`:"rgba(255,255,255,0.03)",
                      border:`1px solid ${form.tipo===t?`${TIPO_COLORS[t]}50`:S.border}`,
                      color:form.tipo===t?TIPO_COLORS[t]:"rgba(255,255,255,0.5)",
                      borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:form.tipo===t?700:400
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Modelo de Atividade */}
              <div>
                <div style={{fontSize:10,color:S.muted,marginBottom:8,textTransform:"uppercase",fontWeight:600}}>Modelo de Atividade (opcional)</div>
                <select onChange={e=>selectAtividade(e.target.value)} value={form.atividadeId||""} style={inp}>
                  <option value="">Selecionar modelo ou preencher manualmente</option>
                  {atividades.filter(a=>!form.tipo||a.tipo===form.tipo||form.tipo==="outro").map(a=>(
                    <option key={a.id} value={a.id}>{a.nome} ({a.duracaoHH}h)</option>
                  ))}
                </select>
              </div>

              {/* Título + Local */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Título *</div><input value={form.titulo||""} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} placeholder="Ex: PMOC Mensal — HVAC Torre A" style={inp}/></div>
                <div>
                  <div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Local de Serviço *</div>
                  <select value={form.localId||""} onChange={e=>setForm(p=>({...p,localId:e.target.value}))} style={inp}>
                    <option value="">Selecionar local...</option>
                    {(function renderOptions(parentId: string|null, level: number): React.ReactNode[] {
                      return locais.filter(l=>l.parentId===parentId).flatMap(l=>[
                        <option key={l.id} value={l.id}>{"\u00A0".repeat(level*2)}{level>0?"└ ":""}{l.nome}</option>,
                        ...renderOptions(l.id,level+1)
                      ]);
                    })(null,0)}
                  </select>
                  {form.localId&&<div style={{fontSize:10,color:"#00d4ff",marginTop:4}}>📍 {getBreadcrumb(form.localId)}</div>}
                </div>
              </div>

              {/* Responsável + HH + Prioridade + Recorrência */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
                <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Responsável *</div><input value={form.responsavel||""} onChange={e=>setForm(p=>({...p,responsavel:e.target.value}))} placeholder="Nome" style={inp}/></div>
                <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>HH Estimado</div><input type="number" min="1" value={form.hhEstimado||4} onChange={e=>setForm(p=>({...p,hhEstimado:+e.target.value}))} style={inp}/></div>
                <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Prioridade</div>
                  <select value={form.prioridade} onChange={e=>setForm(p=>({...p,prioridade:e.target.value as PrioridadeOS}))} style={inp}>
                    {[["critica","Crítica"],["alta","Alta"],["media","Média"],["baixa","Baixa"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Recorrência</div>
                  <select value={form.recorrencia} onChange={e=>setForm(p=>({...p,recorrencia:e.target.value as Recorrencia}))} style={inp}>
                    {Object.entries(REC_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Próxima Execução *</div><input type="date" value={form.proxExecucao||""} onChange={e=>setForm(p=>({...p,proxExecucao:e.target.value}))} style={inp}/></div>

              {/* Ações */}
              <div>
                <div style={{fontSize:10,color:S.muted,marginBottom:8,textTransform:"uppercase",fontWeight:600}}>Ações a Executar ({(form.acoes||[]).length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8,maxHeight:150,overflowY:"auto"}}>
                  {(form.acoes||[]).map((a,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,borderRadius:6}}>
                      <span style={{color:"#10b981",fontSize:12}}>✓</span>
                      <span style={{flex:1,fontSize:12}}>{a}</span>
                      <button onClick={()=>setForm(p=>({...p,acoes:(p.acoes||[]).filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:12}}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={acoesInput} onChange={e=>setAcoesInput(e.target.value)} placeholder="Adicionar ação..." style={{...inp,flex:1}}
                    onKeyDown={e=>{if(e.key==="Enter"&&acoesInput.trim()){setForm(p=>({...p,acoes:[...(p.acoes||[]),acoesInput.trim()]}));setAcoesInput("");}}}/>
                  <button onClick={()=>{if(acoesInput.trim()){setForm(p=>({...p,acoes:[...(p.acoes||[]),acoesInput.trim()]}));setAcoesInput("");}}} style={{...btn("rgba(16,185,129,0.15)","#10b981"),border:"1px solid rgba(16,185,129,0.3)",whiteSpace:"nowrap"}}>+ Ação</button>
                </div>
              </div>

              {/* Materiais */}
              <div>
                <div style={{fontSize:10,color:S.muted,marginBottom:8,textTransform:"uppercase",fontWeight:600}}>Materiais Necessários ({(form.materiais||[]).length})</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                  {(form.materiais||[]).map((m,i)=>(
                    <span key={i} style={{fontSize:11,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,padding:"3px 8px",borderRadius:6,display:"flex",gap:6,alignItems:"center"}}>
                      📦 {m} <button onClick={()=>setForm(p=>({...p,materiais:(p.materiais||[]).filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:10}}>✕</button>
                    </span>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={materiaisInput} onChange={e=>setMateriaisInput(e.target.value)} placeholder="Adicionar material..." style={{...inp,flex:1}}
                    onKeyDown={e=>{if(e.key==="Enter"&&materiaisInput.trim()){setForm(p=>({...p,materiais:[...(p.materiais||[]),materiaisInput.trim()]}));setMateriaisInput("");}}}/>
                  <button onClick={()=>{if(materiaisInput.trim()){setForm(p=>({...p,materiais:[...(p.materiais||[]),materiaisInput.trim()]}));setMateriaisInput("");}}} style={{...btn("rgba(59,130,246,0.15)","#60a5fa"),border:"1px solid rgba(59,130,246,0.3)",whiteSpace:"nowrap"}}>+ Material</button>
                </div>
              </div>

              <div><div style={{fontSize:10,color:S.muted,marginBottom:5,textTransform:"uppercase"}}>Observações</div><input value={form.obs||""} onChange={e=>setForm(p=>({...p,obs:e.target.value}))} placeholder="Normas, referências, contratos..." style={inp}/></div>

              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,...btn("rgba(255,255,255,0.05)","rgba(255,255,255,0.5)"),border:`1px solid ${S.border}`}}>Cancelar</button>
                <button onClick={saveOS} style={{flex:2,...btn("linear-gradient(135deg,#10b981,#059669)"),boxShadow:"0 0 20px rgba(16,185,129,0.25)",fontSize:14}}>✅ Criar OS Preventiva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
