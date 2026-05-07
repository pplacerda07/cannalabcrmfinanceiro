import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("cannalab123", 10);

  await prisma.user.upsert({
    where: { email: "admin@cannalab.com" },
    update: {},
    create: {
      name: "Admin CannaLab",
      email: "admin@cannalab.com",
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  // Templates iniciais
  const templates = [
    { name: "Primeira consulta geral", description: "Anamnese geral para primeira consulta" },
    { name: "Ansiedade / Insonia", description: "Briefing especifico para ansiedade e insonia" },
    { name: "Dor cronica / Fibromialgia", description: "Briefing para dor cronica e fibromialgia" },
    { name: "Parkinson / Neurologico", description: "Briefing para casos neurologicos" },
    { name: "TEA / TDAH", description: "Briefing para TEA e TDAH" },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.name },
      update: {},
      create: {
        id: t.name,
        name: t.name,
        description: t.description,
        fields: {
          create: [
            { label: "Nome completo do paciente", type: "TEXT_SHORT", required: true, order: 1 },
            { label: "Idade", type: "TEXT_SHORT", required: true, order: 2 },
            { label: "Condicao principal", type: "TEXT_LONG", required: true, order: 3 },
            { label: "Medicamentos em uso", type: "TEXT_LONG", required: false, order: 4 },
            { label: "Ja usou canabidiol antes?", type: "YES_NO", required: true, order: 5 },
            { label: "Observacoes adicionais", type: "TEXT_LONG", required: false, order: 6 },
          ],
        },
      },
    });
  }

  console.log("Seed concluido!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
