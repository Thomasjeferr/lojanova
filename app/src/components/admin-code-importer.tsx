"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminCodeImporter({ plans }: { plans: Array<{ id: string; title: string }> }) {
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [codesRaw, setCodesRaw] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const codes = codesRaw
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter(Boolean);

    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/codes/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, codes }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "Falha ao importar");
      return;
    }
    setMessage(`Importação concluída: ${data.imported} códigos`);
    setCodesRaw("");
  }

  return (
    <div className="mt-4 space-y-3">
      <select
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        value={planId}
        onChange={(e) => setPlanId(e.target.value)}
      >
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.title}
          </option>
        ))}
      </select>
      <Textarea
        rows={8}
        placeholder="Cole seus códigos aqui (um por linha ou separados por vírgula)"
        value={codesRaw}
        onChange={(e) => setCodesRaw(e.target.value)}
      />
      <Button onClick={submit} disabled={loading}>
        {loading ? "Importando..." : "Importar códigos"}
      </Button>
      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}
