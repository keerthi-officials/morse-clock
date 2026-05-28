import AnalogClock from "@/components/analog-clock";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 relative bg-grid-glow">
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 z-10">
        <div
          className={cn(
            "p-6 sm:p-10 rounded-3xl border transition-all duration-700 bg-zinc-950/20 backdrop-blur-md flex items-center justify-center",
            "border-zinc-800/60",
          )}
        >
          <AnalogClock isStuttering={false} />
        </div>
      </div>
    </div>
  );
}
