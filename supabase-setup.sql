-- ═══════════════════════════════════════════════
-- SIGMA AI v9.0 — Setup do Banco de Dados Supabase
-- Execute no SQL Editor do Supabase
-- ═══════════════════════════════════════════════

-- 1. Usuários
CREATE TABLE IF NOT EXISTS "Usuario" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'tecnico',
  avatar TEXT,
  setor TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  "authId" TEXT UNIQUE,
  "criadoEm" TIMESTAMPTZ DEFAULT now()
);

-- 2. Locais (hierarquia)
CREATE TABLE IF NOT EXISTS "Local" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  "parentId" TEXT REFERENCES "Local"(id),
  tipo TEXT,
  descricao TEXT,
  "criadoEm" TIMESTAMPTZ DEFAULT now()
);

-- 3. Ativos
CREATE TABLE IF NOT EXISTS "Ativo" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  local TEXT NOT NULL,
  criticidade TEXT DEFAULT 'media',
  mtbf INT DEFAULT 720,
  "ultimaManut" TIMESTAMPTZ,
  status TEXT DEFAULT 'ativo',
  valor FLOAT DEFAULT 0,
  fabricante TEXT,
  modelo TEXT,
  "numSerie" TEXT,
  "criadoEm" TIMESTAMPTZ DEFAULT now()
);

-- 4. OS Corretivas
CREATE TABLE IF NOT EXISTS "OS" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  numero TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  criticidade TEXT DEFAULT 'media',
  status TEXT DEFAULT 'aberta',
  tipo TEXT DEFAULT 'corretiva',
  "dataPrevista" TIMESTAMPTZ NOT NULL,
  "diasPraza" INT DEFAULT 0,
  "hhPlanejado" INT DEFAULT 8,
  "hhRealizado" INT DEFAULT 0,
  "equipDisponivel" INT DEFAULT 80,
  "materialBloqueado" BOOLEAN DEFAULT false,
  prioridade INT DEFAULT 5,
  risco INT DEFAULT 5,
  urgencia INT DEFAULT 5,
  impacto INT DEFAULT 5,
  obs TEXT,
  "responsavelId" TEXT REFERENCES "Usuario"(id),
  "ativoId" TEXT REFERENCES "Ativo"(id),
  "localId" TEXT REFERENCES "Local"(id),
  "criadoEm" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- 5. OS Preventivas
CREATE TABLE IF NOT EXISTS "OSPreventiva" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  numero TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT 'pmoc',
  recorrencia TEXT DEFAULT 'mensal',
  prioridade TEXT DEFAULT 'media',
  ativo BOOLEAN DEFAULT true,
  "proxExecucao" TIMESTAMPTZ NOT NULL,
  "hhEstimado" INT DEFAULT 4,
  obs TEXT,
  acoes JSONB DEFAULT '[]',
  materiais JSONB DEFAULT '[]',
  "responsavelId" TEXT REFERENCES "Usuario"(id),
  "localId" TEXT REFERENCES "Local"(id),
  "criadoEm" TIMESTAMPTZ DEFAULT now()
);

-- 6. Materiais
CREATE TABLE IF NOT EXISTS "Material" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  estoque INT DEFAULT 0,
  minimo INT DEFAULT 1,
  custo FLOAT DEFAULT 0,
  unidade TEXT DEFAULT 'un',
  fornecedor TEXT,
  localizacao TEXT,
  "criadoEm" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- 7. OS × Materiais
CREATE TABLE IF NOT EXISTS "OSMaterial" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "osId" TEXT NOT NULL REFERENCES "OS"(id) ON DELETE CASCADE,
  "materialId" TEXT NOT NULL REFERENCES "Material"(id),
  quantidade INT DEFAULT 1,
  status TEXT DEFAULT 'pendente'
);

-- 8. Apontamentos HH
CREATE TABLE IF NOT EXISTS "ApontamentoHH" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "osId" TEXT NOT NULL REFERENCES "OS"(id) ON DELETE CASCADE,
  "usuarioId" TEXT NOT NULL REFERENCES "Usuario"(id),
  data TIMESTAMPTZ NOT NULL,
  "hhPlan" INT DEFAULT 8,
  "hhReal" INT DEFAULT 0,
  tarefas TEXT,
  "criadoEm" TIMESTAMPTZ DEFAULT now()
);

-- 9. Alocações no Gantt
CREATE TABLE IF NOT EXISTS "Alocacao" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "osId" TEXT NOT NULL REFERENCES "OS"(id) ON DELETE CASCADE,
  funcionarios JSONB DEFAULT '[]',
  dia INT NOT NULL,
  "horaInicio" INT NOT NULL,
  duracao INT NOT NULL,
  semana TEXT NOT NULL,
  cor TEXT DEFAULT '#3b82f6',
  "criadoEm" TIMESTAMPTZ DEFAULT now()
);

-- 10. Configurações
CREATE TABLE IF NOT EXISTS "Config" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL
);

-- ─── Trigger para updatedAt ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER os_updated_at BEFORE UPDATE ON "OS"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER material_updated_at BEFORE UPDATE ON "Material"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS (Row Level Security) ───
ALTER TABLE "OS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON "OS" FOR ALL USING (true);
CREATE POLICY "Allow all" ON "Usuario" FOR ALL USING (true);

