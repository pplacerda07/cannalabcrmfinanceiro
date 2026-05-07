import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/google/calendar";
import { logActivity } from "@/lib/activity-log";
import { z } from "zod";

const schema = z.object({
  patientId: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { patientId, startsAt, endsAt, userId } = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return NextResponse.json({ error: "Paciente nao encontrado" }, { status: 404 });

  const event = await createCalendarEvent({
    summary: `Consulta CannaLab - ${patient.name}`,
    description: `Condicao: ${patient.condition}\nWhatsApp: ${patient.whatsapp}`,
    startDateTime: startsAt,
    endDateTime: endsAt,
    attendeeEmail: patient.email || undefined,
  });

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      googleEventId: event.id || null,
      googleMeetUrl: event.hangoutLink || null,
    },
  });

  await prisma.patient.update({
    where: { id: patientId },
    data: { status: "CONSULTA_AGENDADA" },
  });

  await logActivity(patientId, userId, `Consulta agendada para ${new Date(startsAt).toLocaleString("pt-BR")}`);

  return NextResponse.json(appointment, { status: 201 });
}
