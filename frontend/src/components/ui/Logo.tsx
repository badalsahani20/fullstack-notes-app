const Logo = ({ className, size = 32 }: { className?: string; size?: number }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="64" height="64" rx="14" fill="#1e293b"/>
      <rect x="14" y="14" width="36" height="44" rx="5" fill="#3b82f6" opacity="0.12"/>
      <rect x="14" y="14" width="36" height="44" rx="5" stroke="#3b82f6" stroke-width="1.4" fill="none"/>
      <rect x="21" y="38" width="16" height="1.5" rx="0.75" fill="#3b82f6" opacity="0.45"/>
      <rect x="21" y="43" width="11" height="1.5" rx="0.75" fill="#3b82f6" opacity="0.45"/>
      <rect x="21" y="48" width="14" height="1.5" rx="0.75" fill="#3b82f6" opacity="0.45"/>
      <text x="32" y="35" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="400" fill="#3b82f6" font-style="italic">n</text>
    </svg>
  );
};

export default Logo;
