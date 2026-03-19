"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export function AdminCodesImportCard({
  plans,
}: {
  plans: Array<{ id: string; title: string }>;
}) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [codesRaw, setCodesRaw] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const codes = codesRaw
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (codes.length === 0) {
      setMessage({ type: "err", text: "Cole pelo menos um código." });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/codes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, codes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: data.error ?? "Falha ao importar.",
        });
        setLoading(false);
        return;
      }
      setMessage({
        type: "ok",
        text: `${data.imported} código(s) importado(s) com sucesso.`,
      });
      setCodesRaw("");
      window.dispatchEvent(new CustomEvent("admin-codes-refresh"));
    } catch {
      setMessage({ type: "err", text: "Erro ao conectar." });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="codes-plan"
          className="block text-sm font-medium text-zinc-700"
        >
          Plano de destino
        </label>
        <select
          id="codes-plan"
          className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="codes-textarea"
          className="block text-sm font-medium text-zinc-700"
        >
          Códigos (um por linha ou separados por vírgula)
        </label>
        <Textarea
          id="codes-textarea"
          rows={12}
          placeholder="CODE-XXX-001&#10;CODE-XXX-002&#10;CODE-XXX-003"
          value={codesRaw}
          onChange={(e) => setCodesRaw(e.target.value)}
          className="min-h-[200px] rounded-xl font-mono text-sm"
        />
      </div>
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
              : "border-red-200/80 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
      <Button
        onClick={submit}
        disabled={loading}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {loading ? "Importando..." : "Importar códigos"}
      </Button>
    </div>
  );
}
