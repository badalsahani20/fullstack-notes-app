export function getContrastText(bgColor: string) {
  let r = 0, g = 0, b = 0;

  // HEX color
  if (bgColor.startsWith("#")) {
    const hex = bgColor.replace("#", "");

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // RGB color
  else if (bgColor.startsWith("rgb")) {
    const rgb = bgColor.replace(/[^\d,]/g, "").split(",").map(Number);
    [r, g, b] = rgb;
  }

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160 ? "#111" : "#ffffff";
}