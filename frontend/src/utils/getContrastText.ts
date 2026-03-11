const FALLBACK_LIGHT = "#f8fafc";
const FALLBACK_DARK = "#111827";

type Rgb = { r: number; g: number; b: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const parseColorToRgb = (color: string): Rgb | null => {
  if (!color) return null;

  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    if (hex.length !== 6) return null;

    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);

    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }

  if (color.startsWith("rgb")) {
    const values = color.match(/\d+/g)?.map(Number) ?? [];
    if (values.length < 3) return null;
    return {
      r: clamp(values[0], 0, 255),
      g: clamp(values[1], 0, 255),
      b: clamp(values[2], 0, 255),
    };
  }

  return null;
};

const channelToLinear = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ({ r, g, b }: Rgb) => {
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contrastRatio = (l1: number, l2: number) => {
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
};

export function getContrastText(bgColor: string) {
  const rgb = parseColorToRgb(bgColor);
  if (!rgb) return FALLBACK_LIGHT;

  const bgLum = relativeLuminance(rgb);
  const lightLum = relativeLuminance({ r: 248, g: 250, b: 252 });
  const darkLum = relativeLuminance({ r: 17, g: 24, b: 39 });

  const lightContrast = contrastRatio(bgLum, lightLum);
  const darkContrast = contrastRatio(bgLum, darkLum);

  return darkContrast >= lightContrast ? FALLBACK_DARK : FALLBACK_LIGHT;
}

export function getContrastTextPalette(bgColor: string) {
  const text = getContrastText(bgColor);
  const isDarkText = text === FALLBACK_DARK;

  return {
    text,
    muted: isDarkText ? "rgba(17, 24, 39, 0.72)" : "rgba(248, 250, 252, 0.75)",
    placeholder: isDarkText ? "rgba(17, 24, 39, 0.5)" : "rgba(248, 250, 252, 0.45)",
    divider: isDarkText ? "rgba(17, 24, 39, 0.18)" : "rgba(248, 250, 252, 0.2)",
  };
}
