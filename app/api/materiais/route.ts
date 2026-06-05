import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try { return NextResponse.json(await prisma.material.findMany({ orderBy: { nome: "asc" } })); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.material.count();
    const codigo = body.codigo || `MAT-${String(count + 1).padStart(3, "0")}`;
    return NextResponse.json(await prisma.material.create({ data: { ...body, codigo } }), { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}