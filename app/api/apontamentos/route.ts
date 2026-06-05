import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const osId = new URL(req.url).searchParams.get("osId");
    return NextResponse.json(await prisma.apontamentoHH.findMany({ where: osId ? { osId } : {}, include: { usuario: true, os: true }, orderBy: { criadoEm: "desc" } }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const a = await prisma.apontamentoHH.create({ data: { ...body, data: new Date(body.data) }, include: { usuario: true } });
    if (body.hhReal) await prisma.oS.update({ where: { id: body.osId }, data: { hhRealizado: { increment: body.hhReal } } });
    return NextResponse.json(a, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}