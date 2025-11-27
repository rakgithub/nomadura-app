"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BusinessExpense, BusinessExpenseCategory } from "@/types/database";

async function fetchBusinessExpenses(): Promise<BusinessExpense[]> {
  const res = await fetch("/api/business-expenses");
  if (!res.ok) throw new Error("Failed to fetch business expenses");
  return res.json();
}

async function createBusinessExpense(data: {
  category: BusinessExpenseCategory;
  description: string;
  amount: number;
  expense_date?: string;
  notes?: string;
  ignoreWarning?: boolean;
}): Promise<BusinessExpense> {
  const res = await fetch("/api/business-expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    const err: any = new Error(error.error || error.message || "Failed to create business expense");
    err.response = { data: error };
    throw err;
  }

  return res.json();
}

async function updateBusinessExpense({
  id,
  data,
}: {
  id: string;
  data: {
    category?: BusinessExpenseCategory;
    description?: string;
    amount?: number;
    expense_date?: string;
    notes?: string;
  };
}): Promise<BusinessExpense> {
  const res = await fetch(`/api/business-expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update business expense");
  }
  return res.json();
}

async function deleteBusinessExpense(id: string): Promise<void> {
  const res = await fetch(`/api/business-expenses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete business expense");
  }
}

/**
 * Hook to fetch all business expenses for the authenticated user.
 */
export function useBusinessExpenses() {
  return useQuery({
    queryKey: ["business-expenses"],
    queryFn: fetchBusinessExpenses,
  });
}

/**
 * Hook to create a new business expense.
 * Invalidates both business-expenses and financial-summary on success.
 */
export function useCreateBusinessExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBusinessExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

/**
 * Hook to update a business expense.
 * Invalidates both business-expenses and financial-summary on success.
 */
export function useUpdateBusinessExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBusinessExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

/**
 * Hook to delete a business expense.
 * Invalidates both business-expenses and financial-summary on success.
 */
export function useDeleteBusinessExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBusinessExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
    },
  });
}

// Business expense category labels for display
export const businessExpenseCategoryLabels: Record<
  BusinessExpenseCategory,
  string
> = {
  rent: "Rent",
  software_tools: "Software & Tools",
  fb_ads: "FB Ads",
  marketing: "Marketing",
  utility_bills: "Utility & Bills",
  travel: "Travel",
};

// Business expense category colors for badges
export const businessExpenseCategoryColors: Record<
  BusinessExpenseCategory,
  string
> = {
  rent: "bg-orange-100 text-orange-700",
  software_tools: "bg-purple-100 text-purple-700",
  fb_ads: "bg-blue-100 text-blue-700",
  marketing: "bg-green-100 text-green-700",
  utility_bills: "bg-amber-100 text-amber-700",
  travel: "bg-teal-100 text-teal-700",
};
