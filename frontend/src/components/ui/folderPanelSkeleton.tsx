export const FolderPanelSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="space-y-2">
      {[1, 2].map((item) => (
        <div key={item} className="flex items-center justify-between rounded-2xl border border-[var(--divider)] bg-[var(--surface-muted)] px-3 py-2.5">
          <div className="h-3.5 w-24 rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-5 w-8 rounded-full bg-[var(--surface-ghost)]" />
        </div>
      ))}
    </div>

    <div className="sidebar-divider" />

    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl border border-[var(--divider)] bg-[var(--surface-muted)] px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-32 rounded-full bg-[var(--surface-ghost)]" />
            <div className="h-5 w-8 rounded-full bg-[var(--surface-ghost)]" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-24 rounded-full bg-[var(--surface-ghost)]" />
            <div className="h-3 w-20 rounded-full bg-[var(--surface-ghost)]" />
          </div>
        </div>
      ))}
    </div>
  </div>
);