import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const os = await prisma.oS.findUnique({ where: { id: params.id }, include: { responsavel: true, local: true, ativo: true, apontamentos: { include: { usuario: true } }, materiaisOS: { include: { material: true } } } });
    if (!os) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(os);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (body.dataPrevista) body.dataPrevista = new Date(body.dataPrevista);
    delete body.responsavel; delete body.local; delete body.ativo;
    const os = await prisma.oS.update({ where: { id: params.id }, data: body });
    return NextResponse.json(os);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.oS.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}