import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const usuario = await prisma.usuario.findUnique({ where: { email: user.email! } });
    return NextResponse.json(usuario || { id: user.id, email: user.email, nome: user.email, role: "tecnico" });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}