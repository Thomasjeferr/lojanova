"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT_IMAGES = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
const MAX_LOGO_BYTES = 1_500_000;
const MAX_FAVICON_BYTES = 350_000;

type BrandingRow = {
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
  storeDisplayName: string;
};

const MIME_LOGO = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i;
const MIME_FAVICON =
  /^data:image\/(png|jpeg|jpg|webp|gif|x-icon|vnd\.microsoft\.icon);base64,/i;

function readFileAsDataUrl(
  file: File,
  maxBytes: number,
  mimeRegex: RegExp,
  hint: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`Arquivo muito grande (máx. ${Math.round(maxBytes / 1024)} KB)`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler o arquivo"));
        return;
      }
      if (!mimeRegex.test(result)) {
        reject(new Error(hint));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

export function BrandingSettingsForm({
  initial,
  disabled = false,
}: {
  initial: BrandingRow;
  disabled?: boolean;
}) {
  const [storeDisplayName, setStoreDisplayName] = useState(initial.storeDisplayName);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(initial.logoDataUrl);
  const [faviconDataUrl, setFaviconDataUrl] = useState<string | null>(initial.faviconDataUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  async function save(partial?: {
    logoDataUrl?: string | null;
    faviconDataUrl?: string | null;
  }) {
    if (disabled) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeDisplayName: storeDisplayName.trim() || "Loja Nova",
          ...(partial?.logoDataUrl !== undefined ? { logoDataUrl: partial.logoDataUrl } : {}),
          ...(partial?.faviconDataUrl !== undefined
            ? { faviconDataUrl: partial.faviconDataUrl }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar");
        setLoading(false);
        return;
      }
      setSuccess("Salvo com sucesso. Atualize a página inicial para ver o favicon.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(
        file,
        MAX_LOGO_BYTES,
        MIME_LOGO,
        "Formato não suportado. Use PNG, JPG, WebP ou GIF.",
      );
      setLogoDataUrl(dataUrl);
      await save({ logoDataUrl: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    }
  }

  async function handleFaviconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(
        file,
        MAX_FAVICON_BYTES,
        MIME_FAVICON,
        "Use PNG, JPG, WebP, GIF ou ICO.",
      );
      setFaviconDataUrl(dataUrl);
      await save({ faviconDataUrl: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    }
  }

  async function handleSaveName() {
    await save();
  }

  async function clearLogo() {
    setLogoDataUrl(null);
    await save({ logoDataUrl: null });
  }

  async function clearFavicon() {
    setFaviconDataUrl(null);
    await save({ faviconDataUrl: null });
  }

  const off = loading || disabled;

  return (
    <div className={cn("space-y-8", disabled && "opacity-60")}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-zinc-900">Nome da loja</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Aparece no lugar do texto da marca quando não há logo, no rodapé e na aba do navegador
          (junto ao favicon).
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="storeName">Nome exibido</Label>
            <Input
              id="storeName"
              value={storeDisplayName}
              onChange={(e) => setStoreDisplayName(e.target.value)}
              className="mt-1"
              placeholder="Ex.: Minha Loja Digital"
              disabled={off}
            />
          </div>
          <Button type="button" onClick={handleSaveName} disabled={off}>
            Salvar nome
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Logo</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Site, área do cliente e painel. PNG ou JPG com fundo transparente recomendado.
              </p>
            </div>
            <ImageIcon className="h-8 w-8 shrink-0 text-zinc-300" />
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            className="hidden"
            onChange={handleLogoFile}
          />
          <div
            className={cn(
              "mt-6 flex min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 p-4",
              logoDataUrl && "border-solid border-zinc-200 bg-white",
            )}
          >
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUrl}
                alt="Prévia da logo"
                className="max-h-24 max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-zinc-400">Nenhuma logo enviada</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={off}
            >
              <Upload className="mr-2 h-4 w-4" />
              {logoDataUrl ? "Trocar logo" : "Carregar logo"}
            </Button>
            {logoDataUrl && (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={clearLogo}
                disabled={off}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Favicon</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Ícone da aba e nos resultados do Google. Use <strong>PNG ou ICO quadrados, 48×48 px ou maior</strong> (ex.: 64, 96, 192). Evite WebP no favicon se quiser máxima compatibilidade com o índice do Google. O arquivo fica em <code className="text-xs">/favicon.ico</code> e <code className="text-xs">/icon</code>.
              </p>
            </div>
            <ImageIcon className="h-8 w-8 shrink-0 text-zinc-300" />
          </div>
          <input
            ref={faviconInputRef}
            type="file"
            accept={`${ACCEPT_IMAGES},image/x-icon,.ico`}
            className="hidden"
            onChange={handleFaviconFile}
          />
          <div
            className={cn(
              "mt-6 flex min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 p-4",
              faviconDataUrl && "border-solid border-zinc-200 bg-white",
            )}
          >
            {faviconDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconDataUrl}
                alt="Prévia do favicon"
                className="h-16 w-16 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <p className="text-sm text-zinc-400">Nenhum favicon enviado</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => faviconInputRef.current?.click()}
              disabled={off}
            >
              <Upload className="mr-2 h-4 w-4" />
              {faviconDataUrl ? "Trocar favicon" : "Carregar favicon"}
            </Button>
            {faviconDataUrl && (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={clearFavicon}
                disabled={off}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
        </Card>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      {loading && <p className="text-sm text-zinc-500">Salvando...</p>}
    </div>
  );
}
