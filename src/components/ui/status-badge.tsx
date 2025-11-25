import { cn } from "@/lib/utils";
import { TripStatus } from "@/types/database";

const statusColors: Record<TripStatus, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<TripStatus, string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface StatusBadgeProps {
  status: TripStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        statusColors[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
