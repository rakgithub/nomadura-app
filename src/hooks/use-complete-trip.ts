import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CompleteTripResponse {
  success: boolean;
  tripId: string;
  status: string;
  finalProfit: number;
  reserveReleased: number;
  tripSpendReleased: number;
  profitWalletBalance: number;
  breakdown: {
    total_advance_received: number;
    trip_reserve_balance: number;
    operating_account: number;
    business_account: number;
    total_expenses: number;
    reserve_released: number;
    trip_spend_released: number;
    final_profit: number;
    completion_formula: string;
  };
  message: string;
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string): Promise<CompleteTripResponse> => {
      const response = await fetch(`/api/trips/${tripId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete trip");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["trip", data.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["advance-payments", data.tripId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", data.tripId] });
    },
  });
}
