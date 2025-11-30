import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface TotalPaymentsCardProps {
  amount: number;
  paymentCount: number;
}

export function TotalPaymentsCard({ amount, paymentCount }: TotalPaymentsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-4 w-4 text-green-600" />
          </div>
          <h4 className="text-xs font-medium text-green-700">Total Payments</h4>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-green-900">{formatCurrency(amount)}</p>
          <p className="text-xs text-green-600">
            {paymentCount} {paymentCount === 1 ? 'payment' : 'payments'} received
          </p>
        </div>
      </div>
    </Card>
  );
}
