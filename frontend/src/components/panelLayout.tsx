type PanelLayoutProps = {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}
const PanelLayout = ({ title, actions, children } : PanelLayoutProps) => {
  return (
    <aside className="w-80 h-full bg-[#181818] border-r border-white/5 flex flex-col">
      
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h2 className="font-bold tracking-[0.2em] text-white">
          {title}
        </h2>

        <div className="flex gap-2">
          {actions}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {children}
      </div>

    </aside>
  );
};

export default PanelLayout