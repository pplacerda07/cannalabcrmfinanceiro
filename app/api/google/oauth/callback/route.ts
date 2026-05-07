import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code ausente" }, { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);

  // Exibe o refresh_token para copiar e salvar no .env
  // Em producao, salvar em banco (IntegrationCredential)
  return NextResponse.json({
    message: "Autenticacao realizada! Copie o refresh_token abaixo e salve em GOOGLE_REFRESH_TOKEN no .env",
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
  });
}
