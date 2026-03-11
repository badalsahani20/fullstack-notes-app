// Generates a soft HSL color string.

export const noteColors = [
  "#6e44ff",
  "#ef7a85",
  "#87986a",
  "#718355",
  "#247ba0",
  "#f25f5c",
  "#50514f",
  "#2f004f",
  "#5f0a87",
  "#a4508b",
  "#827081",
  "#806d88",
];

export function generateSoftColor() {
  const index = Math.floor(Math.random() * noteColors.length);
  return noteColors[index];
}
