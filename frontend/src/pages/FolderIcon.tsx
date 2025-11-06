export const FolderIcon = ({ size = 60, color = "#60a5fa" }: {size: number, color: string}) => (
  <svg
    width={size}
    height={(size * 5) / 6}
    viewBox="0 0 120 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 20C12 14.477 16.477 10 22 10H58L70 22H98C103.523 22 108 26.477 108 32V80C108 85.523 103.523 90 98 90H22C16.477 90 12 85.523 12 80V20Z"
      fill={color}
      stroke="#3b82f6"
      strokeWidth="2"
      rx="10"
    />
    <path
      d="M70 22H98C103.523 22 108 26.477 108 32V38H70V22Z"
      fill="#3b82f6"
    />
  </svg>
);
