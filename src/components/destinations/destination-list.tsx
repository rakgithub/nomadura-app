"use client";

import {
  useDestinations,
  useDeleteDestination,
} from "@/hooks/use-destinations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { paginateArray, getTotalPages } from "@/lib/pagination";
import { Trash2, MapPin } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ITEMS_PER_PAGE = 10;

export function DestinationList() {
  const { data: destinations, isLoading, error, refetch } = useDestinations();
  const deleteDestination = useDeleteDestination();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Paginate destinations
  const paginatedDestinations = destinations
    ? paginateArray(destinations, currentPage, ITEMS_PER_PAGE)
    : [];
  const totalPages = destinations
    ? getTotalPages(destinations.length, ITEMS_PER_PAGE)
    : 0;

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDestination.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorDisplay message="Failed to load destinations" onRetry={refetch} />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Destinations</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-bold">{destinations?.length || 0}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!destinations || destinations.length === 0 ? (
            <EmptyState
              message="No destinations yet"
              description="Add your first destination using the form above"
            />
          ) : (
            <>
              <div className="space-y-3">
                {paginatedDestinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-lg">
                          {destination.name}
                        </span>
                        {destination.country && (
                          <span className="text-sm text-muted-foreground">
                            ({destination.country})
                          </span>
                        )}
                      </div>
                      {destination.description && (
                        <p className="text-sm text-muted-foreground pl-6">
                          {destination.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(destination.id)}
                      disabled={deleteDestination.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={destinations.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Destination"
        description="Are you sure you want to delete this destination? Trips using this destination will have their destination unset."
        isPending={deleteDestination.isPending}
      />
    </>
  );
}
