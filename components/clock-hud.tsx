"use client";

import { MorsePulse } from "@/lib/morse";
import { Poem } from "@/lib/poem-fallback";
import { cn } from "@/lib/utils";
import { HelpCircle, Music, Settings, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Modal, ModalClose, ModalContent, ModalTitle, ModalTrigger } from "./ui/modal";
import { DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";

interface ClockHudProps {
  isStuttering: boolean;
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

        <div className="flex-1 p-4 font-mono text-sm overlfow-y-auto max-h-55 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="text-zinc-600 text-xs">
            &gt; POEM LINE TRANSMITS AT THE TOP OF EVER HOUR.
            <br />
            &gt; CLICK &quot;TRANSMIT LINE&quot; FOR MANUAL OVERRIDE.
          </div>

          {activeLine && (
            <div className="border-l-2 border-amber-500/30 pl-3 py-1 my-2 bg-amber-500/5 rounded-r">
              <span className="text-zinc-500">Target Sequence:</span>
              <span className="text-zinc-300 italic">
                &quot;{activeLine}&quot;
              </span>
            </div>
          )}

          {morseFeed.length > 0 ? (
            <div className="">
              {morseFeed.map((signal, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "px-1 py-0.5 rounded text-xs",
                    idx === morseFeed.length - 1 && isStuttering
                      ? "text-amber-400 bg-amber-950/40 font-bold border border-amber-500/20"
                      : "text-zinc-500",
                  )}
                >
                  {signal}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto pt-2">
            <span className="text-amber-500/90 font-bold">&gt; DECODED:</span>
            <span className="text-zinc-100 tracking-wide">
              {decodedText}
              {isStuttering && (
                <span className="animate-pulse inline-block w-2 h-4 ml-0.5 bg-amber-500" />
              )}
            </span>
          </div>
          <div ref={terminalEndRef} />
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
          <Modal>
            <ModalTrigger className="flex items-center gap-1 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" />
              Morse Key Guide
            </ModalTrigger>
            <ModalContent className="bg-zinc-900">
              <ModalTitle>
                <div className="flex items-center justify-between">
                  <div className=" text-zinc-100 flex items-center gap-2 text-lg">
                    <Music className="w-5 h-5 text-amber-500" />
                    International Morse Code
                  </div>
                  <ModalClose asChild>
                    <Button size="icon" className="hover:bg-zinc-950">
                      <X />
                    </Button>
                  </ModalClose>
                </div>
              </ModalTitle>
                <div className="p-6 grid grid-cols-2 gap-4 font-mono text-xs text-zinc-400 overflow-y-auto">
                  <div className="space-y-1.5 border-r border-zinc-800/50 pr-4">
                    <div className="flex justify-between border-b border-zinc-800 pb-1 text-zinc-300 font-bold">
                      <span>Letter</span>
                      <span>Signal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>A</span>
                      <span>● ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B</span>
                      <span>▬ ● ● ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C</span>
                      <span>▬ ● ▬ ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>D</span>
                      <span>▬ ● ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>E</span>
                      <span>●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>F</span>
                      <span>● ● ▬ ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>G</span>
                      <span>▬ ▬ ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>H</span>
                      <span>● ● ● ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>I</span>
                      <span>● ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>J</span>
                      <span>● ▬ ▬ ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>K</span>
                      <span>▬ ● ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>L</span>
                      <span>● ▬ ● ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>M</span>
                      <span>▬ ▬</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-zinc-800 pb-1 text-zinc-300 font-bold">
                      <span>Letter</span>
                      <span>Signal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>N</span>
                      <span>▬ ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>O</span>
                      <span>▬ ▬ ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P</span>
                      <span>● ▬ ▬ ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q</span>
                      <span>▬ ▬ ● ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>R</span>
                      <span>● ▬ ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>S</span>
                      <span>● ● ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span>T</span>
                      <span>▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>U</span>
                      <span>● ● ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>V</span>
                      <span>● ● ● ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>W</span>
                      <span>● ▬ ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>X</span>
                      <span>▬ ● ● ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Y</span>
                      <span>▬ ● ▬ ▬</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Z</span>
                      <span>▬ ▬ ● ●</span>
                    </div>
                  </div>

                  <div className="col-span-2 mt-4 pt-4 border-t border-zinc-800 text-[10px] space-y-1">
                    <p className="text-zinc-500 uppercase font-bold mb-1">
                      Standard Timing Rules:
                    </p>
                    <p>● Dot duration = 1 Unit</p>
                    <p>▬ Dash duration = 3 Units (3x longer than dot)</p>
                    <p>◌ Letter space = 3 Units silence</p>
                    <p>◌ Word space = 7 Units silence</p>
                  </div>
                </div>
              
            </ModalContent>
          </Modal>
          <button className=" hover:text-zinc-300 transition-colors"></button>
          <span className="text-zinc-600">made by keerthi</span>
        </div>
      </div>
    </div>
  );
}
