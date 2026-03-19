import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { EmptyState } from "@/components/admin/empty-state";
import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes e histórico de compras."
      />
      <SectionCard title="Clientes">
        <EmptyState
          icon={Users}
          title="Em breve"
          description="A listagem de clientes será disponibilizada aqui. Por enquanto, você pode ver os pedidos em Pedidos para identificar compradores."
        />
      </SectionCard>
    </div>
  );
}
