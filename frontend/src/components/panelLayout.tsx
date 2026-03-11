type PanelLayoutProps = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const PanelLayout = ({ title, actions, children }: PanelLayoutProps) => {
  return (
    <aside className="flex h-full w-80 flex-col border-r border-white/8 bg-[#171d2c]/90 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-200">{title}</h2>
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3">{children}</div>
    </aside>
  );
};

export default PanelLayout;
