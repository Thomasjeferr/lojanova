import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppLink, isValidWhatsAppNumber, normalizeWhatsAppNumber } from "@/lib/whatsapp";

export type ContactSettingsPublic = {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLabel: string;
  whatsappLink: string;
};

export const CONTACT_FALLBACK: ContactSettingsPublic = {
  whatsappEnabled: false,
  whatsappNumber: "",
  whatsappMessage: "Olá! Vim pelo site e gostaria de mais informações.",
  whatsappLabel: "Fale conosco",
  whatsappLink: "",
};

export function toPublicContactSettings(input: {
  whatsappEnabled?: boolean | null;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  whatsappLabel?: string | null;
}): ContactSettingsPublic {
  const normalized = normalizeWhatsAppNumber(input.whatsappNumber || "");
  const enabled = Boolean(input.whatsappEnabled) && isValidWhatsAppNumber(normalized);
  const message = (input.whatsappMessage || CONTACT_FALLBACK.whatsappMessage).trim();
  const label = (input.whatsappLabel || CONTACT_FALLBACK.whatsappLabel).trim();
  return {
    whatsappEnabled: enabled,
    whatsappNumber: normalized,
    whatsappMessage: message,
    whatsappLabel: label,
    whatsappLink: enabled ? buildWhatsAppLink({ number: normalized, message }) : "",
  };
}

export async function getPublicContactSettings(): Promise<ContactSettingsPublic> {
  noStore();
  try {
    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        whatsappEnabled: true,
        whatsappNumber: true,
        whatsappMessage: true,
        whatsappLabel: true,
      },
    });
    if (!row) return { ...CONTACT_FALLBACK };
    return toPublicContactSettings(row);
  } catch {
    return { ...CONTACT_FALLBACK };
  }
}

