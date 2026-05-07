import { prisma } from "@/lib/prisma";
import { PatientStatus } from "@/app/generated/prisma/client";

async function getStats() {
  const [total, pagamentoEnviado, pago, agendada, realizada] = await Promise.all([
    prisma.patient.count({ where: { status: PatientStatus.NOVO_LEAD } }),
    prisma.patient.count({ where: { status: PatientStatus.PAGAMENTO_ENVIADO } }),
    prisma.patient.count({ where: { status: PatientStatus.PAGO } }),
    prisma.patient.count({ where: { status: PatientStatus.CONSULTA_AGENDADA } }),
    prisma.patient.count({ where: { status: PatientStatus.CONSULTA_REALIZADA } }),
  ]);
  return { total, pagamentoEnviado, pago, agendada, realizada };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Novos leads", value: stats.total, color: "bg-blue-50 text-blue-700" },
    { label: "Aguardando pagamento", value: stats.pagamentoEnviado, color: "bg-yellow-50 text-yellow-700" },
    { label: "Pagamentos confirmados", value: stats.pago, color: "bg-green-50 text-green-700" },
    { label: "Consultas agendadas", value: stats.agendada, color: "bg-purple-50 text-purple-700" },
    { label: "Consultas realizadas", value: stats.realizada, color: "bg-gray-50 text-gray-700" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm mt-1 opacity-80">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
