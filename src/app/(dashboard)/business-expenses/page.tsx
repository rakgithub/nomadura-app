"use client";

import { useState } from "react";
import { BusinessExpenseList } from "@/components/business-expenses/business-expense-list";
import { BusinessExpenseModal } from "@/components/business-expenses/business-expense-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BusinessExpensesPage() {
  const [showModal, setShowModal] = useState(false);

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
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Business Expense
          </Button>
        </div>

        <BusinessExpenseList />
      </div>

      <BusinessExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
