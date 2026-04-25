"use client";

import { useSyncExternalStore } from "react";

function subscribeMedia(query: MediaQueryList, onChange: () => void) {
  const mq = query;
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      return subscribeMedia(mq, onStoreChange);
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia(query).matches;
    },
    () => false,
  );
}
