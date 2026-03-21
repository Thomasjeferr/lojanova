/**
 * Contrato para evolução WebSocket / SSE. Hoje o cliente usa polling curto.
 */
/** Polling curto — sensação “quase stream” até existir WebSocket. */
export const ANALYTICS_REALTIME_POLL_MS = 4000;

export type AnalyticsRealtimeMeta = {
  pollIntervalMs: number;
  /** Quando existir gateway WS, preencher URL absoluta ou path relativo seguro */
  websocketUrl: string | null;
  protocol: "polling" | "websocket_ready";
};

export type AnalyticsRealtimeEnvelope<T> = {
  events: T;
  meta: AnalyticsRealtimeMeta;
};

export function defaultRealtimeMeta(): AnalyticsRealtimeMeta {
  return {
    pollIntervalMs: ANALYTICS_REALTIME_POLL_MS,
    websocketUrl: null,
    protocol: "polling",
  };
}
