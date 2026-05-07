import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/activity-log";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
  state: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum([
    "NOVO_LEAD",
    "EM_ATENDIMENTO",
    "PAGAMENTO_ENVIADO",
    "PAGO",
    "CONSULTA_AGENDADA",
    "CONSULTA_REALIZADA",
    "DOCUMENTO_ANEXADO",
    "FINALIZADO",
    "PERDIDO",
  ]),
  userId: z.string(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      appointments: { orderBy: { startsAt: "desc" } },
      paymentLinks: { include: { events: true } },
      documents: { orderBy: { createdAt: "desc" } },
      activityLogs: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 30 },
    },
  });

  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(patient);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const patient = await prisma.patient.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await logActivity(id, parsed.data.userId, `Status alterado para ${parsed.data.status}`);
    return NextResponse.json(patient);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const patient = await prisma.patient.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(patient);
}
