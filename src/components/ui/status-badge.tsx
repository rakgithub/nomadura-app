import { cn } from "@/lib/utils";
import { TripStatus } from "@/types/database";

const statusColors: Record<TripStatus, string> = {
  upcoming: "text-[#9CBB04]",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const upcomingBgStyle = { backgroundColor: "#9CBB0420" };

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
      style={status === "upcoming" ? upcomingBgStyle : undefined}
    >
      {statusLabels[status]}
    </span>
  );
}
