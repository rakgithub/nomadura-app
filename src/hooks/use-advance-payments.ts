import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdvancePayment, InsertAdvancePayment } from "@/types/database";

interface AdvancePaymentWithTrip extends AdvancePayment {
  trips: {
    user_id: string;
    name: string;
    status?: string;
  };
}

async function fetchAdvancePayments(tripId?: string): Promise<AdvancePaymentWithTrip[]> {
  const url = tripId
    ? `/api/advance-payments?trip_id=${tripId}`
    : "/api/advance-payments";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch advance payments");
  }
  return response.json();
}

async function fetchAdvancePayment(id: string): Promise<AdvancePaymentWithTrip> {
  const response = await fetch(`/api/advance-payments/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch advance payment");
  }
  return response.json();
}

async function createAdvancePayment(
  data: Omit<InsertAdvancePayment, "trip_reserve_amount" | "early_unlock_amount" | "locked_amount">
): Promise<AdvancePayment> {
  const response = await fetch("/api/advance-payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create advance payment");
  }

  return response.json();
}

async function deleteAdvancePayment(id: string): Promise<void> {
  const response = await fetch(`/api/advance-payments/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete advance payment");
  }
}

export function useAdvancePayments(tripId?: string) {
  return useQuery({
    queryKey: ["advance-payments", tripId],
    queryFn: () => fetchAdvancePayments(tripId),
  });
}

export function useAdvancePayment(id: string) {
  return useQuery({
    queryKey: ["advance-payments", id],
    queryFn: () => fetchAdvancePayment(id),
    enabled: !!id,
  });
}

export function useCreateAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvancePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advance-payments"] });
      queryClient.invalidateQueries({ queryKey: ["trips", data.trip_id] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["participants", data.trip_id] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

export function useDeleteAdvancePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdvancePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advance-payments"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}
