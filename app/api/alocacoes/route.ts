import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const semana = new URL(req.url).searchParams.get("semana");
    return NextResponse.json(await prisma.alocacao.findMany({ where: semana ? { semana } : {}, include: { os: true } }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const a = await prisma.alocacao.create({ data: body, include: { os: true } });
    await prisma.oS.update({ where: { id: body.osId }, data: { status: "planejada" } });
    return NextResponse.json(a, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(req: NextRequest) {
  try { const { id } = await req.json(); await prisma.alocacao.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}