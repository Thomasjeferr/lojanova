"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
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
  { value: "arial", label: "Arial · 400/700 nativos; demais pesos sintetizados" },
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
        className="theme-focus-input w-full resize-y rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
    </div>
  );
}

const ACCEPT_LANDING_APP_IMAGE = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
const MAX_LANDING_APP_IMAGE_BYTES = 1_800_000;
const MIME_LANDING_APP = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i;

function readLandingAppImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_LANDING_APP_IMAGE_BYTES) {
      reject(
        new Error(`Arquivo muito grande (máx. ${Math.round(MAX_LANDING_APP_IMAGE_BYTES / 1024)} KB)`),
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler o arquivo"));
        return;
      }
      if (!MIME_LANDING_APP.test(result)) {
        reject(new Error("Formato não suportado. Use PNG, JPG, WebP ou GIF."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function LandingAppImageUrlRow({
  id,
  label,
  value,
  disabled,
  onChange,
  onUploadError,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  onUploadError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isDataUrl = value.startsWith("data:image/");

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || disabled) return;
    try {
      const dataUrl = await readLandingAppImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : "Erro no upload");
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          id={id}
          type="text"
          className="min-w-0 flex-1 font-mono text-xs sm:text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... ou “Enviar imagem”"
          disabled={disabled}
          title={isDataUrl ? "Imagem embutida (salva no banco ao clicar em Salvar)" : value || undefined}
        />
        <div className="flex shrink-0 flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_LANDING_APP_IMAGE}
            className="sr-only"
            onChange={(e) => void onFilePick(e)}
            tabIndex={-1}
            aria-hidden
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="touch-manipulation"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
            Enviar imagem
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange("")}>
              Limpar
            </Button>
          ) : null}
        </div>
      </div>
      {isDataUrl ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Imagem carregada — clique em &quot;Salvar textos da landing&quot; para persistir.
        </p>
      ) : null}
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

  function updateFaqItem(index: number, field: "question" | "answer", value: string) {
    setCopy((p) => {
      const next = [...p.faqItems];
      const cur = next[index];
      if (!cur) return p;
      next[index] = { ...cur, [field]: value };
      return { ...p, faqItems: next };
    });
  }

  function addFaqItem() {
    setCopy((p) => ({
      ...p,
      faqItems: [...p.faqItems, { question: "Nova pergunta", answer: "Resposta." }],
    }));
  }

  function removeFaqItem(index: number) {
    setCopy((p) => ({
      ...p,
      faqItems: p.faqItems.filter((_, i) => i !== index),
    }));
  }

  async function save() {
    if (disabled) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const composedTitle = `${copy.downloadHeroTitlePrefix}${copy.downloadHeroTitleHighlight}${copy.downloadHeroTitleSuffix}`.trim();
      const payload = {
        ...copy,
        downloadAppsTitle: composedTitle || copy.downloadAppsTitle,
      };
      const res = await fetch("/api/admin/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingCopy: payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar os textos.");
        return;
      }
      setSuccess("Textos salvos. Recarregue a home para ver as alterações.");
      setTimeout(() => setSuccess(""), 3500);
      if (composedTitle) {
        setCopy((c) => ({ ...c, downloadAppsTitle: composedTitle }));
      }
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
            className="theme-focus-input w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
            className="theme-focus-input w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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

      <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">FAQ: perguntas e respostas</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Alimentam a seção na home e o JSON-LD de FAQ (SEO).
        </p>
        {copy.faqItems.map((item, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-600/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Item {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 dark:text-red-400"
                disabled={off || copy.faqItems.length <= 1}
                onClick={() => removeFaqItem(index)}
              >
                Remover
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`faq-q-${index}`}>Pergunta</Label>
              <Input
                id={`faq-q-${index}`}
                value={item.question}
                onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                disabled={off}
              />
            </div>
            <TextAreaField
              id={`faq-a-${index}`}
              label="Resposta"
              value={item.answer}
              onChange={(v) => updateFaqItem(index, "answer", v)}
              rows={3}
              disabled={off}
            />
          </div>
        ))}
        <Button type="button" variant="outline" disabled={off} onClick={addFaqItem}>
          Adicionar pergunta
        </Button>
      </div>

      <TextAreaField
        id="footerTagline"
        label="Rodapé: frase da marca"
        value={copy.footerTagline}
        onChange={(v) => setField("footerTagline", v)}
        rows={2}
        disabled={off}
      />

      <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Seção: Por que escolher (4 cards)</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Use <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-700">**assim**</code> no subtítulo para negrito.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="benefitsTitle">Título da seção</Label>
          <Input
            id="benefitsTitle"
            value={copy.benefitsTitle}
            onChange={(e) => setField("benefitsTitle", e.target.value)}
            disabled={off}
          />
        </div>
        <TextAreaField
          id="benefitsSubtitle"
          label="Subtítulo (abaixo do título)"
          value={copy.benefitsSubtitle}
          onChange={(v) => setField("benefitsSubtitle", v)}
          rows={3}
          disabled={off}
        />
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="grid gap-3 rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-600/50 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`benefit${n}Title`}>Card {n}: título</Label>
              <Input
                id={`benefit${n}Title`}
                value={copy[`benefit${n}Title` as keyof LandingCopy] as string}
                onChange={(e) => setField(`benefit${n}Title` as keyof LandingCopy, e.target.value)}
                disabled={off}
              />
            </div>
            <TextAreaField
              id={`benefit${n}Description`}
              label={`Card ${n}: texto`}
              value={copy[`benefit${n}Description` as keyof LandingCopy] as string}
              onChange={(v) => setField(`benefit${n}Description` as keyof LandingCopy, v)}
              rows={2}
              disabled={off}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bloco SEO (Pix / confiança)</p>
        <div className="space-y-1.5">
          <Label htmlFor="trustSeoTitle">Título (H2)</Label>
          <Input
            id="trustSeoTitle"
            value={copy.trustSeoTitle}
            onChange={(e) => setField("trustSeoTitle", e.target.value)}
            disabled={off}
          />
        </div>
        <TextAreaField
          id="trustSeoParagraph1"
          label="Parágrafo 1 (**negrito**)"
          value={copy.trustSeoParagraph1}
          onChange={(v) => setField("trustSeoParagraph1", v)}
          rows={4}
          disabled={off}
        />
        <TextAreaField
          id="trustSeoParagraph2"
          label="Parágrafo 2"
          value={copy.trustSeoParagraph2}
          onChange={(v) => setField("trustSeoParagraph2", v)}
          rows={4}
          disabled={off}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="trustSeoLink1Label">Link 1 — texto</Label>
            <Input
              id="trustSeoLink1Label"
              value={copy.trustSeoLink1Label}
              onChange={(e) => setField("trustSeoLink1Label", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trustSeoLink1Href">Link 1 — URL ou caminho</Label>
            <Input
              id="trustSeoLink1Href"
              value={copy.trustSeoLink1Href}
              onChange={(e) => setField("trustSeoLink1Href", e.target.value)}
              placeholder="/comprar-iptv"
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trustSeoLink2Label">Link 2 — texto</Label>
            <Input
              id="trustSeoLink2Label"
              value={copy.trustSeoLink2Label}
              onChange={(e) => setField("trustSeoLink2Label", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trustSeoLink2Href">Link 2 — URL ou caminho</Label>
            <Input
              id="trustSeoLink2Href"
              value={copy.trustSeoLink2Href}
              onChange={(e) => setField("trustSeoLink2Href", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trustSeoLink3Label">Link 3 — texto</Label>
            <Input
              id="trustSeoLink3Label"
              value={copy.trustSeoLink3Label}
              onChange={(e) => setField("trustSeoLink3Label", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trustSeoLink3Href">Link 3 — URL ou caminho</Label>
            <Input
              id="trustSeoLink3Href"
              value={copy.trustSeoLink3Href}
              onChange={(e) => setField("trustSeoLink3Href", e.target.value)}
              disabled={off}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Seção: Como funciona</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="howItWorksTitlePrefix">Título — antes do destaque</Label>
            <Input
              id="howItWorksTitlePrefix"
              value={copy.howItWorksTitlePrefix}
              onChange={(e) => setField("howItWorksTitlePrefix", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="howItWorksTitleHighlight">Palavra em laranja</Label>
            <Input
              id="howItWorksTitleHighlight"
              value={copy.howItWorksTitleHighlight}
              onChange={(e) => setField("howItWorksTitleHighlight", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="howItWorksTitleSuffix">Título — depois do destaque</Label>
            <Input
              id="howItWorksTitleSuffix"
              value={copy.howItWorksTitleSuffix}
              onChange={(e) => setField("howItWorksTitleSuffix", e.target.value)}
              disabled={off}
            />
          </div>
        </div>
        <TextAreaField
          id="howItWorksSubtitle"
          label="Subtítulo da seção"
          value={copy.howItWorksSubtitle}
          onChange={(v) => setField("howItWorksSubtitle", v)}
          rows={2}
          disabled={off}
        />
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="grid gap-3 rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-600/50 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`howItWorksStep${n}Title`}>Passo {n}: título</Label>
              <Input
                id={`howItWorksStep${n}Title`}
                value={copy[`howItWorksStep${n}Title` as keyof LandingCopy] as string}
                onChange={(e) => setField(`howItWorksStep${n}Title` as keyof LandingCopy, e.target.value)}
                disabled={off}
              />
            </div>
            <TextAreaField
              id={`howItWorksStep${n}Description`}
              label={`Passo ${n}: descrição`}
              value={copy[`howItWorksStep${n}Description` as keyof LandingCopy] as string}
              onChange={(v) => setField(`howItWorksStep${n}Description` as keyof LandingCopy, v)}
              rows={2}
              disabled={off}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30 sm:p-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Download de apps</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="downloadInstallationBadge">Selo acima do título (ex.: Guia rápido)</Label>
            <Input
              id="downloadInstallationBadge"
              value={copy.downloadInstallationBadge}
              onChange={(e) => setField("downloadInstallationBadge", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadFeaturedLabel">Selo &quot;Recomendado&quot; no método 1</Label>
            <Input
              id="downloadFeaturedLabel"
              value={copy.downloadFeaturedLabel}
              onChange={(e) => setField("downloadFeaturedLabel", e.target.value)}
              disabled={off}
            />
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="downloadHeroTitlePrefix">Título grande — antes do destaque</Label>
            <Input
              id="downloadHeroTitlePrefix"
              value={copy.downloadHeroTitlePrefix}
              onChange={(e) => setField("downloadHeroTitlePrefix", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadHeroTitleHighlight">Palavra em gradiente</Label>
            <Input
              id="downloadHeroTitleHighlight"
              value={copy.downloadHeroTitleHighlight}
              onChange={(e) => setField("downloadHeroTitleHighlight", e.target.value)}
              disabled={off}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="downloadHeroTitleSuffix">Título — após o destaque</Label>
            <Input
              id="downloadHeroTitleSuffix"
              value={copy.downloadHeroTitleSuffix}
              onChange={(e) => setField("downloadHeroTitleSuffix", e.target.value)}
              disabled={off}
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pré-visualização do título:{" "}
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {`${copy.downloadHeroTitlePrefix}${copy.downloadHeroTitleHighlight}${copy.downloadHeroTitleSuffix}`.trim() ||
              copy.downloadAppsTitle}
          </span>
        </p>
        <TextAreaField
          id="downloadAppsSubtitle"
          label="Subtítulo da seção (abaixo do título)"
          value={copy.downloadAppsSubtitle}
          onChange={(v) => setField("downloadAppsSubtitle", v)}
          rows={2}
          disabled={off}
        />
        <div className="space-y-1.5">
          <Label htmlFor="downloadAppsButtonLabel">Texto do botão &quot;Baixar&quot; nos cards de app</Label>
          <Input
            id="downloadAppsButtonLabel"
            value={copy.downloadAppsButtonLabel}
            onChange={(e) => setField("downloadAppsButtonLabel", e.target.value)}
            disabled={off}
          />
        </div>

        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Método 1 e 2 (cards de instalação)</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Passos: um por linha (mesma ordem da landing).
        </p>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-600/50">
            <div className="space-y-1.5">
              <Label htmlFor="downloadMethod1Badge">Método 1 — selo</Label>
              <Input
                id="downloadMethod1Badge"
                value={copy.downloadMethod1Badge}
                onChange={(e) => setField("downloadMethod1Badge", e.target.value)}
                disabled={off}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="downloadMethod1Title">Método 1 — título</Label>
              <Input
                id="downloadMethod1Title"
                value={copy.downloadMethod1Title}
                onChange={(e) => setField("downloadMethod1Title", e.target.value)}
                disabled={off}
              />
            </div>
            <TextAreaField
              id="downloadMethod1Subtitle"
              label="Método 1 — subtítulo"
              value={copy.downloadMethod1Subtitle}
              onChange={(v) => setField("downloadMethod1Subtitle", v)}
              rows={2}
              disabled={off}
            />
            <TextAreaField
              id="downloadMethod1Steps"
              label="Método 1 — passos (um por linha)"
              value={copy.downloadMethod1Steps}
              onChange={(v) => setField("downloadMethod1Steps", v)}
              rows={6}
              disabled={off}
            />
          </div>
          <div className="space-y-3 rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-600/50">
            <div className="space-y-1.5">
              <Label htmlFor="downloadMethod2Badge">Método 2 — selo</Label>
              <Input
                id="downloadMethod2Badge"
                value={copy.downloadMethod2Badge}
                onChange={(e) => setField("downloadMethod2Badge", e.target.value)}
                disabled={off}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="downloadMethod2Title">Método 2 — título</Label>
              <Input
                id="downloadMethod2Title"
                value={copy.downloadMethod2Title}
                onChange={(e) => setField("downloadMethod2Title", e.target.value)}
                disabled={off}
              />
            </div>
            <TextAreaField
              id="downloadMethod2Subtitle"
              label="Método 2 — subtítulo"
              value={copy.downloadMethod2Subtitle}
              onChange={(v) => setField("downloadMethod2Subtitle", v)}
              rows={2}
              disabled={off}
            />
            <TextAreaField
              id="downloadMethod2Steps"
              label="Método 2 — passos (um por linha)"
              value={copy.downloadMethod2Steps}
              onChange={(v) => setField("downloadMethod2Steps", v)}
              rows={5}
              disabled={off}
            />
          </div>
        </div>
        <TextAreaField
          id="downloadPlaceholderHint"
          label="Texto quando não há imagem do app nos cards"
          value={copy.downloadPlaceholderHint}
          onChange={(v) => setField("downloadPlaceholderHint", v)}
          rows={2}
          disabled={off}
        />
        <TextAreaField
          id="downloadSecurityTip"
          label="Barra de dica de segurança (abaixo dos métodos)"
          value={copy.downloadSecurityTip}
          onChange={(v) => setField("downloadSecurityTip", v)}
          rows={2}
          disabled={off}
        />
        <TextAreaField
          id="downloadAppCardDescription"
          label="Descrição nos cards de app (lista inferior)"
          value={copy.downloadAppCardDescription}
          onChange={(v) => setField("downloadAppCardDescription", v)}
          rows={2}
          disabled={off}
        />

        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Apps (até 3)</p>
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
          <LandingAppImageUrlRow
            id="downloadApp1ImageUrl"
            label="App 1: imagem (URL ou upload)"
            value={copy.downloadApp1ImageUrl}
            disabled={off}
            onChange={(v) => setField("downloadApp1ImageUrl", v)}
            onUploadError={setError}
          />
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
          <LandingAppImageUrlRow
            id="downloadApp2ImageUrl"
            label="App 2: imagem (URL ou upload)"
            value={copy.downloadApp2ImageUrl}
            disabled={off}
            onChange={(v) => setField("downloadApp2ImageUrl", v)}
            onUploadError={setError}
          />
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
          <LandingAppImageUrlRow
            id="downloadApp3ImageUrl"
            label="App 3: imagem (URL ou upload)"
            value={copy.downloadApp3ImageUrl}
            disabled={off}
            onChange={(v) => setField("downloadApp3ImageUrl", v)}
            onUploadError={setError}
          />
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

