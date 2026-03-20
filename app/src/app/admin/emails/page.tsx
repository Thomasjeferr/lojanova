import { PageHeader } from "@/components/admin/page-header";
import { EmailTemplatesAdminPanel } from "@/components/admin/email-templates-admin-panel";

export default function AdminEmailsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="E-mails transacionais"
        subtitle="Modelos automáticos do sistema e envio de teste pela Resend."
      />
      <EmailTemplatesAdminPanel />
    </div>
  );
}
