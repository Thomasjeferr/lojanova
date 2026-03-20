"use client";

import { AccessCard } from "./access-card";
import { EmptyState } from "./empty-state";
import { KeyRound } from "lucide-react";

type AccessItem = {
  id: string;
  planTitle: string;
  durationDays: number;
  code: string;
  credentialType: "activation_code" | "username_password";
  deliveredAt: Date | string;
};

type AccessPageClientProps = {
  access: AccessItem[];
};

const RECENT_DAYS = 7;

export function AccessPageClient({ access }: AccessPageClientProps) {
  const now = Date.now();
  const recentCutoff = now - RECENT_DAYS * 24 * 60 * 60 * 1000;

  if (access.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        title="Nenhum acesso ainda"
        description="Após comprar um plano e o pagamento ser aprovado, seu código aparecerá aqui."
        actionLabel="Ver planos"
        actionHref="/#planos"
      />
    );
  }

  return (
    <div className="space-y-4">
      {access.map((item) => {
        const deliveredAt = new Date(item.deliveredAt).getTime();
        const isRecent = deliveredAt >= recentCutoff;
        return (
          <AccessCard
            key={item.id}
            planTitle={item.planTitle}
            durationDays={item.durationDays}
            code={item.code}
            credentialType={item.credentialType}
            deliveredAt={item.deliveredAt}
            isRecent={isRecent}
          />
        );
      })}
    </div>
  );
}
