"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobalBucket } from "@/lib/calculations/global-transfers";

export interface GlobalTransfer {
  id: string;
  user_id: string;
  from_bucket: GlobalBucket;
  to_bucket: GlobalBucket;
  amount: number;
  notes: string | null;
  transfer_date: string;
  created_at: string;
  updated_at: string;
}

interface CreateGlobalTransferInput {
  from_bucket: GlobalBucket;
  to_bucket: GlobalBucket;
  amount: number;
  notes?: string;
  transfer_date?: string;
}

interface GlobalTransferResponse extends GlobalTransfer {
  impact?: {
    description: string;
    warning?: string;
    newBalances: {
      profit_withdrawable: number;
      business_account: number;
      trip_balances: number;
      trip_reserves: number;
    };
  };
}

async function fetchGlobalTransfers(): Promise<GlobalTransfer[]> {
  const res = await fetch("/api/global-transfers");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch global transfers");
  }
  return res.json();
}

async function createGlobalTransfer(
  data: CreateGlobalTransferInput
): Promise<GlobalTransferResponse> {
  const res = await fetch("/api/global-transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create global transfer");
  }
  return res.json();
}

/**
 * Hook to fetch all global transfers for the authenticated user.
 */
export function useGlobalTransfers() {
  return useQuery({
    queryKey: ["global-transfers"],
    queryFn: fetchGlobalTransfers,
  });
}

/**
 * Hook to create a new global transfer between buckets.
 * Invalidates global-transfers and financial-summary on success.
 */
export function useCreateGlobalTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGlobalTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
