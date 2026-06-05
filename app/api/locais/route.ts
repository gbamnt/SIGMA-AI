import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try { return NextResponse.json(await prisma.local.findMany({ orderBy: { nome: "asc" } })); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try { return NextResponse.json(await prisma.local.create({ data: await req.json() }), { status: 201 }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}