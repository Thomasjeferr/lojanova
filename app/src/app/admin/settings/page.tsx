import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSiteBranding } from "@/lib/site-branding";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { BrandingSettingsForm } from "@/components/admin/branding-settings-form";
import { BrandingDbBanner } from "@/components/admin/branding-db-banner";
import { ThemeSwitcherSection } from "@/components/admin/theme-switcher-section";
import { LandingCopySettingsForm } from "@/components/admin/landing-copy-settings-form";
import { WhatsAppSettingsForm } from "@/components/admin/whatsapp-settings-form";
import { LowStockAlertSettingsForm } from "@/components/admin/low-stock-alert-settings-form";
import { WooviSettingsForm } from "@/components/admin/woovi-settings-form";
import { EvolutionWhatsAppSettings } from "@/components/admin/evolution-whatsapp-settings";
import { CONTACT_FALLBACK } from "@/lib/contact-settings";
import { env } from "@/lib/env";
import { PRODUCTION_PUBLIC_SITE_URL } from "@/lib/public-site-url";
import { PAYMENT_GATEWAY_FALLBACK } from "@/lib/woovi-settings";

async function siteBrandingTableExists(): Promise<boolean> {
  try {
    await prisma.siteBranding.findFirst({ take: 1 });
    return true;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return false;
    }
    throw e;
  }
}

async function contactSettingsTableExists(): Promise<boolean> {
  try {
    await prisma.appSettings.findFirst({ take: 1 });
    return true;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return false;
    }
    throw e;
  }
}

