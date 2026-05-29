"use client";

import { MorsePulse } from "@/lib/morse";
import { Poem } from "@/lib/poem-fallback";
import { cn } from "@/lib/utils";
import { HelpCircle, Settings, Volume2, VolumeX } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";

interface ClockHudProps {
  isStuttering: boolean;
  activePulse: MorsePulse | null;
  wpm: number;
  setWpm: (wpm: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  activeLine: string;
  decodedText: string;
  morseFeed: string[];
  poem: Poem | null;
  poemSource: string;
  triggerTransmission: () => void;
  stopTransmission: () => void;
}

export default function ClockHud({
  isStuttering,
  activePulse,
  wpm,
  setWpm,
  volume,
  setVolume,
  pitch,
  setPitch,
  isMuted,
  setIsMuted,
  activeLine,
  decodedText,
  morseFeed,
  poem,
  poemSource,
  triggerTransmission,
  stopTransmission,
}: ClockHudProps) {
  const [showPoemModal, setShowPoemModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [countdown, setCountdown] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);
      const diffMs = nextMidnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setCountdown("Refreshing poem...");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const format = (n: number) => n.toString().padStart(2, "0");
      setCountdown(`${format(hours)}h ${format(minutes)}m ${format(seconds)}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="md:col-span-2 flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden min-h-75 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isStuttering
                  ? "bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"
                  : "bg-emerald-500",
              )}
            />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              {isStuttering
                ? "Deciphering Transmission"
                : "Receiver Idle || Monitoring"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              WPM: {wpm}
            </span>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              PITCH: {pitch}Hz
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md p-5 justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
            <Settings className="w-4 h-4 text-zinc-500" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Audio & Signal Config
            </h3>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-500">Transmission Speed</span>
                <span className="text-amber-500">{wpm} WPM</span>
              </div>
              <input
                type="range"
                min="6"
                max="30"
                value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-amber-500 appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                <span>Slow (6 WPM)</span>
                <span>Fast (30 WPM)</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-500">Tone Volume</span>
                <span className="text-amber-500">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  disabled={isMuted}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-amber-500 appearance-none disabled:opacity-30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-500">Tone Pitch</span>
                <span className="text-amber-500">{pitch} Hz</span>
              </div>
              <input
                type="range"
                min="400"
                max="1000"
                step="50"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-amber-500 appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-3 mt-4 flex text-[10px] font-mono justify-between items-center">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Morse Key Guide
          </button>
          <span className="text-zinc-600">Made by keerthi</span>
        </div>
      </div>
    </div>
  );
}
