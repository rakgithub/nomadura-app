"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transfer } from "@/types/database";

async function fetchTransfers(): Promise<Transfer[]> {
  const res = await fetch("/api/transfers");
  if (!res.ok) throw new Error("Failed to fetch transfers");
  return res.json();
}

async function createTransfer(data: {
  amount: number;
  transfer_date?: string;
  notes?: string;
}): Promise<Transfer> {
  const res = await fetch("/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create transfer");
  }
  return res.json();
}

/**
 * Hook to fetch all transfers for the authenticated user.
 */
export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: fetchTransfers,
  });
}

/**
 * Hook to create a new transfer from profit to operating pool.
 * Invalidates both transfers and financial-summary on success.
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}
