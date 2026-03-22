export const NotesListSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className="rounded-[1.35rem] border border-[var(--divider)] bg-[var(--surface-muted)] px-4 py-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="h-4 w-32 rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-3 w-12 rounded-full bg-[var(--surface-ghost)]" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded-full bg-[var(--surface-ghost)]" />
          <div className="h-3 w-4/5 rounded-full bg-[var(--surface-ghost)]" />
        </div>
      </div>
    ))}
  </div>
);