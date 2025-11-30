"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Payment } from "@/types/database";

export interface PaymentWithParticipant extends Payment {
  participant_name: string;
}

async function fetchTripPayments(tripId: string): Promise<PaymentWithParticipant[]> {
  const res = await fetch(`/api/trips/${tripId}/payments`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

async function fetchPayments(
  tripId: string,
  participantId: string
): Promise<Payment[]> {
  const res = await fetch(
    `/api/trips/${tripId}/participants/${participantId}/payments`
  );
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

async function createPayment({
  tripId,
  participantId,
  data,
}: {
  tripId: string;
  participantId: string;
  data: {
    amount: number;
    payment_date?: string;
    notes?: string;
  };
}): Promise<Payment> {
  const res = await fetch(
    `/api/trips/${tripId}/participants/${participantId}/payments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to add payment");
  return res.json();
}

export function useTripPayments(tripId: string) {
  return useQuery({
    queryKey: ["trip-payments", tripId],
    queryFn: () => fetchTripPayments(tripId),
    enabled: !!tripId,
  });
}

export function usePayments(tripId: string, participantId: string) {
  return useQuery({
    queryKey: ["payments", tripId, participantId],
    queryFn: () => fetchPayments(tripId, participantId),
    enabled: !!tripId && !!participantId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", variables.tripId, variables.participantId],
      });
      // Also invalidate trip-level payments and participants
      queryClient.invalidateQueries({
        queryKey: ["trip-payments", variables.tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ["participants", variables.tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ["trips", variables.tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },
  });
}
