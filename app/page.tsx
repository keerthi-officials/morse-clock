"use client";

import { useEffect, useState } from "react";
import AnalogClock from "@/components/analog-clock";
import { cn } from "@/lib/utils";
import { Clock, Info, Volume2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const isStuttering = false;
  const [isMuted, setIsMuted] = useState(true);
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 relative bg-grid-glow">
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 z-10">
        <header className="text-center flex flex-col items-center gap-2 max-w-xl">
          <div className="flex items-center gap-2 border border-zinc-800/80 px-3 py-1 rounded-full bg-zinc-900/40 backdrop-blur-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              made by keerthi
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-linear-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Tempus &amp; Poesis
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground">
            An analog clock displaying continous time-but at the turn of each
            hour, the second hand stutters to tap out a line of classic poetry
            in Morse code.
          </p>
        </header>

        {isMuted && (
          <div className="w-full max-w-md flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-300 text-xs font-mono backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-amber-300" />
              <span>
                Audio is muted by default. Unmute to hear the Morse audio.
              </span>
            </div>
            <button
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold transition-colors"
              onClick={() => setIsMuted(false)}
            >
              Unmute
            </button>
          </div>
        )}

        <div
          className={cn(
            "p-6 sm:p-10 rounded-3xl border transition-all duration-700 bg-zinc-950/20 backdrop-blur-md flex items-center justify-center",
            isStuttering
              ? "border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)] shadow-amber-500/5 glow-transmitting"
              : "border-zinc-800/60",
          )}
        >
          <AnalogClock isStuttering={isStuttering} />
        </div>

        <footer className="text-center text-[10px] font-mono text-zinc-600 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4">
          <span>© 2026 Tempus &amp; Poesis</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-zinc-700" />
            Runs offline with backup date-seeded archives if PoetryDB is unreachable
          </span>
        </footer>
      </div>
    </div>
  );
}
