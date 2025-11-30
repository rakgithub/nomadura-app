import { useQuery } from "@tanstack/react-query";

interface TripCompletionLog {
  id: string;
  trip_id: string;
  user_id: string;
  final_profit: number;
  reserve_released: number;
  trip_spend_released: number;
  business_account_released: number;
  total_advance_received: number;
  total_expenses: number;
  breakdown: any;
  completed_at: string;
  created_at: string;
}

export function useTripCompletion(tripId: string) {
  return useQuery<TripCompletionLog | null>({
    queryKey: ["trip-completion", tripId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/completion`);
      if (!response.ok) {
        if (response.status === 404) {
          // Trip not completed yet
          return null;
        }
        throw new Error("Failed to fetch trip completion data");
      }
      return response.json();
    },
  });
}
