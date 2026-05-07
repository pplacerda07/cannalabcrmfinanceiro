import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONFIRMED_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];

export async function POST(req: NextRequest) {
  const token = req.headers.get("asaas-access-token");
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const { event, payment } = payload;

  if (!payment?.externalReference) {
    return NextResponse.json({ ok: true });
  }

  const paymentLink = await prisma.paymentLink.findFirst({
    where: { externalReference: payment.externalReference },
    include: { patient: true },
  });

  if (!paymentLink) return NextResponse.json({ ok: true });

  await prisma.paymentEvent.create({
    data: {
      paymentLinkId: paymentLink.id,
      asaasEventId: payment.id,
      eventType: event,
      payload,
    },
  });

  if (CONFIRMED_EVENTS.includes(event)) {
    await prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: { status: "CONFIRMED" },
    });

    await prisma.patient.update({
      where: { id: paymentLink.patientId },
      data: { status: "PAGO" },
    });

    await prisma.activityLog.create({
      data: {
        patientId: paymentLink.patientId,
        userId: paymentLink.patient.assignedToId || "system",
        action: `Pagamento confirmado via webhook (${event})`,
        metadata: { asaasEventId: payment.id },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
