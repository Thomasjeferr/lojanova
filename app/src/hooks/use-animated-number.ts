"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

/** Interpolação suave até `target` (inteiros). */
export function useAnimatedInt(target: number, durationMs = 900) {
  const [display, setDisplay] = useState(target);
  const displaySnap = useRef(target);
  const raf = useRef(0);

  useLayoutEffect(() => {
    displaySnap.current = display;
  }, [display]);

  useEffect(() => {
    const from = displaySnap.current;
    if (from === target) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = easeOutQuart(t);
      const v = Math.round(from + (target - from) * eased);
      setDisplay(v);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, durationMs]);

  return display;
}

/** Percentual 0–100 animado (número contínuo). */
export function useAnimatedPercent(target: number, durationMs = 1000) {
  const [display, setDisplay] = useState(target);
  const displaySnap = useRef(target);
  const raf = useRef(0);

  useLayoutEffect(() => {
    displaySnap.current = display;
  }, [display]);

  useEffect(() => {
    const from = displaySnap.current;
    if (Math.abs(from - target) < 0.02) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = easeOutQuart(t);
      const v = from + (target - from) * eased;
      setDisplay(v);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, durationMs]);

  return display;
}

const zeroDeltas = {
  sessionsOnline: 0,
  accessesToday: 0,
  purchasesToday: 0,
  conversionRatePeriod: 0,
  topCountryCount: 0,
};

export function useKpiDeltas(kpis: {
  sessionsOnline: number;
  accessesToday: number;
  purchasesToday: number;
  conversionRatePeriod: number;
  topCountryCount: number;
}) {
  const [deltas, setDeltas] = useState(zeroDeltas);
  const prevRef = useRef(kpis);

  useEffect(() => {
    const p = prevRef.current;
    setDeltas({
      sessionsOnline: kpis.sessionsOnline - p.sessionsOnline,
      accessesToday: kpis.accessesToday - p.accessesToday,
      purchasesToday: kpis.purchasesToday - p.purchasesToday,
      conversionRatePeriod: kpis.conversionRatePeriod - p.conversionRatePeriod,
      topCountryCount: kpis.topCountryCount - p.topCountryCount,
    });
    prevRef.current = kpis;
  }, [kpis]);

  return deltas;
}
