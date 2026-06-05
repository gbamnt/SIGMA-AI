// Prisma stub — funciona sem DATABASE_URL no build
let prisma: any;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = global as any;
    prisma = globalForPrisma.prisma || new PrismaClient({ log: ["error"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  } catch {
    prisma = createStub();
  }
} else {
  prisma = createStub();
}

function createStub() {
  const stub = () => Promise.resolve([]);
  const handler: any = { findMany:stub, findUnique:stub, create:async(a:any)=>a.data, update:async(a:any)=>a.data, delete:stub, count:async()=>0, aggregate:async()=>({_sum:{hhPlanejado:0}}), upsert:stub };
  return new Proxy({}, { get: () => handler });
}

export default prisma;
