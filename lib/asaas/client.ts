import axios from "axios";

const asaas = axios.create({
  baseURL: process.env.ASAAS_BASE_URL || "https://sandbox.asaas.com/api/v3",
  headers: {
    "access_token": process.env.ASAAS_API_KEY!,
    "Content-Type": "application/json",
  },
});

export interface CreatePaymentLinkInput {
  name: string;
  value: number;
  description?: string;
  billingType?: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  chargeType: "DETACHED";
  endDate?: string;
  externalReference?: string;
}

export async function createPaymentLink(input: CreatePaymentLinkInput) {
  const { data } = await asaas.post("/paymentLinks", input);
  return data;
}

export async function getPaymentLink(id: string) {
  const { data } = await asaas.get(`/paymentLinks/${id}`);
  return data;
}

export default asaas;
