import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try {
    const [total, abertas, concluidas, criticas, bloqueadas, execucao, hh, atrasos] = await Promise.all([
      prisma.oS.count(),
      prisma.oS.count({ where: { status: { in: ["aberta","planejada","execucao"] } } }),
      prisma.oS.count({ where: { status: "concluida" } }),
      prisma.oS.count({ where: { criticidade: "critica", status: { notIn: ["concluida","cancelada"] } } }),
      prisma.oS.count({ where: { materialBloqueado: true } }),
      prisma.oS.count({ where: { status: "execucao" } }),
      prisma.oS.aggregate({ _sum: { hhPlanejado: true } }),
      prisma.oS.count({ where: { diasPraza: { lt: 0 }, status: { notIn: ["concluida","cancelada"] } } }),
    ]);
    const aderencia = total > 0 ? Math.round(((total - atrasos) / total) * 100) : 100;
    return NextResponse.json({ total, abertas, concluidas, criticas, bloqueadas, execucao, hh: hh._sum.hhPlanejado || 0, atrasos, aderencia });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}