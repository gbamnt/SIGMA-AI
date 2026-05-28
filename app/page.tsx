"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

const OS_DATA = [
  { id: 1, numero: "OS-1052", descricao: "Cobertura vazamento", criticidade: "critica", status: "aberta", dataPrevista: "2025-02-15", hh: 12, responsavel: "João", atraso: 2, score: 8.5, risco: 95, urgencia: 90, impacto: 85 },
  { id: 2, numero: "OS-1048", descricao: "Bombas HVAC Zona 2", criticidade: "alta", status: "planejada", dataPrevista: "2025-02-20", hh: 8, responsavel: "Maria", atraso: 0, score: 7.8, risco: 75, urgencia: 70, impacto: 65 },
  { id: 3, numero: "OS-1061", descricao: "Limpeza filtros HVAC", criticidade: "media", status: "aberta", dataPrevista: "2025-02-28", hh: 6, responsavel: "Pedro", atraso: 0, score: 5.5, risco: 45, urgencia: 40, impacto: 35 },
  { id: 4, numero: "OS-1039", descricao: "Vazamento emergencial", criticidade: "critica", status: "execucao", dataPrevista: "2025-02-10", hh: 16, responsavel: "Ana", atraso: -1, score: 9.2, risco: 98, urgencia: 95, impacto: 90 },
  { id: 5, numero: "OS-1055", descricao: "Inspeção estrutural", criticidade: "critica", status: "aberta", dataPrevista: "2025-03-08", hh: 20, responsavel: "Carlos", atraso: 0, score: 8.8, risco: 92, urgencia: 85, impacto: 88 },
  { id: 6, numero: "OS-1050", descricao: "Manutenção elevadores", criticidade: "alta", status: "planejada", dataPrevista: "2025-02-25", hh: 10, responsavel: "João", atraso: 0, score: 7.2, risco: 70, urgencia: 65, impacto: 60 },
  { id: 7, numero: "OS-1063", descricao: "Pintura paredes externas", criticidade: "baixa", status: "aberta", dataPrevista: "2025-03-15", hh: 5, responsavel: "Maria", atraso: 0, score: 3.8, risco: 20, urgencia: 15, impacto: 20 },
];

const CRIT_COLORS: Record<string, string> = { critica: "#ef4444", alta: "#f97316", media: "#eab308", baixa: "#22c55e" };
const STATUS_COLORS: Record<string, string> = { aberta: "#3b82f6", planejada: "#8b5cf6", execucao: "#06b6d4", concluida: "#10b981" };

