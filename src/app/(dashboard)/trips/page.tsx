"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips, useCreateTrip } from "@/hooks/use-trips";
import { TripCard } from "@/components/trips/trip-card";
import { TripModal } from "@/components/trips/trip-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { Pagination } from "@/components/ui/pagination";
import { paginateArray, getTotalPages } from "@/lib/pagination";
import { Plus } from "lucide-react";
import { TripStatus } from "@/types/database";

const ITEMS_PER_PAGE = 10;

const statusFilters: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TripsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { data: trips, isLoading, isFetching, error, refetch } = useTrips(statusFilter);
  const createTrip = useCreateTrip();

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Paginate trips
  const paginatedTrips = trips ? paginateArray(trips, currentPage, ITEMS_PER_PAGE) : [];
  const totalPages = trips ? getTotalPages(trips.length, ITEMS_PER_PAGE) : 0;

  const handleCreate = async (data: {
    name: string;
    destination?: string;
    destination_id?: string;
    start_date: string;
    end_date: string;
    status?: TripStatus;
    min_participants?: number;
    price_per_participant?: number;
    notes?: string;
  }) => {
    try {
      const trip = await createTrip.mutateAsync(data);
      setShowCreateModal(false);
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error("Failed to create trip:", error);
    }
  };

  // Show full loading only on initial load (no cached data)
  if (isLoading && !trips) {
    return <Loading className="min-h-[400px]" size="lg" />;
  }

  if (error) {
    return (
      <ErrorDisplay
        message="Failed to load trips"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trips</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Trip
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(filter.value)}
            disabled={isFetching}
          >
            {filter.label}
          </Button>
        ))}
        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* Trips Grid */}
      {trips && trips.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={trips.length}
          />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No trips found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first trip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Trip Modal */}
      <TripModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createTrip.isPending}
      />
    </div>
  );
}