-- ─── DADOS INICIAIS ───
INSERT INTO "Usuario" (id, nome, email, role, avatar, setor) VALUES
  ('u-admin', 'Gabriel Lucas', 'admin@sigma.ai', 'admin', 'GL', 'Diretoria'),
  ('u-gestor', 'Maria Costa', 'gestor@sigma.ai', 'gestor', 'MC', 'Manutenção'),
  ('u-tec', 'João Silva', 'tecnico@sigma.ai', 'tecnico', 'JS', 'Operações')
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Local" (id, nome, "parentId", tipo) VALUES
  ('l-ed', 'Edifício Principal', null, 'edificio'),
  ('l-adm', 'ADM', 'l-ed', 'bloco'),
  ('l-terreo', 'Térreo ADM', 'l-adm', 'andar'),
  ('l-1and', 'Primeiro Andar', 'l-adm', 'andar'),
  ('l-coord', 'Sala Coordenador de Processos', 'l-1and', 'sala'),
  ('l-op', 'Operacional', 'l-ed', 'bloco'),
  ('l-sub', 'Subsolo', 'l-op', 'andar'),
  ('l-maq', 'Casa de Máquinas', 'l-sub', 'sala'),
  ('l-sube', 'Subestação', 'l-sub', 'sala'),
  ('l-torra', 'Torre A', 'l-ed', 'bloco'),
  ('l-coba', 'Cobertura Torre A', 'l-torra', 'area'),
  ('l-torrb', 'Torre B', 'l-ed', 'bloco'),
  ('l-cobb', 'Cobertura Torre B', 'l-torrb', 'area')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Material" (id, codigo, nome, categoria, estoque, minimo, custo, fornecedor) VALUES
  ('m-01', 'MAT-001', 'Filtro HVAC 16x20', 'HVAC', 2, 5, 85.50, 'TechFiltros LTDA'),
  ('m-02', 'MAT-002', 'Relé Térmico 10A', 'Elétrico', 0, 3, 145.00, 'ElétricaPro'),
  ('m-03', 'MAT-003', 'Bomba d''água 1HP', 'Hidráulico', 1, 1, 980.00, 'HidraMaq'),
  ('m-04', 'MAT-004', 'Cabo PP 4mm²', 'Elétrico', 50, 20, 12.50, 'CaboFlex'),
  ('m-05', 'MAT-005', 'Disjuntor 70A', 'Elétrico', 0, 2, 220.00, 'ElétricaPro'),
  ('m-06', 'MAT-006', 'Lâmpada LED 20W', 'Elétrico', 30, 15, 18.90, 'LuminoPro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Ativo" (id, nome, tipo, local, criticidade, mtbf, valor) VALUES
  ('at-1', 'Sistema HVAC Zona 1', 'HVAC', '3º Andar', 'critica', 720, 85000),
  ('at-2', 'Subestação Principal', 'Elétrico', 'Subsolo', 'critica', 2160, 320000),
  ('at-3', 'Elevadores Torres A/B', 'Transporte', 'Torres A/B', 'alta', 2160, 180000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "OS" (id, numero, descricao, criticidade, status, "dataPrevista", "diasPraza", "hhPlanejado", "equipDisponivel", "materialBloqueado", prioridade, risco, urgencia, impacto, "responsavelId", "ativoId") VALUES
  ('os-1052', 'OS-1052', 'Cobertura com Vazamento — Torre A', 'critica', 'aberta', now()+INTERVAL '2 days', 2, 12, 70, true, 9, 9, 8, 8, 'u-tec', 'at-1'),
  ('os-1039', 'OS-1039', 'Vazamento Emergencial — Subsolo', 'critica', 'execucao', now()-INTERVAL '3 days', -3, 16, 60, false, 10, 10, 10, 9, 'u-tec', null),
  ('os-1071', 'OS-1071', 'Revisão Subestação Elétrica', 'critica', 'aberta', now()+INTERVAL '5 days', 5, 24, 50, true, 10, 10, 9, 10, 'u-tec', 'at-2'),
  ('os-1055', 'OS-1055', 'Inspeção Estrutural — Torre B', 'critica', 'aberta', now()+INTERVAL '20 days', 20, 20, 90, false, 9, 8, 7, 9, 'u-gestor', null),
  ('os-1048', 'OS-1048', 'Manutenção Bombas HVAC — Zona 2', 'alta', 'planejada', now()+INTERVAL '7 days', 7, 8, 50, true, 7, 7, 6, 7, 'u-gestor', 'at-1'),
  ('os-1061', 'OS-1061', 'Limpeza Filtros HVAC — Bloco B', 'media', 'aberta', now()+INTERVAL '15 days', 15, 6, 80, false, 5, 4, 4, 5, 'u-tec', 'at-1')
ON CONFLICT (id) DO NOTHING;

-- ─── Auth: Criar usuários no Supabase Auth ───
-- EXECUTE ISTO SEPARADAMENTE APÓS CRIAR OS USUÁRIOS NO PAINEL:
-- Authentication → Users → Invite user → admin@sigma.ai (senha: admin123)
-- Depois copie o ID e atualize:
-- UPDATE "Usuario" SET "authId" = 'UUID_DO_AUTH' WHERE email = 'admin@sigma.ai';

SELECT 'SIGMA AI v9.0 — Setup concluído! ✅' as status;
