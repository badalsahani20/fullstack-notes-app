// Generates a soft HSL color string.

export const noteColors = [
  "#6e44ff", // soft red
  "#b892ff", // peach
  "#ffc2e2", // mint
  "#ff90b3", // sage
  "#ef7a85", // aqua
  "#87986a", // lavender
  "#718355", // soft orange
  "#70c1b3", // soft orange
  "#247ba0", // soft orange
  "#ffe066", // soft orange
  "#f25f5c", // soft orange
  "#50514f", // soft orange
  "#2f004f", // soft orange
  "#5f0a87", // soft orange
  "#a4508b", // soft orange
  "#c6d2ed", // soft orange
  "#827081", // soft orange
  "#aea3b0", // soft orange
  "#806d88", // soft orange
  "#72a1e5", // soft orange
  "#ffcb69", // soft orange
  "#f0a868", // soft orange
  "#d9ae94", // soft orange
];
export function generateSoftColor() {
  const index = Math.floor(Math.random() * noteColors.length);
  return noteColors[index];
}