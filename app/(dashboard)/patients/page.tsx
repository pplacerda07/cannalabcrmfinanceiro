import { prisma } from "@/lib/prisma";
import { PatientStatus } from "@/app/generated/prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<PatientStatus, string> = {
  NOVO_LEAD: "Novo Lead",
  EM_ATENDIMENTO: "Em Atendimento",
  PAGAMENTO_ENVIADO: "Pagamento Enviado",
  PAGO: "Pago",
  CONSULTA_AGENDADA: "Consulta Agendada",
  CONSULTA_REALIZADA: "Consulta Realizada",
  DOCUMENTO_ANEXADO: "Documento Anexado",
  FINALIZADO: "Finalizado",
  PERDIDO: "Perdido",
};

const STATUS_COLORS: Record<PatientStatus, string> = {
  NOVO_LEAD: "bg-blue-100 text-blue-800",
  EM_ATENDIMENTO: "bg-orange-100 text-orange-800",
  PAGAMENTO_ENVIADO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-green-100 text-green-800",
  CONSULTA_AGENDADA: "bg-purple-100 text-purple-800",
  CONSULTA_REALIZADA: "bg-teal-100 text-teal-800",
  DOCUMENTO_ANEXADO: "bg-indigo-100 text-indigo-800",
  FINALIZADO: "bg-gray-100 text-gray-800",
  PERDIDO: "bg-red-100 text-red-800",
};

const KANBAN_COLUMNS: PatientStatus[] = [
  "NOVO_LEAD",
  "EM_ATENDIMENTO",
  "PAGAMENTO_ENVIADO",
  "PAGO",
  "CONSULTA_AGENDADA",
  "CONSULTA_REALIZADA",
  "FINALIZADO",
];

export default async function PatientsPage() {
  const patients = await prisma.patient.findMany({
    where: { status: { in: KANBAN_COLUMNS } },
    include: { assignedTo: true },
    orderBy: { createdAt: "desc" },
  });

  const grouped = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = patients.filter((p) => p.status === status);
      return acc;
    },
    {} as Record<PatientStatus, typeof patients>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Pacientes</h1>
        <Link
          href="/patients/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo paciente
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((status) => (
          <div key={status} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-gray-400">{grouped[status].length}</span>
            </div>

            <div className="space-y-2">
              {grouped[status].map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-sm text-gray-900 truncate">{patient.name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{patient.condition}</p>
                  <p className="text-xs text-gray-400 mt-1">{patient.whatsapp}</p>
                </Link>
              ))}

              {grouped[status].length === 0 && (
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
                  <p className="text-xs text-gray-400">Vazio</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
