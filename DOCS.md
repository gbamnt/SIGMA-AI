# SIGMA AI — Documentação Técnica

**Versão:** 6.0.0 | **Stack:** Next.js 14 · TypeScript · PostgreSQL · Anthropic Claude | **Deploy:** Vercel Edge

---

## Visão Geral

SIGMA AI é um sistema web de gestão de manutenção predial com inteligência artificial integrada. Combina um dashboard operacional completo com o **Score Sigma™** — algoritmo proprietário de priorização de Ordens de Serviço que processa múltiplas variáveis (prioridade, risco, urgência, impacto, disponibilidade de equipe e prazo) para gerar uma pontuação de 0 a 10 em tempo real.

O sistema roda inteiramente no navegador com dados locais (versão demo) ou conectado à API REST + banco PostgreSQL via Prisma (versão produção).

---

## Arquitetura

```
sigma-ai/
├── app/
│   ├── page.tsx                  # SPA principal — toda a UI em um único componente
│   ├── layout.tsx                # Root layout (fontes, metadata)
│   ├── globals.css               # Reset e variáveis CSS
│   ├── planejamento.tsx          # Módulo de planejamento (sub-componente)
│   ├── preventivas.tsx           # Módulo de OS Preventivas
│   ├── assistente-ia.tsx         # Chat com Claude (Anthropic)
│   ├── inteligencia.tsx          # Dashboard de inteligência / KPIs avançados
│   └── api/
│       ├── ia/chat/route.ts      # POST /api/ia/chat → Anthropic Claude Haiku
│       ├── os/route.ts           # GET/POST /api/os
│       ├── os/[id]/route.ts      # GET/PUT/DELETE /api/os/:id
│       ├── alocacoes/route.ts    # POST /api/alocacoes
│       ├── apontamentos/route.ts # POST /api/apontamentos
│       ├── ativos/route.ts       # GET /api/ativos
│       ├── kpis/route.ts         # GET /api/kpis (agregações)
│       ├── locais/route.ts       # GET/POST /api/locais
│       ├── locais/[id]/route.ts  # GET/PUT/DELETE /api/locais/:id
│       ├── materiais/route.ts    # GET/POST /api/materiais
│       ├── materiais/[id]/route.ts
│       ├── usuarios/route.ts     # GET/POST /api/usuarios
│       ├── usuarios/[id]/route.ts
│       └── auth/
│           ├── login/route.ts    # POST /api/auth/login
│           ├── logout/route.ts   # POST /api/auth/logout
│           ├── me/route.ts       # GET /api/auth/me
│           └── reset-password/route.ts
├── lib/
│   ├── prisma.ts                 # Singleton Prisma Client
│   ├── supabase.ts               # Supabase client (Storage / Auth)
│   └── hooks/useData.ts          # Custom hooks para fetching
├── prisma/
│   ├── schema.prisma             # Schema PostgreSQL (10 models)
│   └── seed.js                   # Dados iniciais de demonstração
├── vercel.json                   # Configuração de deploy
└── .env.example                  # Variáveis de ambiente necessárias
```

---

## Modelos de Dados (Prisma)

### `OS` — Ordem de Serviço
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (cuid) | Identificador único |
| `numero` | String (unique) | Código humano (ex: OS-1052) |
| `descricao` | String | Descrição do serviço |
| `criticidade` | Enum | `critica` · `alta` · `media` · `baixa` |
| `status` | Enum | `aberta` · `planejada` · `execucao` · `concluida` · `cancelada` |
| `tipo` | String | `corretiva` · `preventiva` · `preditiva` |
| `dataPrevista` | DateTime | Deadline |
| `diasPraza` | Int | Dias até deadline (negativo = atrasada) |
| `hhPlanejado` / `hhRealizado` | Int | Horas-homem planejadas e realizadas |
| `equipDisponivel` | Int | % disponibilidade da equipe (0–100) |
| `materialBloqueado` | Boolean | Flag de bloqueio por falta de material |
| `prioridade` / `risco` / `urgencia` / `impacto` | Int | Scores 0–10 para o Score Sigma™ |
| `responsavelId` | String (FK) | Referência ao `Usuario` |
| `ativoId` | String (FK) | Referência ao `Ativo` |
| `localId` | String (FK) | Referência ao `Local` |

### `Usuario`
Suporta 3 roles: `admin` · `gestor` · `tecnico`. Campo `authId` para integração com Supabase Auth.

### `Ativo`
Equipamentos monitorados. Campos `mtbf` (Mean Time Between Failures em horas) e `ultimaManut` permitem calcular risco de falha por tempo decorrido.

### `OSPreventiva`
OS recorrentes com campo `acoes` (JSON array de checklist) e `recorrencia` (`diaria` · `semanal` · `quinzenal` · `mensal` · `trimestral` · `semestral` · `anual`).

### `ApontamentoHH`
Registro de horas trabalhadas por usuário em uma OS. Permite calcular eficiência real vs planejada.

### `Alocacao`
Alocação de equipe por OS, dia e horário — alimenta o Gantt/Timeline.

