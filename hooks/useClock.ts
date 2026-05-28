"use client";

import { useEffect, useRef, useState } from "react";

export interface ClockState {
  h: number;
  m: number;
  s: number;
  ms: number;
}

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>({ h: 0, m: 0, s: 0, ms: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setState({
        h: now.getHours(),
        m: now.getMinutes(),
        s: now.getSeconds(),
        ms: now.getMilliseconds(),
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return state;
}
