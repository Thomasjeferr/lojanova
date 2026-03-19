"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currencyBRL } from "@/lib/utils";
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react";

type Plan = {
  id: string;
  title: string;
  slug: string;
  logoDataUrl: string | null;
  durationDays: number;
  priceCents: number;
  benefits: string[];
  isActive: boolean;
  isFeatured: boolean;
};

const emptyPlan: Omit<Plan, "id"> = {
  title: "",
  slug: "",
  logoDataUrl: null,
  durationDays: 30,
  priceCents: 4990,
  benefits: [""],
  isActive: true,
  isFeatured: false,
};

const ACCEPT_IMAGES = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
const MAX_PLAN_LOGO_BYTES = 1_200_000;
const MIME_PLAN_LOGO = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_PLAN_LOGO_BYTES) {
      reject(new Error("Logo muito grande (máx. ~1200 KB)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler o arquivo."));
        return;
      }
      if (!MIME_PLAN_LOGO.test(result)) {
        reject(new Error("Formato inválido. Use PNG, JPG, WebP ou GIF."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

export function AdminPlanManager({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<
    Plan | (Omit<Plan, "id"> & { id?: string })
  >({ ...emptyPlan });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function loadPlans() {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (res.ok) setPlans(data.plans);
    } catch {
      setMessage({ type: "err", text: "Falha ao carregar planos." });
    }
  }

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyPlan });
  }

  function openEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm({ ...plan });
  }

  function setBenefit(index: number, value: string) {
    const next = [...(form.benefits || [""])];
    next[index] = value;
    setForm({ ...form, benefits: next });
  }

  function addBenefit() {
    setForm({
      ...form,
      benefits: [...(form.benefits || [""]), ""],
    });
  }

  function removeBenefit(i: number) {
    const next = form.benefits?.filter((_, idx) => idx !== i) || [""];
    if (next.length === 0) next.push("");
    setForm({ ...form, benefits: next });
  }

  async function removePlan(plan: Plan) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o plano "${plan.title}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeletingId(plan.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/plans?id=${encodeURIComponent(plan.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: data.error || "Não foi possível excluir o plano.",
        });
        return;
      }

      setMessage({ type: "ok", text: "Plano excluído com sucesso." });
      if (editingId === plan.id) {
        setEditingId(null);
        setForm({ ...emptyPlan });
      }
      await loadPlans();
    } catch {
      setMessage({ type: "err", text: "Não foi possível excluir o plano." });
    } finally {
      setDeletingId(null);
    }
  }

  async function save() {
    setLoading(true);
    setMessage(null);
    const payload = {
      ...(form.id && { id: form.id }),
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      durationDays: Number(form.durationDays),
      priceCents: Number(form.priceCents),
      logoDataUrl: form.logoDataUrl ?? null,
      benefits:
        form.benefits?.map((b) => b.trim()).filter(Boolean) || ["Benefício 1"],
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };
    if (payload.benefits.length === 0) payload.benefits = ["Acesso completo"];
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: data.error || "Erro ao salvar plano.",
        });
        setLoading(false);
        return;
      }
      setMessage({ type: "ok", text: "Plano salvo com sucesso." });
      setEditingId(null);
      setForm({ ...emptyPlan });
      loadPlans();
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar plano." });
    }
    setLoading(false);
  }

  async function handlePlanLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessage(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm({ ...form, logoDataUrl: dataUrl });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Erro no upload da logo.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Lista de planos</h2>
        <Button
          variant="outline"
          onClick={openNew}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo plano
        </Button>
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

      <ul className="space-y-2">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/30 px-4 py-3.5"
          >
            <div>
              <p className="font-medium text-zinc-900">{plan.title}</p>
              <p className="text-sm text-zinc-500">
                {plan.durationDays} dias · {currencyBRL(plan.priceCents)}
                {plan.isFeatured && " · Destaque"}
                {!plan.isActive && " · Inativo"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(plan)}
                className="gap-1.5"
                disabled={deletingId === plan.id}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePlan(plan)}
                disabled={deletingId === plan.id}
                className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingId === plan.id ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/30 p-6">
        <h3 className="mb-5 text-base font-semibold text-zinc-900">
          {editingId ? "Editar plano" : "Criar novo plano"}
        </h3>
        <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-700">Logo do produto (topo do card)</p>
              <p className="mt-1 text-xs text-zinc-500">
                Opcional. Aparece no topo do card do plano na landing.
              </p>
            </div>
            <ImageIcon className="h-6 w-6 shrink-0 text-zinc-300" />
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            className="hidden"
            onChange={handlePlanLogoFile}
          />
          <div className="mt-4 flex min-h-[88px] items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 p-3">
            {form.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logoDataUrl}
                alt="Prévia da logo do produto"
                className="max-h-16 max-w-full object-contain"
              />
            ) : (
              <p className="text-xs text-zinc-400">Sem logo para este plano</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {form.logoDataUrl ? "Trocar logo" : "Carregar logo"}
            </Button>
            {form.logoDataUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setForm({ ...form, logoDataUrl: null })}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Título
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Plano 30 dias"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Slug (URL)
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Ex: 30-dias"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Duração (dias)
            </label>
            <Input
              type="number"
              min={1}
              value={form.durationDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationDays: Number(e.target.value) || 30,
                })
              }
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Preço (centavos)
            </label>
            <Input
              type="number"
              min={0}
              value={form.priceCents}
              onChange={(e) =>
                setForm({
                  ...form,
                  priceCents: Number(e.target.value) || 0,
                })
              }
              placeholder="4990 = R$ 49,90"
              className="rounded-xl"
            />
            <p className="text-xs text-zinc-500">
              Ex: 4990 = R$ 49,90 · 11990 = R$ 119,90
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-zinc-700">
            Benefícios
          </label>
          <div className="space-y-2">
            {(form.benefits || [""]).map((b, i) => (
              <div
                key={i}
                className="flex gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2"
              >
                <Input
                  value={b}
                  onChange={(e) => setBenefit(i, e.target.value)}
                  placeholder={`Benefício ${i + 1}`}
                  className="flex-1 rounded-lg border-0 bg-transparent focus:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBenefit(i)}
                  className="shrink-0 text-zinc-500 hover:text-zinc-700"
                >
                  Remover
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBenefit}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar benefício
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500/20"
            />
            <span className="text-sm font-medium text-zinc-700">
              Ativo (visível na landing)
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500/20"
            />
            <span className="text-sm font-medium text-zinc-700">
              Destaque (Mais popular)
            </span>
          </label>
        </div>

        <Button
          className="mt-6 gap-2"
          onClick={save}
          disabled={loading}
        >
          {loading
            ? "Salvando..."
            : editingId
              ? "Atualizar plano"
              : "Criar plano"}
        </Button>
      </div>
    </div>
  );
}