export default function SigmaAI() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("todas");
  const [fCrit, setFCrit] = useState("todas");
  const [sortBy, setSortBy] = useState("score");
  const [modal, setModal] = useState<typeof OS_DATA[0] | null>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [showIA, setShowIA] = useState(true);

  const filtered = useMemo(() => {
    return OS_DATA
      .filter(o => (o.numero + o.descricao).toLowerCase().includes(search.toLowerCase()))
      .filter(o => fStatus === "todas" || o.status === fStatus)
      .filter(o => fCrit === "todas" || o.criticidade === fCrit)
      .sort((a, b) => sortBy === "score" ? b.score - a.score : sortBy === "hh" ? b.hh - a.hh : b.atraso - a.atraso);
  }, [search, fStatus, fCrit, sortBy]);

  const kpis = {
    total: OS_DATA.length,
    abertas: OS_DATA.filter(o => o.status === "aberta").length,
    criticas: OS_DATA.filter(o => o.criticidade === "critica").length,
    score: (OS_DATA.reduce((s, o) => s + o.score, 0) / OS_DATA.length).toFixed(1),
    hh: OS_DATA.reduce((s, o) => s + o.hh, 0),
  };

  const curvaS = [
    { s: "S1", plan: 10, real: 8 }, { s: "S2", plan: 20, real: 18 },
    { s: "S3", plan: 35, real: 30 }, { s: "S4", plan: 50, real: 44 },
  ];
  const tend = [
    { m: "Jan", ab: 12, co: 8, at: 2 }, { m: "Fev", ab: 15, co: 10, at: 3 },
    { m: "Mar", ab: 10, co: 13, at: 1 },
  ];
  const pie = [{ name: "Preventiva", value: 60 }, { name: "Corretiva", value: 40 }];

  const bg = dark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const card = dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const inp = dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {/* NAVBAR */}
      <nav className={`${card} border-b sticky top-0 z-50 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">Σ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">SIGMA AI</h1>
              <p className="text-xs opacity-50">Manutenção Inteligente</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">● Live</span>
            <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${card} border transition`}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { l: "Total OS", v: kpis.total, e: "📋", c: "blue" },
            { l: "Abertas", v: kpis.abertas, e: "🔵", c: "orange" },
            { l: "Críticas", v: kpis.criticas, e: "🔴", c: "red" },
            { l: "Score Médio", v: kpis.score, e: "⭐", c: "purple" },
            { l: "HH Total", v: kpis.hh + "h", e: "⏱️", c: "green" },
          ].map((k, i) => (
            <div key={i} className={`${card} border rounded-2xl p-4 hover:shadow-md transition`}>
              <div className="flex justify-between items-start">
                <p className="text-xs opacity-60 mb-1">{k.l}</p>
                <span className="text-2xl">{k.e}</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{k.v}</p>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className={`${card} border rounded-2xl p-4`}>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <p className="text-xs opacity-60 mb-1">🔍 Buscar</p>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="OS ou descrição..." className={`w-full px-3 py-2 rounded-lg border ${inp} text-sm outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            {[
              { l: "Status", v: fStatus, fn: setFStatus, opts: [["todas", "Todos"], ["aberta", "Aberta"], ["planejada", "Planejada"], ["execucao", "Execução"]] },
              { l: "Criticidade", v: fCrit, fn: setFCrit, opts: [["todas", "Todas"], ["critica", "Crítica"], ["alta", "Alta"], ["media", "Média"], ["baixa", "Baixa"]] },
              { l: "Ordenar", v: sortBy, fn: setSortBy, opts: [["score", "Score"], ["hh", "HH"], ["atraso", "Atraso"]] },
            ].map((f, i) => (
              <div key={i}>
                <p className="text-xs opacity-60 mb-1">{f.l}</p>
                <select value={f.v} onChange={e => f.fn(e.target.value)} className={`px-3 py-2 rounded-lg border ${inp} text-sm outline-none`}>
                  {f.opts.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowCharts(!showCharts)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-sm">
            📊 {showCharts ? "Ocultar" : "Mostrar"} Gráficos
          </button>
          <button onClick={() => setShowIA(!showIA)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition shadow-sm">
            🧠 {showIA ? "Ocultar" : "Mostrar"} Inteligência
          </button>
          <button onClick={() => {
            const csv = "Numero,Descricao,Criticidade,Status,Score,HH,Responsavel\n" + filtered.map(o => `${o.numero},"${o.descricao}",${o.criticidade},${o.status},${o.score},${o.hh},${o.responsavel}`).join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"})); a.download = "sigma-ai.csv"; a.click();
          }} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition shadow-sm">
            📥 Exportar CSV
          </button>
        </div>

        {/* GRÁFICOS */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${card} border rounded-2xl p-5`}>
              <h3 className="font-bold mb-4">📈 Curva S — Planejado vs Realizado</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={curvaS}>
                  <defs>
                    <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="s"/><YAxis/><Tooltip/><Legend/>
                  <Area type="monotone" dataKey="plan" name="Planejado" stroke="#3b82f6" fill="url(#gP)" strokeWidth={2}/>
                  <Area type="monotone" dataKey="real" name="Realizado" stroke="#ef4444" fill="url(#gR)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={`${card} border rounded-2xl p-5`}>
              <h3 className="font-bold mb-4">📊 Tendência Mensal</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={tend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="m"/><YAxis/><Tooltip/><Legend/>
                  <Line type="monotone" dataKey="ab" name="Abertas" stroke="#ef4444" strokeWidth={2} dot={{r:4}}/>
                  <Line type="monotone" dataKey="co" name="Concluídas" stroke="#10b981" strokeWidth={2} dot={{r:4}}/>
                  <Line type="monotone" dataKey="at" name="Atrasos" stroke="#f97316" strokeWidth={2} dot={{r:4}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`${card} border rounded-2xl p-5`}>
              <h3 className="font-bold mb-4">🔧 Preventiva vs Corretiva</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,value}) => `${name}: ${value}%`}>
                    <Cell fill="#10b981"/><Cell fill="#ef4444"/>
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={`${card} border rounded-2xl p-5`}>
              <h3 className="font-bold mb-4">📌 Score por OS</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={OS_DATA.map(o => ({name: o.numero.replace("OS-",""), score: o.score}))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="name"/><YAxis domain={[0,10]}/><Tooltip/>
                  <Bar dataKey="score" name="Score" radius={[6,6,0,0]}>
                    {OS_DATA.map((o,i) => <Cell key={i} fill={o.score>=8?"#ef4444":o.score>=6?"#f97316":"#22c55e"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* INTELIGÊNCIA */}
        {showIA && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${card} border-2 border-red-400 rounded-2xl p-5`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">🚨 Conflitos & Riscos</h3>
              <div className="space-y-3">
                {OS_DATA.filter(o => o.atraso > 0 || o.criticidade === "critica").map((o,i) => (
                  <div key={i} className={`p-3 rounded-xl border-l-4 border-red-400 ${dark?"bg-red-900/20":"bg-red-50"}`}>
                    <div className="flex justify-between">
                      <span className="font-semibold text-red-500 text-sm">{o.atraso > 0 ? "⏱️ Atraso" : "🔴 Crítica"}</span>
                      <span className="font-bold text-red-500">{o.score}/10</span>
                    </div>
                    <p className="text-sm opacity-70 mt-1">{o.numero}: {o.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${card} border-2 border-green-400 rounded-2xl p-5`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">💡 Recomendações IA</h3>
              <div className="space-y-2">
                {[
                  ["🔴","Priorizar OS-1039 (Vazamento emergencial)"],
                  ["⚠️","Alocar mais recursos para OS-1052"],
                  ["📊","Carlos: 20HH em uma OS — redistribuir"],
                  ["⏰","OS-1048 com risco de atraso iminente"],
                  ["✅","OS-1061 e OS-1063 estão no prazo"],
                ].map(([icon, txt], i) => (
                  <div key={i} className={`p-3 rounded-xl flex gap-3 ${dark?"bg-green-900/20":"bg-green-50"}`}>
                    <span>{icon}</span>
                    <p className="text-sm">{txt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TABELA */}
        <div className={`${card} border rounded-2xl overflow-hidden shadow-sm`}>
          <div className="px-6 py-4 border-b">
            <h2 className="font-bold text-lg">📋 Ordens de Serviço <span className="text-blue-500 ml-2">({filtered.length})</span></h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={dark?"bg-gray-700":"bg-gray-50"}>
                <tr>{["ID","Descrição","Criticidade","Status","Score","Responsável","Ação"].map(h=><th key={h} className="text-left px-4 py-3 font-semibold opacity-70">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={`border-t ${dark?"border-gray-700 hover:bg-gray-700":"border-gray-100 hover:bg-gray-50"} transition`}>
                    <td className="px-4 py-3 font-mono font-bold text-blue-500">{o.numero}</td>
                    <td className="px-4 py-3">{o.descricao}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-white text-xs font-bold" style={{background:CRIT_COLORS[o.criticidade]}}>{o.criticidade}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-white text-xs font-bold" style={{background:STATUS_COLORS[o.status]}}>{o.status}</span></td>
                    <td className="px-4 py-3 font-bold">{o.score} {o.score>=8?"🔴":o.score>=6?"🟠":"🟢"}</td>
                    <td className="px-4 py-3">{o.responsavel}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>setModal(o)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition">
                        Detalhes →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={()=>setModal(null)}>
          <div className={`${card} rounded-2xl max-w-lg w-full shadow-2xl`} onClick={e=>e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between">
              <h2 className="text-xl font-bold">{modal.numero}</h2>
              <button onClick={()=>setModal(null)} className="text-2xl opacity-50 hover:opacity-100">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="opacity-50 mb-1">Descrição</p><p className="font-semibold">{modal.descricao}</p></div>
                <div><p className="opacity-50 mb-1">Responsável</p><p className="font-semibold">{modal.responsavel}</p></div>
                <div><p className="opacity-50 mb-1">Criticidade</p><span className="px-2 py-1 rounded-full text-white text-xs font-bold" style={{background:CRIT_COLORS[modal.criticidade]}}>{modal.criticidade}</span></div>
                <div><p className="opacity-50 mb-1">Data Prevista</p><p className="font-semibold">{modal.dataPrevista}</p></div>
                <div><p className="opacity-50 mb-1">HH Planejado</p><p className="font-semibold">{modal.hh}h</p></div>
                <div><p className="opacity-50 mb-1">Atraso</p><p className={`font-semibold ${modal.atraso>0?"text-red-500":"text-green-500"}`}>{modal.atraso===0?"✅ No prazo":modal.atraso>0?`${modal.atraso}d atrasada`:`${Math.abs(modal.atraso)}d adiantada`}</p></div>
              </div>
              <div className={`p-4 rounded-xl ${dark?"bg-blue-900/30":"bg-blue-50"} border-l-4 border-blue-500`}>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-sm">Score Sigma™</p>
                  <p className="text-3xl font-bold text-blue-600">{modal.score}/10</p>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width:`${modal.score*10}%`}}/>
                </div>
                <p className="text-xs">{modal.score>=8?"🔴 Crítico — atenção imediata":modal.score>=6?"🟠 Alto — monitorar":"🟢 Normal"}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["Risco","bg-red-500",modal.risco],["Urgência","bg-orange-500",modal.urgencia],["Impacto","bg-yellow-500",modal.impacto]].map(([l,c,v],i)=>(
                  <div key={i}>
                    <p className="text-xs opacity-50 mb-1">{l}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${c} h-2 rounded-full`} style={{width:`${v}%`}}/>
                    </div>
                    <p className="text-xs font-bold mt-1">{v}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
