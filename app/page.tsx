"use client";

import { useEffect, useRef, useState } from "react";
import AnalogClock from "@/components/analog-clock";
import { cn } from "@/lib/utils";
import { Info, Volume2 } from "lucide-react";
import { MorsePulse, textToMorsePulse, wpmToUnitMs } from "@/lib/morse";
import { Poem } from "@/lib/poem-fallback";
import { MorseAudioEngine } from "@/lib/audio-engine";
import ClockHud from "@/components/clock-hud";

export default function Home() {
  const [wpm, setWpm] = useState(20);
  const [volume, setVolume] = useState(0.4);
  const [pitch, setPitch] = useState(650);
  const [isMuted, setIsMuted] = useState(true);

  const [isStuttering, setIsStuttering] = useState(false);
  const [activePulse, setActivePulse] = useState<MorsePulse | null>(null);

  const [poem, setPoem] = useState<Poem | null>(null);
  const [poemSource, setPoemSource] = useState("");
  const [activeLine, setActiveLine] = useState("");

  const [decodedText, setDecodedText] = useState("");
  const [morseFeed, setMorseFeed] = useState<string[]>([]);

  const audioEngineRef = useRef<MorseAudioEngine | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<boolean>(false);
  const currentPulseIndexRef = useRef<number>(0);
  const lastCharIndexRef = useRef<number>(-1);
  const lastTriggereHourRef = useRef<number>(-1);

  useEffect(() => {
    audioEngineRef.current = new MorseAudioEngine();
    audioEngineRef.current.setVolume(isMuted ? 0 : volume);
    audioEngineRef.current.setPitch(pitch);

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setPitch(pitch);
    }
  }, [pitch]);

  //fetch daily poem
  useEffect(() => {
    async function fetchDailyPoem() {
      try {
        const res = await fetch("/api/poem");
        if (!res.ok) throw new Error("Couldn't fetch poem");
        const data = await res.json();

        if (data.poem && data.poem.lines && data.poem.lines.length > 0) {
          setPoem(data.poem);
          setPoemSource(data.source);

          const currentHour = new Date().getHours();
          const lineIndex = currentHour % data.poem.lines.length;
          setActiveLine(data.poem.lines[lineIndex]);
        }
      } catch (err) {
        console.error("Error loading daily poem:", err);
      }
    }

    fetchDailyPoem();
  }, []);

  useEffect(() => {
    const hourlyTrigger = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentMinute === 0 && lastTriggereHourRef.current !== currentHour) {
        lastTriggereHourRef.current = currentHour;

        if (poem && poem.lines.length > 0) {
          const lineIndex = currentHour % poem.lines.length;
          const newLine = poem.lines[lineIndex];
          setActiveLine(newLine);

          setTimeout(() => {
            startTransmission(newLine);
          }, 1000);
        }
      }
    };

    const interval = setInterval(hourlyTrigger, 1000);
    return () => clearInterval(interval);
  }, [poem]);

  const startTransmission = (text: string) => {
    if (!text) return;

    stopTransmission();

    const pulses = textToMorsePulse(text);
    if (pulses.length === 0) return;

    setIsStuttering(true);
    setDecodedText("");
    setMorseFeed([]);

    abortControllerRef.current = false;
    currentPulseIndexRef.current = 0;
    lastCharIndexRef.current = -1;

    if (isMuted) {
      if (audioEngineRef.current) {
        audioEngineRef.current
          .startTone()
          .then(() => {
            if (audioEngineRef.current) audioEngineRef.current.stopTone();
          })
          .catch(() => {});
      }
    }

    const playNext = () => {
      if (abortControllerRef.current) {
        cleanupPlayback();
        return;
      }

      if (currentPulseIndexRef.current >= pulses.length) {
        cleanupPlayback();
        return;
      }

      const pulse = pulses[currentPulseIndexRef.current];
      setActivePulse(pulse);

      if (pulse.active) {
        audioEngineRef.current?.startTone();
      } else {
        audioEngineRef.current?.stopTone();
      }

      if (pulse.charIndex !== lastCharIndexRef.current) {
        lastCharIndexRef.current = pulse.charIndex;

        if (pulse.char === "") {
          setDecodedText((prev) => prev + " ");
          setMorseFeed((prev) => [...prev, "/"]);
        } else {
          setDecodedText((prev) => prev + pulse.char);
          setMorseFeed((prev) => [
            ...prev,
            `${pulse.char}(${pulse.rawMorseChar})`,
          ]);
        }
      }

      const unitMs = wpmToUnitMs(wpm);
      const duration = pulse.durationUnits * unitMs;

      currentPulseIndexRef.current++;
      playTimeoutRef.current = setTimeout(playNext, duration);
    };

    playNext();
  };

  const stopTransmission = () => {
    abortControllerRef.current = true;
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    cleanupPlayback();
  };

  const cleanupPlayback = () => {
    setIsStuttering(false);
    setActivePulse(null);
    if (audioEngineRef.current) {
      audioEngineRef.current.stopTone();
    }
  };

  const shuffleLine = () => {
    if (!poem || poem.lines.length <= 1) return;

    let newLine = activeLine;
    while (newLine === activeLine) {
      const idx = Math.floor(Math.random() * poem.lines.length);
      newLine = poem.lines[idx];
    }

    setActiveLine(newLine);

    if (isStuttering) {
      startTransmission(newLine);
    }
  };
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 relative bg-grid-glow">
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 z-10">
        <header className="text-center flex flex-col items-center gap-2 max-w-xl">
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
          <AnalogClock isStuttering={isStuttering} activePulse={activePulse} />
        </div>

        {activeLine && (
          <div className="w-full max-w-xl flex items-center justify-between gap-4 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2 truncate">
              <span className="text-zinc-600 uppercase">Hourly Line:</span>
              <span className="italic text-zinc-300 truncate">
                &quot;{activeLine}&quot;
              </span>
            </div>
            <button className="" onClick={shuffleLine}>
              Shuffle
            </button>
          </div>
        )}

        <ClockHud
          isStuttering={isStuttering}
          wpm={wpm}
          setWpm={setWpm}
          volume={volume}
          setVolume={setVolume}
          pitch={pitch}
          setPitch={setPitch}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          activeLine={activeLine}
          decodedText={decodedText}
          morseFeed={morseFeed}
          poem={poem}
          poemSource={poemSource}
          triggerTransmission={() => startTransmission(activeLine)}
          stopTransmission={stopTransmission}
        />

        <footer className="text-center text-[10px] font-mono text-zinc-600 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4">
          <span>© 2026 Tempus &amp; Poesis</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-zinc-700" />
            Runs offline with backup date-seeded archives if PoetryDB is
            unreachable
          </span>
        </footer>
      </div>
    </div>
  );
}
