export const MORSE_DICTIONARY: Record<string, string> = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

export interface MorsePulse {
  active: boolean;
  durationUnits: number;
  type: "dot" | "dash" | "element-space" | "letter-space" | "word-space";
  char: string;
  rawMorseChar: string;
  charIndex: number;
}

export function textToMorsePulses(text: string): MorsePulse[] {
  const normalized = text.toLowerCase().trim();
  const pulses: MorsePulse[] = [];

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (char === " " || char === "\n" || char === "\t") {
      if (pulses.length > 0) {
        const last = pulses[pulses.length - 1];
        if (last.type === "letter-space" || last.type === "element-space") {
          pulses.pop();
        }
      }

      pulses.push({
        active: false,
        durationUnits: 7,
        type: "word-space",
        char: " ",
        rawMorseChar: "",
        charIndex: i,
      });
      continue;
    }

    const morseCode = MORSE_DICTIONARY[char];
    if (!morseCode) {
      continue;
    }

    for (let j = 0; j < morseCode.length; j++) {
      const symbol = morseCode[j];
      const active = true;
      const durationUnits = symbol === "." ? 1 : 3;
      const type = symbol === "." ? "dot" : "dash";

      pulses.push({
        active,
        durationUnits,
        type,
        char: normalized[i].toUpperCase(),
        rawMorseChar: morseCode,
        charIndex: i,
      });

      if (j < morseCode.length - 1) {
        pulses.push({
          active: false,
          durationUnits: 1,
          type: "element-space",
          char: normalized[i].toUpperCase(),
          rawMorseChar: morseCode,
          charIndex: i,
        });
      }
    }

    if (i < normalized.length - 1) {
      pulses.push({
        active: false,
        durationUnits: 3,
        type: "letter-space",
        char: normalized[i].toUpperCase(),
        rawMorseChar: morseCode,
        charIndex: i,
      });
    }
  }
  return pulses;
}

export function wpmToUnitMs(wpm: number): number {
  return 1200 / wpm;
}
