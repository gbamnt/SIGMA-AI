import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try { return NextResponse.json(await prisma.oSPreventiva.findMany({ include: { responsavel: true, local: true }, orderBy: { proxExecucao: "asc" } })); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.oSPreventiva.count();
    const numero = `OSP-${String(count + 1).padStart(3, "0")}`;
    return NextResponse.json(await prisma.oSPreventiva.create({ data: { ...body, numero, proxExecucao: new Date(body.proxExecucao) } }), { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}