const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Usuários
  const u1 = await prisma.usuario.upsert({ where: { email: "admin@sigma.ai" }, update: {}, create: { nome: "Gabriel Lucas", email: "admin@sigma.ai", role: "admin", setor: "Diretoria", avatar: "GL" } });
  const u2 = await prisma.usuario.upsert({ where: { email: "gestor@sigma.ai" }, update: {}, create: { nome: "Maria Costa", email: "gestor@sigma.ai", role: "gestor", setor: "Manutenção", avatar: "MC" } });
  const u3 = await prisma.usuario.upsert({ where: { email: "tecnico@sigma.ai" }, update: {}, create: { nome: "João Silva", email: "tecnico@sigma.ai", role: "tecnico", setor: "Operações", avatar: "JS" } });
  console.log("✅ Usuários criados");

  // Locais
  const lEd = await prisma.local.upsert({ where: { id: "l-edificio" }, update: {}, create: { id: "l-edificio", nome: "Edifício Principal", parentId: null, tipo: "edificio" } });
  const lAdm = await prisma.local.upsert({ where: { id: "l-adm" }, update: {}, create: { id: "l-adm", nome: "ADM", parentId: "l-edificio", tipo: "bloco" } });
  const lTerreo = await prisma.local.upsert({ where: { id: "l-terreo" }, update: {}, create: { id: "l-terreo", nome: "Térreo ADM", parentId: "l-adm", tipo: "andar" } });
  const l1and = await prisma.local.upsert({ where: { id: "l-1andar" }, update: {}, create: { id: "l-1andar", nome: "Primeiro Andar", parentId: "l-adm", tipo: "andar" } });
  await prisma.local.upsert({ where: { id: "l-coord" }, update: {}, create: { id: "l-coord", nome: "Sala do Coordenador de Processos", parentId: "l-1andar", tipo: "sala" } });
  const lOp = await prisma.local.upsert({ where: { id: "l-op" }, update: {}, create: { id: "l-op", nome: "Operacional", parentId: "l-edificio", tipo: "bloco" } });
  const lSub = await prisma.local.upsert({ where: { id: "l-sub" }, update: {}, create: { id: "l-sub", nome: "Subsolo", parentId: "l-op", tipo: "andar" } });
  await prisma.local.upsert({ where: { id: "l-maq" }, update: {}, create: { id: "l-maq", nome: "Casa de Máquinas", parentId: "l-sub", tipo: "sala" } });
  await prisma.local.upsert({ where: { id: "l-sub-el" }, update: {}, create: { id: "l-sub-el", nome: "Subestação", parentId: "l-sub", tipo: "sala" } });
  const lTorrA = await prisma.local.upsert({ where: { id: "l-torra" }, update: {}, create: { id: "l-torra", nome: "Torre A", parentId: "l-edificio", tipo: "bloco" } });
  await prisma.local.upsert({ where: { id: "l-coba" }, update: {}, create: { id: "l-coba", nome: "Cobertura Torre A", parentId: "l-torra", tipo: "area" } });
  const lTorrB = await prisma.local.upsert({ where: { id: "l-torrb" }, update: {}, create: { id: "l-torrb", nome: "Torre B", parentId: "l-edificio", tipo: "bloco" } });
  await prisma.local.upsert({ where: { id: "l-cobb" }, update: {}, create: { id: "l-cobb", nome: "Cobertura Torre B", parentId: "l-torrb", tipo: "area" } });
  console.log("✅ Locais criados");

  // Ativos
  const at1 = await prisma.ativo.upsert({ where: { id: "at-hvac1" }, update: {}, create: { id: "at-hvac1", nome: "Sistema HVAC Zona 1", tipo: "HVAC", local: "3º Andar", criticidade: "critica", mtbf: 720, ultimaManut: new Date("2024-11-01"), valor: 85000 } });
  const at2 = await prisma.ativo.upsert({ where: { id: "at-sub" }, update: {}, create: { id: "at-sub", nome: "Subestação Principal", tipo: "Elétrico", local: "Subsolo", criticidade: "critica", mtbf: 2160, ultimaManut: new Date("2024-08-01"), valor: 320000 } });
  console.log("✅ Ativos criados");

  // Materiais
  const mats = [
    { id: "m-hvac", codigo: "MAT-001", nome: "Filtro HVAC 16x20", categoria: "HVAC", estoque: 2, minimo: 5, custo: 85.50, fornecedor: "TechFiltros LTDA" },
    { id: "m-rele", codigo: "MAT-002", nome: "Relé Térmico 10A", categoria: "Elétrico", estoque: 0, minimo: 3, custo: 145.00, fornecedor: "ElétricaPro" },
    { id: "m-bomba", codigo: "MAT-003", nome: "Bomba d'água 1HP", categoria: "Hidráulico", estoque: 1, minimo: 1, custo: 980.00, fornecedor: "HidraMaq" },
    { id: "m-cabo", codigo: "MAT-004", nome: "Cabo PP 4mm²", categoria: "Elétrico", estoque: 50, minimo: 20, custo: 12.50, fornecedor: "CaboFlex" },
    { id: "m-disj", codigo: "MAT-006", nome: "Disjuntor 70A", categoria: "Elétrico", estoque: 0, minimo: 2, custo: 220.00, fornecedor: "ElétricaPro" },
    { id: "m-led", codigo: "MAT-008", nome: "Lâmpada LED 20W", categoria: "Elétrico", estoque: 30, minimo: 15, custo: 18.90, fornecedor: "LuminoPro" },
  ];
  for (const m of mats) await prisma.material.upsert({ where: { id: m.id }, update: {}, create: m });
  console.log("✅ Materiais criados");

  // OS Corretivas
  const osList = [
    { id: "os-1052", numero: "OS-1052", descricao: "Cobertura com Vazamento — Torre A", criticidade: "critica", status: "aberta", dataPrevista: new Date("2025-02-15"), diasPraza: 2, hhPlanejado: 12, equipDisponivel: 70, materialBloqueado: true, prioridade: 9, risco: 9, urgencia: 8, impacto: 8, obs: "Chuva agravou o problema", responsavelId: u3.id, ativoId: at1.id },
    { id: "os-1048", numero: "OS-1048", descricao: "Manutenção Bombas HVAC — Zona 2", criticidade: "alta", status: "planejada", dataPrevista: new Date("2025-02-20"), diasPraza: 7, hhPlanejado: 8, equipDisponivel: 50, materialBloqueado: true, prioridade: 7, risco: 7, urgencia: 6, impacto: 7, obs: "Aguardando filtros", responsavelId: u2.id },
    { id: "os-1039", numero: "OS-1039", descricao: "Vazamento Emergencial — Subsolo", criticidade: "critica", status: "execucao", dataPrevista: new Date("2025-02-10"), diasPraza: -3, hhPlanejado: 16, hhRealizado: 10, equipDisponivel: 60, materialBloqueado: false, prioridade: 10, risco: 10, urgencia: 10, impacto: 9, obs: "URGENTE", responsavelId: u3.id },
    { id: "os-1055", numero: "OS-1055", descricao: "Inspeção Estrutural — Torre B", criticidade: "critica", status: "aberta", dataPrevista: new Date("2025-03-08"), diasPraza: 20, hhPlanejado: 20, equipDisponivel: 90, materialBloqueado: false, prioridade: 9, risco: 8, urgencia: 7, impacto: 9, responsavelId: u2.id },
    { id: "os-1071", numero: "OS-1071", descricao: "Revisão Subestação Elétrica", criticidade: "critica", status: "aberta", dataPrevista: new Date("2025-02-18"), diasPraza: 5, hhPlanejado: 24, equipDisponivel: 50, materialBloqueado: true, prioridade: 10, risco: 10, urgencia: 9, impacto: 10, obs: "Laudo técnico necessário", responsavelId: u3.id, ativoId: at2.id },
    { id: "os-1061", numero: "OS-1061", descricao: "Limpeza Filtros HVAC — Bloco B", criticidade: "media", status: "aberta", dataPrevista: new Date("2025-02-28"), diasPraza: 15, hhPlanejado: 6, equipDisponivel: 80, materialBloqueado: false, prioridade: 5, risco: 4, urgencia: 4, impacto: 5, responsavelId: u3.id },
    { id: "os-1059", numero: "OS-1059", descricao: "Pintura Fachada — Bloco C", criticidade: "baixa", status: "planejada", dataPrevista: new Date("2025-03-15"), diasPraza: 30, hhPlanejado: 40, equipDisponivel: 60, materialBloqueado: false, prioridade: 3, risco: 2, urgencia: 2, impacto: 3, responsavelId: u2.id },
    { id: "os-1063", numero: "OS-1063", descricao: "Manutenção Elevadores — Torres A/B", criticidade: "alta", status: "planejada", dataPrevista: new Date("2025-02-22"), diasPraza: 9, hhPlanejado: 14, equipDisponivel: 30, materialBloqueado: false, prioridade: 8, risco: 7, urgencia: 7, impacto: 8, responsavelId: u3.id },
  ];
  for (const os of osList) await prisma.oS.upsert({ where: { id: os.id }, update: {}, create: os });
  console.log("✅ OS criadas");

  console.log("🎉 Seed concluído!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
