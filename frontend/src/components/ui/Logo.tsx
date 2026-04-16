import { cn } from "@/lib/utils";

const Logo = ({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-20 h-20",
  };

  const orbClasses = {
    sm: "scale-[0.8]",
    md: "",
    lg: "iris-orb-lg",
  };

  return (
    <div className={cn("ai-rail-button ai-rail-button-active !cursor-default !shadow-none", sizeClasses[size], className)}>
      <div className={cn("iris-orb", orbClasses[size])} />
    </div>
  );
};

export default Logo;
