import { z } from "zod";
import { SiteTheme } from "@prisma/client";
import { isValidWhatsAppNumber, normalizeWhatsAppNumber } from "@/lib/whatsapp";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Senha inválida"),
});

export const createOrderSchema = z.object({
  planId: z.string().min(1),
});

export const createPixSchema = z.object({
  orderId: z.string().min(1),
});

export const importCodesSchema = z.object({
  planId: z.string().min(1),
  codes: z.array(z.string().min(4)).min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  phone: z.string().optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(6, "A nova senha deve ter ao menos 6 caracteres"),
});

const dataImageUrl = z
  .string()
  .regex(
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i,
    "Use PNG, JPG, WebP ou GIF em base64",
  )
  .max(2_500_000, "Imagem muito grande (máx. ~1,8 MB em base64)");

const faviconDataUrl = z
  .string()
  .regex(
    /^data:image\/(png|jpeg|jpg|webp|gif|x-icon|vnd\.microsoft\.icon);base64,/i,
    "Favicon: PNG, JPG, WebP, GIF ou ICO",
  )
  .max(600_000, "Favicon muito grande");

export const siteBrandingPatchSchema = z
  .object({
    logoDataUrl: z.union([dataImageUrl, z.null()]).optional(),
    faviconDataUrl: z.union([faviconDataUrl, z.null()]).optional(),
    storeDisplayName: z.string().min(2).max(80).optional(),
    activeTheme: z.nativeEnum(SiteTheme).optional(),
    landingCopy: z
      .object({
        heroEyebrow: z.string().min(4).max(120),
        heroTitlePrefix: z.string().min(3).max(120),
        heroTitleHighlight: z.string().min(2).max(40),
        heroTitleSuffix: z.string().min(3).max(120),
        heroSubtitle: z.string().min(10).max(280),
        heroPrimaryCta: z.string().min(2).max(40),
        heroSecondaryCta: z.string().min(2).max(40),
        plansTitle: z.string().min(3).max(80),
        plansSubtitle: z.string().min(8).max(220),
        planBadgePopular: z.string().min(2).max(40),
        planPriceCaption: z.string().min(2).max(40),
        planBuyButton: z.string().min(2).max(40),
        faqTitle: z.string().min(3).max(80),
        faqSubtitle: z.string().min(8).max(220),
        footerTagline: z.string().min(8).max(180),
        fontPreset: z.enum([
          "inter",
          "poppins",
          "montserrat",
          "roboto",
          "lato",
          "nunito",
          "opensans",
          "raleway",
          "sora",
          "outfit",
        ]),
        fontSizePreset: z.enum(["sm", "md", "lg"]),
        textPrimaryColor: z.string().regex(/^#[A-Fa-f0-9]{6}$/),
        textSecondaryColor: z.string().regex(/^#[A-Fa-f0-9]{6}$/),
        textMutedColor: z.string().regex(/^#[A-Fa-f0-9]{6}$/),
        downloadAppsTitle: z.string().min(3).max(90),
        downloadAppsSubtitle: z.string().min(8).max(260),
        downloadAppsButtonLabel: z.string().min(2).max(32),
        downloadApp1Name: z.string().max(50),
        downloadApp1Url: z.union([z.string().url("Informe uma URL válida"), z.literal("")]),
        downloadApp1ImageUrl: z.union([z.string().url("Informe uma URL válida"), z.literal("")]),
        downloadApp2Name: z.string().max(50),
        downloadApp2Url: z.union([z.string().url("Informe uma URL válida"), z.literal("")]),
        downloadApp2ImageUrl: z.union([z.string().url("Informe uma URL válida"), z.literal("")]),
        downloadApp3Name: z.string().max(50),
        downloadApp3Url: z.union([z.string().url("Informe uma URL válida"), z.literal("")]),
        downloadApp3ImageUrl: z.union([z.string().url("Informe uma URL válida"), z.literal("")]),
      })
      .optional(),
  })
  .refine(
    (d) =>
      d.logoDataUrl !== undefined ||
      d.faviconDataUrl !== undefined ||
      d.storeDisplayName !== undefined ||
      d.activeTheme !== undefined ||
      d.landingCopy !== undefined,
    { message: "Envie pelo menos um campo para atualizar" },
  );

export const contactSettingsSchema = z
  .object({
    whatsappEnabled: z.boolean(),
    whatsappNumber: z.string().optional().or(z.literal("")),
    whatsappMessage: z.string().max(280).optional().or(z.literal("")),
    whatsappLabel: z.string().max(40).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    const normalized = normalizeWhatsAppNumber(val.whatsappNumber || "");
    if (val.whatsappEnabled && !isValidWhatsAppNumber(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um número de WhatsApp válido para ativar o botão.",
        path: ["whatsappNumber"],
      });
    }
  });
