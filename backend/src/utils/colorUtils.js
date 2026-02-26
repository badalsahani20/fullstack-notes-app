// Generates a soft HSL color string.

export const generateSoftColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 25 + Math.floor(Math.random() * 15);
    const lightness = 75 + Math.floor(Math.random() * 10);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
 