export default async function AdminSettingsPage() {
  const [initial, brandingTableOk, contactTableOk, contactRow] = await Promise.all([
    getSiteBranding(),
    siteBrandingTableExists(),
    contactSettingsTableExists(),
    prisma.appSettings.findUnique({ where: { id: "default" } }).catch(() => null),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Configurações"
        subtitle="Template visual da loja pública, logo, favicon e nome — white-label pronto para revenda."
      />
      {!brandingTableOk && <BrandingDbBanner />}
      <SectionCard title="Template visual da loja">
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Escolha entre dois temas premium para a home, checkout e áreas públicas. A alteração é
          salva no banco e aplicada automaticamente em todo o site (variáveis CSS por{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">data-theme</code>).
        </p>
        <ThemeSwitcherSection currentTheme={initial.activeTheme} disabled={!brandingTableOk} />
      </SectionCard>
      <SectionCard title="Identidade visual (logo e nome)">
        <BrandingSettingsForm
          initial={{
            logoDataUrl: initial.logoDataUrl,
            faviconDataUrl: initial.faviconDataUrl,
            storeDisplayName: initial.storeDisplayName,
          }}
          disabled={!brandingTableOk}
        />
      </SectionCard>
      <SectionCard title="Textos da landing">
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Edite os textos principais da home pública sem mexer em código. Salve e recarregue a
          página da loja para validar o resultado.
        </p>
        <LandingCopySettingsForm initial={initial.landingCopy} disabled={!brandingTableOk} />
      </SectionCard>
      <SectionCard title="Contato, WhatsApp e SMS">
        {!contactTableOk && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-100">
            Estrutura AppSettings não encontrada. Rode <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">npx prisma db push</code> na pasta
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50"> app/</code> e reinicie o servidor.
          </div>
        )}
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Botão de WhatsApp no site (link) e envio da credencial por SMS (Twilio). A entrega da
          credencial pelo WhatsApp da loja usa Evolution na seção abaixo.
        </p>
        <WhatsAppSettingsForm
          disabled={!contactTableOk}
          initial={{
            whatsappEnabled: contactRow?.whatsappEnabled ?? CONTACT_FALLBACK.whatsappEnabled,
            whatsappNumber: contactRow?.whatsappNumber || "",
            whatsappMessage: contactRow?.whatsappMessage || CONTACT_FALLBACK.whatsappMessage,
            whatsappLabel: contactRow?.whatsappLabel || CONTACT_FALLBACK.whatsappLabel,
            smsDeliveryEnabled: contactRow?.smsDeliveryEnabled ?? true,
          }}
        />
      </SectionCard>
      <SectionCard title="WhatsApp Evolution (acesso e recuperação)">
        {!contactTableOk && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-100">
            Estrutura AppSettings não encontrada. Rode <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">npx prisma db push</code> na pasta
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50"> app/</code> e reinicie o servidor.
          </div>
        )}
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Conecte o número da loja via QR, ative o envio automático da credencial após o Pix e,
          opcionalmente, lembretes para pedidos ainda pendentes. Depende de{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">EVOLUTION_API_URL</code> e{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">EVOLUTION_API_KEY</code> na Vercel.
        </p>
        <EvolutionWhatsAppSettings
          disabled={!contactTableOk}
          initial={{
            evolutionDeliveryEnabled: contactRow?.evolutionDeliveryEnabled ?? false,
            evolutionDeliveryTemplate: contactRow?.evolutionDeliveryTemplate || "",
            evolutionRecoveryEnabled: contactRow?.evolutionRecoveryEnabled ?? false,
            evolutionRecoveryTemplate: contactRow?.evolutionRecoveryTemplate || "",
            evolutionRecoveryAfterMinutes: contactRow?.evolutionRecoveryAfterMinutes ?? 60,
          }}
        />
      </SectionCard>
      <SectionCard title="Alerta de estoque (admin)">
        {!contactTableOk && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-100">
            Estrutura AppSettings não encontrada. Rode <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">npx prisma db push</code> na pasta
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50"> app/</code> e reinicie o servidor.
          </div>
        )}
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Receba um e-mail quando planos <strong>ativos</strong> estiverem com poucos códigos
          disponíveis. O limite é único para todos os planos. Configure{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">RESEND_API_KEY</code>,{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">RESEND_FROM</code> (domínio
          verificado no Resend), <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">CRON_SECRET</code>{" "}
          e o cron na Vercel (<code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800 dark:text-zinc-200">vercel.json</code>
          — alerta a cada 15 min).
        </p>
        <LowStockAlertSettingsForm
          disabled={!contactTableOk}
          fallbackNotifyEmailHint={env.ADMIN_EMAIL}
          initial={{
            lowStockAlertEnabled: contactRow?.lowStockAlertEnabled ?? false,
            lowStockThreshold: contactRow?.lowStockThreshold ?? 5,
            lowStockNotifyEmail: contactRow?.lowStockNotifyEmail ?? "",
            lowStockAlertLastSentAt:
              contactRow?.lowStockAlertLastSentAt?.toISOString() ?? null,
          }}
        />
      </SectionCard>
      <SectionCard title="Gateway Pix (Woovi / GGPIXAPI)">
        {!contactTableOk && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-100">
            Estrutura AppSettings não encontrada. Rode <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">npx prisma db push</code> na pasta
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50"> app/</code> e reinicie o servidor.
          </div>
        )}
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Configure o gateway Pix ativo (Woovi ou GGPIXAPI) e suas credenciais por cliente, direto
          no admin, sem editar variáveis de ambiente.
        </p>
        <WooviSettingsForm
          disabled={!contactTableOk}
          publicBaseUrl={PRODUCTION_PUBLIC_SITE_URL}
          initial={{
            paymentProvider:
              (contactRow?.paymentProvider as "woovi" | "ggpix" | undefined) ||
              PAYMENT_GATEWAY_FALLBACK.paymentProvider,
            wooviApiKey: contactRow?.wooviApiKey || PAYMENT_GATEWAY_FALLBACK.wooviApiKey,
            wooviWebhookSecret:
              contactRow?.wooviWebhookSecret || PAYMENT_GATEWAY_FALLBACK.wooviWebhookSecret,
            ggpixApiKey: contactRow?.ggpixApiKey || PAYMENT_GATEWAY_FALLBACK.ggpixApiKey,
            ggpixWebhookSecret:
              contactRow?.ggpixWebhookSecret || PAYMENT_GATEWAY_FALLBACK.ggpixWebhookSecret,
            ggpixWebhookBearer:
              contactRow?.ggpixWebhookBearer || PAYMENT_GATEWAY_FALLBACK.ggpixWebhookBearer,
          }}
        />
      </SectionCard>
    </div>
  );
}
