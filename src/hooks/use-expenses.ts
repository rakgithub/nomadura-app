"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense, ExpenseCategory } from "@/types/database";

async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const res = await fetch(`/api/trips/${tripId}/expenses`);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
}

async function createExpense({
  tripId,
  data,
}: {
  tripId: string;
  data: {
    category: ExpenseCategory;
    description: string;
    amount: number;
    expense_date?: string;
    notes?: string;
    ignoreWarning?: boolean;
  };
}): Promise<Expense> {
  const res = await fetch(`/api/trips/${tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    const err: any = new Error(error.message || "Failed to add expense");
    err.response = { data: error };
    throw err;
  }

  return res.json();
}

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => fetchExpenses(tripId),
    enabled: !!tripId,
  });
}

async function deleteExpense({
  tripId,
  expenseId,
}: {
  tripId: string;
  expenseId: string;
}): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete expense");
  }
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ["trip", variables.tripId],
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expenses", variables.tripId],
      });
      queryClient.invalidateQueries({
        queryKey: ["trip", variables.tripId],
      });
    },
  });
}

// Expense category labels for display
export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  transport: "Transport",
  accommodation: "Accommodation",
  food: "Food & Beverages",
  activities: "Activities",
  guide: "Guide Fees",
  equipment: "Equipment",
  permits: "Permits & Fees",
  insurance: "Insurance",
  other: "Other",
};

// Expense category colors for badges
export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  transport: "bg-blue-100 text-blue-700",
  accommodation: "bg-purple-100 text-purple-700",
  food: "bg-orange-100 text-orange-700",
  activities: "bg-green-100 text-green-700",
  guide: "bg-cyan-100 text-cyan-700",
  equipment: "bg-slate-100 text-slate-700",
  permits: "bg-amber-100 text-amber-700",
  insurance: "bg-indigo-100 text-indigo-700",
  other: "bg-gray-100 text-gray-700",
};

// Expense category icons
export const expenseCategoryIcons: Record<ExpenseCategory, string> = {
  transport: "Car",
  accommodation: "Home",
  food: "UtensilsCrossed",
  activities: "Activity",
  guide: "UserCheck",
  equipment: "Wrench",
  permits: "FileText",
  insurance: "Shield",
  other: "MoreHorizontal",
};
