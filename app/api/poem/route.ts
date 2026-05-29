import { type Poem, FALLBACK_POEMS } from "@/lib/poem-fallback";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch("https://poetrydb.org/random/1", {
      next: { revalidate: 86400 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`PoetryDB returned status ${response.status}`);
    }

    const data = await response.json();

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].lines &&
      data[0].title
    ) {
      const fetchedPoem: Poem = {
        title: data[0].title,
        author: data[0].author || "Unknown",
        lines: data[0].lines
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0),
      };

      if (fetchedPoem.lines.length > 0) {
        return NextResponse.json({ poem: fetchedPoem, source: "poetrydb" });
      }
    }

    throw new Error("Invalid response format from PoetryDB");
  } catch (error) {
    console.warn(
      "Failed to fetch daily poem from PoetryDB, using fallback:",
      error,
    );

    const today = new Date();
    const daySeed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    const fallbackIndex = daySeed % FALLBACK_POEMS.length;
    const selectedFallback = FALLBACK_POEMS[fallbackIndex];

    return NextResponse.json({
      poem: selectedFallback,
      source: "fallback_cache",
      note: "API fetch failed, displaying date-seeded fallback poem of the day",
    });
  }
}
