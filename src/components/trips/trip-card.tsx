"use client";

import Link from "next/link";
import { Trip, TripStatus } from "@/types/database";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, Users, IndianRupee, ChevronRight } from "lucide-react";

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

const statusBorderColors: Record<TripStatus, string> = {
  upcoming: "border-l-blue-500",
  in_progress: "border-l-violet-500",
  completed: "border-l-emerald-500",
  cancelled: "border-l-red-500",
};

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className={cn(
        "group hover:shadow-lg transition-all cursor-pointer border-l-4",
        statusBorderColors[trip.status]
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {trip.name}
              </h3>
              {trip.destination && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="truncate">{trip.destination}</span>
                </div>
              )}
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                statusColors[trip.status]
              )}
            >
              {statusLabels[trip.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <span className="text-muted-foreground">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </span>
              </div>
              {trip.min_participants && (
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <span className="text-muted-foreground">Min: {trip.min_participants}</span>
                </div>
              )}
              {trip.price_per_participant && (
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="font-medium">{trip.price_per_participant.toLocaleString()}</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
