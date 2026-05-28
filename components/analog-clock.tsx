"use client";

import { MorsePulse } from "@/lib/morse";
import { act, useEffect, useRef, useState } from "react";

interface AnalogClockProps {
  isStuttering: boolean;
  activePulse: MorsePulse | null;
}

export default function AnalogClock({
  isStuttering,
  activePulse,
}: AnalogClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  const requestRef = useRef<number | null>(null);
  const secondAngleRef = useRef<number>(0);
  const minuteAngleRef = useRef<number>(0);
  const hourAngleRef = useRef<number>(0);

  useEffect(() => {
    setTime(new Date());

    const animate = () => {
      const now = new Date();
      setTime(now);

      const ms = now.getMilliseconds();
      const sec = now.getSeconds();
      const min = now.getMinutes();
      const hr = now.getHours();

      const naturalSecondAngle = (sec + ms / 1000) * 6; // 6 deg per sec
      const naturalMinuteAngle = min * 6 + sec / 10; // 0.1 deg per sec
      const naturalHourAngle = (hr % 12) * 30 + min / 2; // 0.5 deg per min

      hourAngleRef.current = naturalHourAngle;
      minuteAngleRef.current = naturalMinuteAngle;

      let targetOffset = 0;
      let jitter = 0;

      if (isStuttering && activePulse && activePulse.active) {
        targetOffset = activePulse.type === "dot" ? 6 : 14;
        jitter = Math.sin(Date.now() * 0.08) * 1.5;
      }

      const targetSecondAngle = naturalSecondAngle + targetOffset + jitter;

      let diff = targetSecondAngle - (secondAngleRef.current % 360);

      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      secondAngleRef.current += diff * 0.22;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isStuttering, activePulse]);

  if (!time) {
    return (
      <div className="w-75 h-75 sm:w-90 sm:h-90 rounded-full border border-zinc-800 bg-zinc-950/40 flex items-center justify-center">
        <span className="text-zinc-500 font-mono text-sm animate-pulse">
          Initializing Clock...
        </span>
      </div>
    );
  }

  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    const angle = i * 6;
    const length = isHour ? 12 : 5;
    const strokeWidth = isHour ? 2.5 : 1;
    const color = isHour ? "stroke-amber-500/60" : "stroke-zinc-700";

    return (
      <line
        key={i}
        x1="180"
        y1={180 - 165}
        x2="180"
        y2={180 - 165 + length}
        className={color}
        strokeWidth={strokeWidth}
        transform={`rotate(${angle} 180 180)`}
      />
    );
  });

  const formatDigit = (num: number) => num.toString().padStart(2, "0");
  const digitalTimeStr = `${formatDigit(time.getHours())}:${formatDigit(time.getMinutes())}:${formatDigit(time.getSeconds())}`;

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="absolute inset-0 -m-4 bg-linear-to-b from-amber-500/5 to-transparent rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="relative w-77.5 h-77.5 sm:w-92.5 sm:h-92.5 rounded-full border border-zinc-800/80 bg-linear-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-xl shadow-2xl flex items-center justify-center">
        <svg viewBox="0 0 360 360" className="w-full h-full p-2">
          <circle
            cx="180"
            cy="180"
            r="170"
            fill="none"
            className="stroke-zinc-800/30"
            strokeWidth="2"
          />

          <g>{ticks}</g>

          <text
            x="180"
            y="46"
            className="fill-zinc-400 font-sans font-medium text-[18px]"
            textAnchor="middle"
          >
            12
          </text>
          <text
            x="324"
            y="186"
            className="fill-zinc-500 font-sans font-medium text-[18px]"
            textAnchor="middle"
          >
            3
          </text>
          <text
            x="180"
            y="328"
            className="fill-zinc-500 font-sans font-medium text-[18px]"
            textAnchor="middle"
          >
            6
          </text>
          <text
            x="36"
            y="186"
            className="fill-zinc-500 font-sans font-medium text-[18px]"
            textAnchor="middle"
          >
            9
          </text>

          <text
            x="180"
            y="115"
            className="fill-zinc-600 font-mono text-[8px] tracking-[0.25em]"
            textAnchor="middle"
          >
            TEMPUS ET POESIS
          </text>

          <text
            x="180"
            y="260"
            className="fill-zinc-500 font-mono text-[12px] tracking-wider"
            textAnchor="middle"
          >
            {digitalTimeStr}
          </text>

          {isStuttering && activePulse?.active && (
            <circle
              cx="180"
              cy="180"
              r="24"
              className="fill-amber-500/10 animate-ping opacity-60"
            />
          )}

          <g transform={`rotate(${hourAngleRef.current} 180 180)`}>
            <path
              d="M 176,180 L 178,85 L 180,80 L 182, 85 L 184, 180 Z"
              className="fill-zinc-200 shadow-md"
            />
            <line
              x1="180"
              y1="170"
              x2="180"
              y2="90"
              className="stroke-zinc-500"
              strokeWidth="1"
            />
          </g>

          <g transform={`rotate(${minuteAngleRef.current} 180 180)`}>
            <path
              d="M 177,180 L 178.5,55 L 180,50 L 181.5,55 L 183, 180 Z"
              className="fill-zinc-400"
            />
            <line
              x1="180"
              y1="170"
              x2="180"
              y2="60"
              className="stroke-zinc-600"
              strokeWidth="0.75"
            />
          </g>

          <g transform={`rotate(${secondAngleRef.current} 180 180)`}>
            {isStuttering && activePulse?.active && (
              <line
                x1="180"
                y1="180"
                x2="180"
                y2="30"
                className="stroke-amber-400/30"
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}
            <line
              x1="180"
              y1="220"
              x2="180"
              y2="30"
              className={`${
                isStuttering
                  ? activePulse?.active
                    ? "stroke-amber-400"
                    : "stroke-amber-500/80"
                  : "stroke-amber-500"
              } transition-colors duration-100`}
              strokeWidth={isStuttering && activePulse?.active ? "2.5" : "1.5"}
              strokeLinecap="round"
            />

            <circle
              cx="180"
              cy="210"
              r="6"
              className={`${
                isStuttering
                  ? "fill-amber-500/80 stroke-amber-500/40"
                  : "fill-zinc-900 stroke-amber-500"
              }`}
              strokeWidth="1.5"
            />

            <circle
              cx="180"
              cy="30"
              r="2.5"
              className={`${
                isStuttering && activePulse?.active
                  ? "fill-white animate-pulse"
                  : "fill-amber-500"
              }`}
            />
          </g>

          <circle
            cx="180"
            cy="180"
            r="7"
            className="fill-zinc-950 stroke-zinc-700"
            strokeWidth="2.5"
          />
          <circle cx="180" cy="180" r="2.5" className="fill-amber-500" />
        </svg>

        {isStuttering && (
          <div className="absolute top-2/3 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-amber-500/90 tracking-wider">
              TX ACTIVE:{" "}
              {activePulse?.active
                ? activePulse.type === "dot"
                  ? "●"
                  : "▬"
                : "◌"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
