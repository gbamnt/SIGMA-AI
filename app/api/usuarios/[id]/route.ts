import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { return NextResponse.json(await prisma.usuario.update({ where: { id: params.id }, data: await req.json() })); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try { await prisma.usuario.update({ where: { id: params.id }, data: { ativo: false } }); return NextResponse.json({ ok: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}