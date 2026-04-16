export const FolderPanelSkeleton = () => (
  <div className="space-y-1 animate-pulse">
    {[1, 2, 3, 4].map((item) => (
      <div 
        key={item} 
        className="flex items-center justify-between rounded-xl px-3 py-[10px]"
      >
        <div className="flex items-center gap-2">
          {/* Chevron slot */}
          <div className="h-4 w-4 rounded-md bg-[var(--surface-ghost)]" />
          {/* Icon slot */}
          <div className="h-4 w-4 rounded-md bg-[var(--surface-ghost)]" />
          {/* Label slot */}
          <div className="h-3.5 w-24 rounded-full bg-[var(--surface-ghost)]" />
        </div>
        {/* Count pill slot */}
        <div className="h-5 w-8 rounded-full bg-[var(--surface-ghost)]" />
      </div>
    ))}
  </div>
);