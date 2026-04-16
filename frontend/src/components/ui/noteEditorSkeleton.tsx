export const NoteEditorSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col h-full bg-[var(--panel-bg-strong)] animate-pulse">
      {/* Header Skeleton */}
      <div className="border-bottom border-[var(--divider)] px-8 pb-0 pt-4" style={{ height: "131px" }}>
        <div className="flex items-center justify-between gap-4">
          <div className="h-8 w-1/3 rounded-lg bg-[var(--surface-ghost)]" />
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-full bg-[var(--surface-ghost)]" />
            <div className="h-9 w-24 rounded-full bg-[var(--surface-ghost)]" />
            <div className="h-9 w-24 rounded-full bg-[var(--surface-ghost)]" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-4 w-32 rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-4 w-24 rounded-full bg-[var(--surface-ghost)]" />
        </div>
        {/* Toolbar slot */}
        <div className="mt-4 flex gap-2">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="h-8 w-8 rounded-lg bg-[var(--surface-ghost)]" />
           ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 px-8 py-8 space-y-4">
        <div className="h-4 w-full rounded-md bg-[var(--surface-ghost)]" />
        <div className="h-4 w-5/6 rounded-md bg-[var(--surface-ghost)]" />
        <div className="h-4 w-4/5 rounded-md bg-[var(--surface-ghost)]" />
        <div className="mt-8 h-4 w-full rounded-md bg-[var(--surface-ghost)]" />
        <div className="h-4 w-3/4 rounded-md bg-[var(--surface-ghost)]" />
      </div>
    </div>
  );
};
