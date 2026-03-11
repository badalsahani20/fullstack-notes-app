export const getRelativeUpdatedLabel = (updatedAt: string, nowMs: number) => {
  const updatedDate = new Date(updatedAt);
  const nowDate = new Date(nowMs);
  const diffMs = Math.max(0, nowMs - updatedDate.getTime());
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;

  const nowWeekday = nowDate.getDay();
  const distanceFromMonday = (nowWeekday + 6) % 7;
  const startOfWeek = new Date(nowDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - distanceFromMonday);

  if (updatedDate >= startOfWeek) {
    return `Updated ${new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(updatedDate)}`;
  }

  if (updatedDate.getFullYear() === nowDate.getFullYear()) {
    return `Updated ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(updatedDate)}`;
  }

  return `Updated ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(updatedDate)}`;
};
