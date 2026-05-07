import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentLink } from "@/lib/asaas/client";
import { logActivity } from "@/lib/activity-log";
import { z } from "zod";

const schema = z.object({
  patientId: z.string(),
  value: z.number().positive().default(89.9),
  description: z.string().optional(),
  billingType: z.enum(["BOLETO", "CREDIT_CARD", "PIX", "UNDEFINED"]).default("UNDEFINED"),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { patientId, value, description, billingType, userId } = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return NextResponse.json({ error: "Paciente nao encontrado" }, { status: 404 });

  const externalRef = `crm-${patientId}-${Date.now()}`;

  const asaasResponse = await createPaymentLink({
    name: `Consulta - ${patient.name}`,
    value,
    description: description || "Consulta CannaLab",
    billingType,
    chargeType: "DETACHED",
    externalReference: externalRef,
  });

  const paymentLink = await prisma.paymentLink.create({
    data: {
      patientId,
      asaasPaymentLinkId: asaasResponse.id,
      url: asaasResponse.url,
      value,
      description,
      externalReference: externalRef,
      status: "PENDING",
    },
  });

  await prisma.patient.update({
    where: { id: patientId },
    data: { status: "PAGAMENTO_ENVIADO" },
  });

  await logActivity(patientId, userId, `Link de pagamento gerado: R$ ${value.toFixed(2)}`);

  return NextResponse.json(paymentLink, { status: 201 });
}
