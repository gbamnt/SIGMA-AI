import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ user: data.user, session: data.session });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}