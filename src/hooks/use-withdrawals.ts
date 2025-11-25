"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Withdrawal } from "@/types/database";

async function fetchWithdrawals(): Promise<Withdrawal[]> {
  const res = await fetch("/api/withdrawals");
  if (!res.ok) throw new Error("Failed to fetch withdrawals");
  return res.json();
}

async function createWithdrawal(data: {
  amount: number;
  withdrawal_date?: string;
  notes?: string;
}): Promise<Withdrawal> {
  const res = await fetch("/api/withdrawals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create withdrawal");
  }
  return res.json();
}

async function updateWithdrawal({
  id,
  data,
}: {
  id: string;
  data: {
    amount?: number;
    withdrawal_date?: string;
    notes?: string;
  };
}): Promise<Withdrawal> {
  const res = await fetch(`/api/withdrawals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update withdrawal");
  }
  return res.json();
}

async function deleteWithdrawal(id: string): Promise<void> {
  const res = await fetch(`/api/withdrawals/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete withdrawal");
  }
}

/**
 * Hook to fetch all withdrawals for the authenticated user.
 */
export function useWithdrawals() {
  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: fetchWithdrawals,
  });
}

/**
 * Hook to create a new withdrawal.
 * Validates against withdrawable profit on the backend.
 * Invalidates both withdrawals and financial-summary on success.
 */
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

/**
 * Hook to update a withdrawal.
 * Invalidates both withdrawals and financial-summary on success.
 */
export function useUpdateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

/**
 * Hook to delete a withdrawal.
 * Invalidates both withdrawals and financial-summary on success.
 */
export function useDeleteWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}
