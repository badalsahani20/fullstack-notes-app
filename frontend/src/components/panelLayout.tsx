import { cn } from "@/lib/utils";

type PanelLayoutProps = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

const PanelLayout = ({ title, actions, children, className, contentClassName }: PanelLayoutProps) => {
  return (
    <aside className={cn("flex h-full w-full flex-col border-r border-white/8 bg-[#171d2c]/90 backdrop-blur-md", className)}>
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-200">{title}</h2>
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className={cn("custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3", contentClassName)}>{children}</div>
    </aside>
  );
};

export default PanelLayout;
