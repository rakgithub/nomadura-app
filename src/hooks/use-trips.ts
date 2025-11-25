"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trip, InsertTrip, UpdateTrip } from "@/types/database";

async function fetchTrips(status?: string): Promise<Trip[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);

  const res = await fetch(`/api/trips?${params}`);
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

async function fetchTrip(id: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${id}`);
  if (!res.ok) throw new Error("Failed to fetch trip");
  return res.json();
}

async function createTrip(data: Omit<InsertTrip, "user_id">): Promise<Trip> {
  const res = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create trip");
  return res.json();
}

async function updateTrip({ id, ...data }: UpdateTrip & { id: string }): Promise<Trip> {
  const res = await fetch(`/api/trips/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update trip");
  return res.json();
}

async function deleteTrip(id: string): Promise<void> {
  const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete trip");
}

export function useTrips(status?: string) {
  return useQuery({
    queryKey: ["trips", status],
    queryFn: () => fetchTrips(status),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trips", id],
    queryFn: () => fetchTrip(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTrip,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.setQueryData(["trips", data.id], data);
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
