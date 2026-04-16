export const NotesListSkeleton = () => (
  <div className="flex flex-col gap-3 px-3 pb-4 animate-pulse">
    {/* List Items Placeholder */}
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div
        key={item}
        className="flex gap-3 rounded-[1rem] border border-[var(--divider)] border-l-[4px] border-l-transparent bg-[var(--note-surface)] px-4 py-[14px] shadow-sm"
      >
        <div className="flex shrink-0 items-center justify-center p-1">
          <div className="h-4 w-4 rounded-full bg-[var(--surface-ghost)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="h-4 w-1/2 rounded-md bg-[var(--surface-ghost)]" />
            <div className="h-3 w-12 rounded-md bg-[var(--surface-ghost)]" />
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="h-3 w-full rounded-md bg-[var(--surface-ghost)]" />
            <div className="h-3 w-4/5 rounded-md bg-[var(--surface-ghost)]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);