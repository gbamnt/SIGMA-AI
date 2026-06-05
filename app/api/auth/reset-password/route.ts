import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://sigma-ai-gbamnts-projects.vercel.app"}/reset-password`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, msg: "E-mail de recuperação enviado!" });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}