import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const criticidade = searchParams.get("criticidade");
    const where: any = {};
    if (status) where.status = status;
    if (criticidade) where.criticidade = criticidade;
    const os = await prisma.oS.findMany({ where, orderBy: { criadoEm: "desc" }, include: { responsavel: true, local: true, ativo: true } });
    return NextResponse.json(os);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.oS.count();
    const numero = `OS-${String(count + 1).padStart(4, "0")}`;
    const os = await prisma.oS.create({ data: { ...body, numero, dataPrevista: new Date(body.dataPrevista) }, include: { responsavel: true, local: true } });
    return NextResponse.json(os, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}