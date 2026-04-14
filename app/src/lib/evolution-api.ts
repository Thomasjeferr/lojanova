/**
 * Cliente HTTP para Evolution API v2 (header `apikey`).
 * Base URL deve apontar para a raiz da API (ex.: https://evo.seudominio.com ou com /api se for o caso).
 */

function evolutionBaseUrl(): string | null {
  const u = process.env.EVOLUTION_API_URL?.trim().replace(/\/+$/, "");
  return u || null;
}

function evolutionApiKey(): string | null {
  const k = process.env.EVOLUTION_API_KEY?.trim();
  return k || null;
}

export function isEvolutionEnvConfigured(): boolean {
  return Boolean(evolutionBaseUrl() && evolutionApiKey());
}

function buildUrl(path: string): string {
  const base = evolutionBaseUrl()!;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function evolutionFetch(path: string, init?: RequestInit): Promise<Response> {
  const key = evolutionApiKey();
  if (!key) {
    throw new Error("EVOLUTION_API_KEY não configurada.");
  }
  const headers: Record<string, string> = {
    apikey: key,
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body && typeof init.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(buildUrl(path), {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(28_000),
  });
}

export type EvolutionConnectResult = {
  state: string | null;
  base64: string | null;
  pairingCode: string | null;
  raw: unknown;
};

function pickConnectPayload(data: Record<string, unknown>): EvolutionConnectResult {
  const inst = data.instance as Record<string, unknown> | undefined;
  const state =
    (typeof inst?.state === "string" ? inst.state : null) ??
    (typeof data.state === "string" ? data.state : null);
  const base64 = typeof data.base64 === "string" ? data.base64 : null;
  const pairingCode =
    (typeof data.pairingCode === "string" ? data.pairingCode : null) ??
    (typeof data.pairing_code === "string" ? data.pairing_code : null);
  return { state, base64, pairingCode, raw: data };
}

/** GET /instance/connect/{instance} — QR ou estado já conectado. */
export async function evolutionFetchConnect(instanceName: string): Promise<EvolutionConnectResult> {
  const res = await evolutionFetch(
    `/instance/connect/${encodeURIComponent(instanceName)}`,
    { method: "GET" },
  );
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : JSON.stringify(data.response ?? data).slice(0, 200);
    throw new Error(`Evolution connect ${res.status}: ${msg}`);
  }
  return pickConnectPayload(data);
}

/** GET /instance/connectionState/{instance} */
export async function evolutionFetchConnectionState(
  instanceName: string,
): Promise<string | null> {
  const res = await evolutionFetch(
    `/instance/connectionState/${encodeURIComponent(instanceName)}`,
    { method: "GET" },
  );
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) return null;
  const inst = data.instance as Record<string, unknown> | undefined;
  const state =
    (typeof inst?.state === "string" ? inst.state : null) ??
    (typeof data.state === "string" ? data.state : null);
  return state;
}

export type EvolutionCreateResult = {
  instanceName: string;
  status?: string;
};

/** POST /instance/create */
export async function evolutionCreateInstance(instanceName: string): Promise<EvolutionCreateResult> {
  const res = await evolutionFetch("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const resp = data.response as { message?: string[] } | undefined;
    const msg = resp?.message?.join?.("; ") ?? JSON.stringify(data).slice(0, 300);
    throw new Error(`Evolution create ${res.status}: ${msg}`);
  }
  const inst = data.instance as Record<string, unknown> | undefined;
  const name =
    (typeof inst?.instanceName === "string" ? inst.instanceName : null) ?? instanceName;
  const status = typeof inst?.status === "string" ? inst.status : undefined;
  return { instanceName: name, status };
}

/** POST /message/sendText/{instance} — número com DDI, só dígitos (ex.: 5511999998888). */
export async function evolutionSendText(
  instanceName: string,
  numberDigits: string,
  text: string,
): Promise<void> {
  const res = await evolutionFetch(
    `/message/sendText/${encodeURIComponent(instanceName)}`,
    {
      method: "POST",
      body: JSON.stringify({
        number: numberDigits.replace(/\D/g, ""),
        text,
      }),
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Evolution sendText ${res.status}: ${t.slice(0, 400)}`);
  }
}
