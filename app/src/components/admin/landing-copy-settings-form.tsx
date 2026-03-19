"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LandingCopy } from "@/lib/site-branding";
import { cn } from "@/lib/utils";

const FONT_OPTIONS: Array<{ value: LandingCopy["fontPreset"]; label: string }> = [
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "roboto", label: "Roboto" },
  { value: "lato", label: "Lato" },
  { value: "nunito", label: "Nunito" },
  { value: "opensans", label: "Open Sans" },
  { value: "raleway", label: "Raleway" },
  { value: "sora", label: "Sora" },
  { value: "outfit", label: "Outfit" },
];

function TextAreaField({
  id,
  label,
  value,
  onChange,
  rows = 3,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="theme-focus-input w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400"
      />
    </div>
  );
}

export function LandingCopySettingsForm({
  initial,
  disabled = false,
}: {
  initial: LandingCopy;
  disabled?: boolean;
}) {
  const [copy, setCopy] = useState<LandingCopy>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function setField<K extends keyof LandingCopy>(key: K, value: LandingCopy[K]) {
    setCopy((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (disabled) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingCopy: copy }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar os textos.");
        return;
      }
      setSuccess("Textos salvos. Recarregue a home para ver as alterações.");
      setTimeout(() => setSuccess(""), 3500);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  const off = loading || disabled;

  return (
    <div className={cn("space-y-7", disabled && "opacity-60")}>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fontPreset">Fonte da landing</Label>
          <select
            id="fontPreset"
            value={copy.fontPreset}
            onChange={(e) => setField("fontPreset", e.target.value as LandingCopy["fontPreset"])}
            disabled={off}
            className="theme-focus-input w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fontSizePreset">Tamanho base da fonte</Label>
          <select
            id="fontSizePreset"
            value={copy.fontSizePreset}
            onChange={(e) => setField("fontSizePreset", e.target.value as LandingCopy["fontSizePreset"])}
            disabled={off}
            className="theme-focus-input w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900"
          >
            <option value="sm">Pequena</option>
            <option value="md">Média (padrão)</option>
            <option value="lg">Grande</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="textPrimaryColor">Cor fonte principal</Label>
          <Input
            id="textPrimaryColor"
            type="color"
            value={copy.textPrimaryColor}
            onChange={(e) => setField("textPrimaryColor", e.target.value)}
            disabled={off}
            className="h-11 w-full cursor-pointer rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="textSecondaryColor">Cor fonte secundária</Label>
          <Input
            id="textSecondaryColor"
            type="color"
            value={copy.textSecondaryColor}
            onChange={(e) => setField("textSecondaryColor", e.target.value)}
            disabled={off}
            className="h-11 w-full cursor-pointer rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="textMutedColor">Cor fonte de apoio</Label>
          <Input
            id="textMutedColor"
            type="color"
            value={copy.textMutedColor}
            onChange={(e) => setField("textMutedColor", e.target.value)}
            disabled={off}
            className="h-11 w-full cursor-pointer rounded-xl"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TextAreaField
          id="heroEyebrow"
          label="Hero: faixa superior"
          value={copy.heroEyebrow}
          onChange={(v) => setField("heroEyebrow", v)}
          rows={2}
          disabled={off}
        />
        <div className="space-y-1.5">
          <Label htmlFor="heroTitlePrefix">Hero: título (parte 1)</Label>
          <Input
            id="heroTitlePrefix"
            value={copy.heroTitlePrefix}
            onChange={(e) => setField("heroTitlePrefix", e.target.value)}
            disabled={off}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heroTitleHighlight">Hero: palavra destacada</Label>
          <Input
            id="heroTitleHighlight"
            value={copy.heroTitleHighlight}
            onChange={(e) => setField("heroTitleHighlight", e.target.value)}
            disabled={off}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heroTitleSuffix">Hero: título (parte 2)</Label>
          <Input
            id="heroTitleSuffix"
            value={copy.heroTitleSuffix}
            onChange={(e) => setField("heroTitleSuffix", e.target.value)}
            disabled={off}
          />
        </div>
      </div>

      <TextAreaField
        id="heroSubtitle"
        label="Hero: subtítulo"
        value={copy.heroSubtitle}
        onChange={(v) => setField("heroSubtitle", v)}
        rows={3}
        disabled={off}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="heroPrimaryCta">Hero: botão principal</Label>
          <Input
            id="heroPrimaryCta"
            value={copy.heroPrimaryCta}
            onChange={(e) => setField("heroPrimaryCta", e.target.value)}
            disabled={off}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heroSecondaryCta">Hero: botão secundário</Label>
          <Input
            id="heroSecondaryCta"
            value={copy.heroSecondaryCta}
            onChange={(e) => setField("heroSecondaryCta", e.target.value)}
            disabled={off}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="plansTitle">Planos: título</Label>
          <Input
            id="plansTitle"
            value={copy.plansTitle}
            onChange={(e) => setField("plansTitle", e.target.value)}
            disabled={off}
          />
        </div>
        <TextAreaField
          id="plansSubtitle"
          label="Planos: subtítulo"
          value={copy.plansSubtitle}
          onChange={(v) => setField("plansSubtitle", v)}
          rows={2}
          disabled={off}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="planBadgePopular">Card: badge destaque</Label>
          <Input
            id="planBadgePopular"
            value={copy.planBadgePopular}
            onChange={(e) => setField("planBadgePopular", e.target.value)}
            disabled={off}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="planPriceCaption">Card: legenda do preço</Label>
          <Input
            id="planPriceCaption"
            value={copy.planPriceCaption}
            onChange={(e) => setField("planPriceCaption", e.target.value)}
            disabled={off}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="planBuyButton">Card: botão de compra</Label>
          <Input
            id="planBuyButton"
            value={copy.planBuyButton}
            onChange={(e) => setField("planBuyButton", e.target.value)}
            disabled={off}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="faqTitle">FAQ: título</Label>
          <Input
            id="faqTitle"
            value={copy.faqTitle}
            onChange={(e) => setField("faqTitle", e.target.value)}
            disabled={off}
          />
        </div>
        <TextAreaField
          id="faqSubtitle"
          label="FAQ: subtítulo"
          value={copy.faqSubtitle}
          onChange={(v) => setField("faqSubtitle", v)}
          rows={2}
          disabled={off}
        />
      </div>

      <TextAreaField
        id="footerTagline"
        label="Rodapé: frase da marca"
        value={copy.footerTagline}
        onChange={(v) => setField("footerTagline", v)}
        rows={2}
        disabled={off}
      />

      <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900">Download de apps</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="downloadAppsTitle">Título da seção</Label>
            <Input
              id="downloadAppsTitle"
              value={copy.downloadAppsTitle}
              onChange={(e) => setField("downloadAppsTitle", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadAppsButtonLabel">Texto do botão</Label>
            <Input
              id="downloadAppsButtonLabel"
              value={copy.downloadAppsButtonLabel}
              onChange={(e) => setField("downloadAppsButtonLabel", e.target.value)}
              disabled={off}
            />
          </div>
        </div>
        <TextAreaField
          id="downloadAppsSubtitle"
          label="Subtítulo da seção"
          value={copy.downloadAppsSubtitle}
          onChange={(v) => setField("downloadAppsSubtitle", v)}
          rows={2}
          disabled={off}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp1Name">App 1: nome</Label>
            <Input
              id="downloadApp1Name"
              value={copy.downloadApp1Name}
              onChange={(e) => setField("downloadApp1Name", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp1Url">App 1: link</Label>
            <Input
              id="downloadApp1Url"
              type="url"
              value={copy.downloadApp1Url}
              onChange={(e) => setField("downloadApp1Url", e.target.value)}
              placeholder="https://..."
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp1ImageUrl">App 1: imagem (URL)</Label>
            <Input
              id="downloadApp1ImageUrl"
              type="url"
              value={copy.downloadApp1ImageUrl}
              onChange={(e) => setField("downloadApp1ImageUrl", e.target.value)}
              placeholder="https://..."
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp2Name">App 2: nome</Label>
            <Input
              id="downloadApp2Name"
              value={copy.downloadApp2Name}
              onChange={(e) => setField("downloadApp2Name", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp2Url">App 2: link</Label>
            <Input
              id="downloadApp2Url"
              type="url"
              value={copy.downloadApp2Url}
              onChange={(e) => setField("downloadApp2Url", e.target.value)}
              placeholder="https://..."
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp2ImageUrl">App 2: imagem (URL)</Label>
            <Input
              id="downloadApp2ImageUrl"
              type="url"
              value={copy.downloadApp2ImageUrl}
              onChange={(e) => setField("downloadApp2ImageUrl", e.target.value)}
              placeholder="https://..."
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp3Name">App 3: nome</Label>
            <Input
              id="downloadApp3Name"
              value={copy.downloadApp3Name}
              onChange={(e) => setField("downloadApp3Name", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp3Url">App 3: link</Label>
            <Input
              id="downloadApp3Url"
              type="url"
              value={copy.downloadApp3Url}
              onChange={(e) => setField("downloadApp3Url", e.target.value)}
              placeholder="https://..."
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadApp3ImageUrl">App 3: imagem (URL)</Label>
            <Input
              id="downloadApp3ImageUrl"
              type="url"
              value={copy.downloadApp3ImageUrl}
              onChange={(e) => setField("downloadApp3ImageUrl", e.target.value)}
              placeholder="https://..."
              disabled={off}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      <Button onClick={save} disabled={off}>
        {loading ? "Salvando..." : "Salvar textos da landing"}
      </Button>
    </div>
  );
}

