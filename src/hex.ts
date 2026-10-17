export interface Rgb {
  red: number;
  green: number;
  blue: number;
}

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parses `#rgb`, `#rrggbb` and `#rrggbbaa`. The alpha channel is dropped. */
export function parseHex(value: string): Rgb | undefined {
  const match = HEX_COLOR.exec(value);
  if (!match) return undefined;

  let digits = match[1]!;
  if (digits.length === 3) {
    digits = digits.replace(/./g, "$&$&");
  }
  const packed = Number.parseInt(digits.slice(0, 6), 16);
  return {
    red: packed >> 16,
    green: (packed >> 8) & 0xff,
    blue: packed & 0xff,
  };
}
