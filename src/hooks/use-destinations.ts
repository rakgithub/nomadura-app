"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Destination } from "@/types/database";

async function fetchDestinations(): Promise<Destination[]> {
  const res = await fetch("/api/destinations");
  if (!res.ok) throw new Error("Failed to fetch destinations");
  return res.json();
}

async function createDestination(data: {
  name: string;
  description?: string;
  country?: string;
}): Promise<Destination> {
  const res = await fetch("/api/destinations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create destination");
  }
  return res.json();
}

async function updateDestination({
  id,
  data,
}: {
  id: string;
  data: {
    name?: string;
    description?: string;
    country?: string;
  };
}): Promise<Destination> {
  const res = await fetch(`/api/destinations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update destination");
  }
  return res.json();
}

async function deleteDestination(id: string): Promise<void> {
  const res = await fetch(`/api/destinations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete destination");
  }
}

/**
 * Hook to fetch all destinations for the authenticated user.
 */
export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
  });
}

/**
 * Hook to create a new destination.
 * Invalidates destinations query on success.
 */
export function useCreateDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
}

/**
 * Hook to update a destination.
 * Invalidates destinations query on success.
 */
export function useUpdateDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
}

/**
 * Hook to delete a destination.
 * Invalidates destinations query on success.
 */
export function useDeleteDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
}
