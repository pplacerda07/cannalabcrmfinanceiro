import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: true,
      appointments: { orderBy: { startsAt: "desc" } },
      paymentLinks: { include: { events: true }, orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      activityLogs: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!patient) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{patient.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{patient.condition}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados pessoais */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados pessoais</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">WhatsApp</dt>
              <dd className="text-gray-900 font-medium">{patient.whatsapp}</dd>
            </div>
            {patient.email && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{patient.email}</dd>
              </div>
            )}
            {patient.cpf && (
              <div className="flex justify-between">
                <dt className="text-gray-500">CPF</dt>
                <dd className="text-gray-900">{patient.cpf}</dd>
              </div>
            )}
            {patient.state && (
              <div className="flex justify-between">
                <dt className="text-gray-500">UF</dt>
                <dd className="text-gray-900">{patient.state}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900 font-medium">{patient.status}</dd>
            </div>
          </dl>
        </div>

        {/* Pagamentos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Pagamentos</h2>
            <button className="text-xs text-green-600 hover:text-green-700 font-medium">
              + Gerar link
            </button>
          </div>
          {patient.paymentLinks.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum link gerado</p>
          ) : (
            <div className="space-y-2">
              {patient.paymentLinks.map((link) => (
                <div key={link.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">R$ {link.value.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{link.status}</span>
                  </div>
                  {link.url && (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block mt-1"
                    >
                      {link.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consultas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Consultas</h2>
            <button className="text-xs text-green-600 hover:text-green-700 font-medium">
              + Agendar
            </button>
          </div>
          {patient.appointments.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma consulta agendada</p>
          ) : (
            <div className="space-y-2">
              {patient.appointments.map((apt) => (
                <div key={apt.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {new Date(apt.startsAt).toLocaleString("pt-BR")}
                  </p>
                  {apt.googleMeetUrl && (
                    <a
                      href={apt.googleMeetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Link do Meet
                    </a>
                  )}
                  <span className="text-xs text-gray-400 ml-2">{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Documentos</h2>
            <button className="text-xs text-green-600 hover:text-green-700 font-medium">
              + Anexar
            </button>
          </div>
          {patient.documents.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum documento anexado</p>
          ) : (
            <div className="space-y-2">
              {patient.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg p-3">
                  <span className="text-gray-900 truncate">{doc.fileName}</span>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{doc.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historico */}
      {patient.activityLogs.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Historico</h2>
          <div className="space-y-2">
            {patient.activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 text-xs flex-shrink-0 pt-0.5">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </span>
                <span className="text-gray-700">{log.action}</span>
                <span className="text-gray-400 text-xs ml-auto flex-shrink-0">{log.user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
