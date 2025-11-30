"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletType } from "@/lib/calculations/transfers";

export interface WalletTransfer {
  id: string;
  user_id: string;
  trip_id: string;
  from_wallet: WalletType;
  to_wallet: WalletType;
  amount: number;
  impact_type: string;
  note: string;
  transfer_date: string;
  created_at: string;
}

interface CreateTransferRequest {
  tripId: string;
  from_wallet: WalletType;
  to_wallet: WalletType;
  amount: number;
}

interface CreateTransferResponse {
  success: boolean;
  transfer: WalletTransfer;
  impact: {
    profitChange: number;
    warning?: string;
  };
  newBalances: {
    trip_reserve_balance: number;
    operating_account: number;
    business_account: number;
  };
  message: string;
}

/**
 * Fetch all transfers for a specific trip
 */
async function fetchTransfers(tripId: string): Promise<WalletTransfer[]> {
  const res = await fetch(`/api/trips/${tripId}/transfers`);
  if (!res.ok) throw new Error("Failed to fetch transfers");
  return res.json();
}

/**
 * Create a new transfer between wallets
 */
async function createTransfer(
  data: CreateTransferRequest
): Promise<CreateTransferResponse> {
  const { tripId, ...body } = data;
  const res = await fetch(`/api/trips/${tripId}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create transfer");
  }

  return res.json();
}

/**
 * Hook to fetch wallet transfers for a trip
 */
export function useWalletTransfers(tripId: string) {
  return useQuery({
    queryKey: ["wallet-transfers", tripId],
    queryFn: () => fetchTransfers(tripId),
    enabled: !!tripId,
  });
}

/**
 * Hook to create a new wallet transfer
 */
export function useCreateWalletTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["wallet-transfers", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
