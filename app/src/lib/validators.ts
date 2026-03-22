import { z } from "zod";
import { PaymentProvider, SiteTheme } from "@prisma/client";
import { isValidWhatsAppNumber, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome inválido"),
    email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
    phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    /** CPF do pagador (checkout); opcional. */
    payerCpf: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const p = normalizePayerDocument(data.payerCpf ?? "");
    if (!p) return;
    if (!isValidPayerDocument(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido",
        path: ["payerCpf"],
      });
    }
  });

export const loginSchema = z.object({
  email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Senha inválida"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido").transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, "Token inválido"),
  newPassword: z.string().min(6, "A nova senha deve ter ao menos 6 caracteres"),
});

export const createOrderSchema = z.object({
  planId: z.string().min(1),
});

export const createPixSchema = z.object({
  orderId: z.string().min(1),
  /** CPF do pagador (GGPIXAPI); preenchido no checkout. */
  payerDocument: z.string().optional(),
});

export const importCodesSchema = z.object({
  planId: z.string().min(1),
  credentialType: z.enum(["activation_code", "username_password"]),
  codes: z.array(z.string().min(2)).min(1),
});

/** Edi??o manual no admin (s? dispon?vel/bloqueado sem venda) */
export const adminActivationCodePatchSchema = z
  .object({
    planId: z.string().min(1).optional(),
    code: z.string().optional(),
    username: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    const touchedPlan = val.planId !== undefined;
    const touchedActivationCode = val.code !== undefined && val.code.trim() !== "";
    const touchedUser = val.username !== undefined;
    const touchedPass = val.password !== undefined;
    if (!touchedPlan && !touchedActivationCode && !touchedUser && !touchedPass) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Envie ao menos um campo para atualizar.",
      });
    }
    if (touchedUser !== touchedPass) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para credencial usu?rio/senha, informe usu?rio e senha juntos.",
        path: touchedUser ? ["password"] : ["username"],
      });
    }
  });

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Nome inválido"),
    phone: z.string().optional().or(z.literal("")),
    /** Omitir no JSON = não alterar; "" = remover CPF salvo. */
    payerCpf: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payerCpf === undefined) return;
    if (data.payerCpf.trim() === "") return;
    const p = normalizePayerDocument(data.payerCpf);
    if (!isValidPayerDocument(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido",
        path: ["payerCpf"],
      });
    }
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(6, "A nova senha deve ter ao menos 6 caracteres"),
});

/** Envio de e-mail de teste pelo admin */
export const adminEmailTestSchema = z.object({
  template: z.enum(["activation", "welcome", "password", "reset"]),
  to: z.email("E-mail inv?lido").transform((v) => v.toLowerCase()),
});

const dataImageUrl = z
  .string()
  .regex(
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i,
    "Use PNG, JPG, WebP ou GIF em base64",
  )
  .max(2_500_000, "Imagem muito grande (m?x. ~1,8 MB em base64)");

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
        downloadApp1Url: z.union([z.string().url("Informe uma URL v?lida"), z.literal("")]),
        downloadApp1ImageUrl: z.union([z.string().url("Informe uma URL v?lida"), z.literal("")]),
        downloadApp2Name: z.string().max(50),
        downloadApp2Url: z.union([z.string().url("Informe uma URL v?lida"), z.literal("")]),
        downloadApp2ImageUrl: z.union([z.string().url("Informe uma URL v?lida"), z.literal("")]),
        downloadApp3Name: z.string().max(50),
        downloadApp3Url: z.union([z.string().url("Informe uma URL v?lida"), z.literal("")]),
        downloadApp3ImageUrl: z.union([z.string().url("Informe uma URL v?lida"), z.literal("")]),
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
        message: "Informe um n?mero de WhatsApp v?lido para ativar o bot?o.",
        path: ["whatsappNumber"],
      });
    }
  });

export const wooviSettingsSchema = z.object({
  paymentProvider: z.nativeEnum(PaymentProvider),
  wooviApiKey: z.string().max(300).optional().or(z.literal("")),
  wooviWebhookSecret: z.string().max(300).optional().or(z.literal("")),
  ggpixApiKey: z.string().max(300).optional().or(z.literal("")),
  ggpixWebhookSecret: z.string().max(300).optional().or(z.literal("")),
});

export const lowStockAlertSettingsSchema = z
  .object({
    lowStockAlertEnabled: z.boolean(),
    lowStockThreshold: z.coerce.number().int().min(0).max(1_000_000),
    lowStockNotifyEmail: z.string().max(254).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    const raw = (val.lowStockNotifyEmail ?? "").trim();
    if (!raw) return;
    const parsed = z.email().safeParse(raw);
    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "E-mail inv?lido",
        path: ["lowStockNotifyEmail"],
      });
    }
  });
