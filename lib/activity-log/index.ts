import { prisma } from "@/lib/prisma";

export async function logActivity(
  patientId: string,
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  return prisma.activityLog.create({
    data: {
      patientId,
      userId,
      action,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(metadata !== undefined ? { metadata: metadata as any } : {}),
    },
  });
}
