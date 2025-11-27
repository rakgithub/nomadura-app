"use client";

import { useState } from "react";
import { BusinessExpenseList } from "@/components/business-expenses/business-expense-list";
import { BusinessExpenseModal } from "@/components/business-expenses/business-expense-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { Plus, Wallet } from "lucide-react";

export default function BusinessExpensesPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: financialSummary } = useFinancialSummary("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const canAddExpense = financialSummary && financialSummary.operatingAccount > 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Business Expenses</h1>
            <p className="text-muted-foreground">
              Track general business expenses like rent, software, and marketing
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => setShowModal(true)}
              disabled={!canAddExpense}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Business Expense
            </Button>
            {!canAddExpense && financialSummary && (
              <p className="text-xs text-red-600 font-medium">
                No funds available in Operating Account
              </p>
            )}
          </div>
        </div>

        {/* Operating Account Balance Card */}
        {financialSummary && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Available for Business Expenses
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatCurrency(financialSummary.operatingAccount)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Operating Account Balance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <BusinessExpenseList />
      </div>

      <BusinessExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
