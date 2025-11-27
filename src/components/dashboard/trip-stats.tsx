"use client";

import { useTrips } from "@/hooks/use-trips";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Map, TrendingUp, CheckCircle } from "lucide-react";

export function TripStats() {
  const { data: allTrips, isLoading } = useTrips("all");

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Loading />
        <Loading />
        <Loading />
      </div>
    );
  }

  const trips = allTrips || [];

  // Count trips by status
  const upcomingCount = trips.filter((t) => t.status === "upcoming").length;
  const inProgressCount = trips.filter((t) => t.status === "in_progress").length;
  const completedCount = trips.filter((t) => t.status === "completed").length;

  // Active trips = upcoming + in progress
  const activeCount = upcomingCount + inProgressCount;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Active Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
            <Map className="h-5 w-5 text-violet-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">
            Upcoming & in progress
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#9CBB0420" }}>
            <TrendingUp className="h-5 w-5" style={{ color: "#9CBB04" }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingCount}</div>
          <p className="text-xs text-muted-foreground">
            Scheduled trips
          </p>
        </CardContent>
      </Card>

      {/* Completed Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">
            Finished trips
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
