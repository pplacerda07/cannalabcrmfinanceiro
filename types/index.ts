import type {
  Patient,
  User,
  Appointment,
  PaymentLink,
  PaymentEvent,
  Template,
  TemplateField,
  TemplateSubmission,
  Document,
  ActivityLog,
} from "@/app/generated/prisma/client";

export type PatientWithRelations = Patient & {
  assignedTo?: User | null;
  appointments?: Appointment[];
  paymentLinks?: (PaymentLink & { events?: PaymentEvent[] })[];
  templateSubmissions?: TemplateSubmission[];
  documents?: Document[];
  activityLogs?: (ActivityLog & { user: User })[];
};

export type TemplateWithFields = Template & {
  fields: TemplateField[];
};

export type TemplateSubmissionWithAnswers = TemplateSubmission & {
  template: TemplateWithFields;
  createdBy: User;
};

export type { Patient, User, Appointment, PaymentLink, Document, ActivityLog };
