import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try { return NextResponse.json(await prisma.ativo.findMany({ orderBy: { nome: "asc" } })); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(await prisma.ativo.create({ data: { ...body, ultimaManut: body.ultimaManut ? new Date(body.ultimaManut) : null } }), { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}