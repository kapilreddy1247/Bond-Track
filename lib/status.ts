// Human-friendly status helpers for the dashboard's "last seen" indicator.

export type LocationStatus = "recent" | "stale" | "unknown";

export function getLocationStatus(lastUpdatedAt: string | null): LocationStatus {
  if (!lastUpdatedAt) return "unknown";
  const minutesAgo = (Date.now() - new Date(lastUpdatedAt).getTime()) / 60000;
  if (minutesAgo < 5) return "recent";
  if (minutesAgo < 60) return "stale";
  return "unknown";
}

export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "No updates yet";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export const STATUS_META: Record<LocationStatus, { dot: string; label: string }> = {
  recent: { dot: "#3E9B6F", label: "Live" },
  stale: { dot: "#E8A33D", label: "A while ago" },
  unknown: { dot: "#9AA6A7", label: "No data yet" },
};