---

## Algoritmo Score Sigma™

```typescript
function calcScore(os: OS): { score: number; detalhes: object } {
  const hh    = Math.min(os.hhPlanejado / 4, 10);      // peso: volume de trabalho
  const disp  = os.equipDisponivel / 10;               // peso: disponibilidade
  const bloq  = os.materialBloqueado ? 3 : 0;          // penalidade: bloqueio
  const atras = os.diasPraza < 0 ? 2 : 0;              // penalidade: já atrasada

  const score = Math.max(0, Math.min(10,
    os.prioridade * 0.20 +
    os.risco      * 0.25 +
    os.urgencia   * 0.20 +
    os.impacto    * 0.15 +
    hh            * 0.10 +
    disp          * 0.10 -
    bloq          * 0.30 +
    atras         * 0.15
  ));

  return { score: parseFloat(score.toFixed(1)), detalhes: { ... } };
}
```

**Interpretação:**
- `8.0 – 10.0` → CRÍTICO — executar imediatamente
- `6.0 – 7.9` → ALTO — planejar com urgência
- `4.0 – 5.9` → MÉDIO — monitorar
- `0.0 – 3.9` → BAIXO — dentro dos padrões

---

## Módulos da Aplicação

| Módulo | Rota | Descrição |
|---|---|---|
| Dashboard | `/` (default) | KPIs em tempo real, Curva S, Top Prioridades Score Sigma™, alertas |
| Ordens de Serviço | `os` | Tabela completa com filtros, busca, ordenação por score/prazo/HH |
| Planejamento | `planejamento` | Drag-and-drop de OS por status, detecção de conflitos |
| Preventivas | `preventivas` | OS recorrentes com calendário de próximas execuções |
| Gantt / Timeline | `gantt` | Visualização temporal das OS com barra de progresso HH |
| Apontamento HH | `hh` | Registro e análise de eficiência de horas-homem |
| Ativos | `ativos` | Monitoramento de infraestrutura com cálculo de risco por MTBF |
| Materiais | `materiais` | Controle de estoque com alertas de mínimo |
| Inteligência IA | `inteligencia` | Métricas avançadas + chat com Claude Haiku |
| Relatórios | `relatorios` | Resumo executivo + exportação CSV |
| Configurações | `config` | Admin only — usuários, alertas, dados do sistema |

---

## API de IA — `/api/ia/chat`

```typescript
// POST /api/ia/chat
// Body:
{
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  system?: string; // Prompt de sistema (contexto da OS, KPIs, etc.)
}

// Response:
{ text: string }
```

O assistente recebe como contexto (`system`) os dados atuais de OS, KPIs e o contexto do usuário logado. Usa o modelo `claude-haiku-4-5-20250101` com max_tokens: 1500.

**Variável de ambiente necessária:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Variáveis de Ambiente

```bash
# Banco de dados (Supabase PostgreSQL ou qualquer PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Supabase (opcional — para auth e storage)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Anthropic Claude (obrigatório para o assistente IA)
ANTHROPIC_API_KEY="sk-ant-..."

# JWT (autenticação própria)
JWT_SECRET="sua-chave-secreta-32-chars-minimo"
```

---

## Setup Local

```bash
# 1. Clonar e instalar
git clone https://github.com/gbamnt/sigma-ai
cd sigma-ai
npm install

# 2. Configurar variáveis
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 3. Sincronizar schema com o banco
npx prisma db push

# 4. Popular dados de demonstração
node prisma/seed.js

# 5. Rodar em desenvolvimento
npm run dev
# Abre em http://localhost:3000
```

---

## Deploy (Vercel)

```bash
# Deploy via CLI
npx vercel --prod

# Ou conectar o repositório GitHub ao Vercel
# e configurar as variáveis de ambiente no painel
```

O arquivo `vercel.json` já está configurado. O Next.js 14 é suportado nativamente no Vercel com Edge Runtime para as rotas de API.

---

## Perfis de Acesso (Demo)

| Perfil | E-mail | Senha | Permissões |
|---|---|---|---|
| Admin | admin@sigma.ai | admin123 | Acesso total + Configurações |
| Gestor | gestor@sigma.ai | gestor123 | Criar/editar OS, ver todos módulos |
| Técnico | tecnico@sigma.ai | tecnico123 | Visualizar OS, registrar HH |

---

## Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.29 |
| Linguagem | TypeScript | 5.3.3 |
| ORM | Prisma | 5.7.1 |
| Banco de Dados | PostgreSQL (Supabase) | — |
| Auth/Storage | Supabase | 2.39.x |
| IA | Anthropic Claude Haiku | 4.5 |
| Charts | Recharts | 2.10.3 |
| Ícones | Lucide React | 0.383.0 |
| CSS | Tailwind CSS | 3.3.6 |
| Deploy | Vercel Edge | — |

---

## Autor

**Gabriel Lucas** — Engenharia de Produção · CEFET-RJ
GitHub: [@gbamnt](https://github.com/gbamnt)
