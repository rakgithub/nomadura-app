import { Card } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";

interface PendingPaymentsCardProps {
  amount: number;
  totalCost: number;
  totalReceived: number;
}

export function PendingPaymentsCard({ amount, totalCost, totalReceived }: PendingPaymentsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const percentageReceived = totalCost > 0 ? (totalReceived / totalCost) * 100 : 100;
  const isPending = amount > 0;
  const isFullyPaid = !isPending && totalReceived > 0;

  return (
    <Card className={`bg-gradient-to-br ${
      isPending
        ? 'from-amber-50 to-orange-50 border-amber-200'
        : isFullyPaid
        ? 'from-green-50 to-emerald-50 border-green-200'
        : 'from-gray-50 to-slate-50 border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${
            isPending
              ? 'bg-amber-100'
              : isFullyPaid
              ? 'bg-green-100'
              : 'bg-gray-100'
          }`}>
            {isFullyPaid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Clock className={`h-4 w-4 ${
                isPending ? 'text-amber-600' : 'text-gray-600'
              }`} />
            )}
          </div>
          <h4 className={`text-xs font-medium ${
            isPending
              ? 'text-amber-700'
              : isFullyPaid
              ? 'text-green-700'
              : 'text-gray-700'
          }`}>
            {isPending ? 'Pending Amount' : 'Payment Status'}
          </h4>
        </div>
        <div className="space-y-1">
          {isPending ? (
            <>
              <p className="text-2xl font-bold text-amber-900">
                {formatCurrency(amount)}
              </p>
              <p className="text-xs text-amber-600">
                {percentageReceived.toFixed(0)}% received so far
              </p>
            </>
          ) : (
            <>
              <p className={`text-2xl font-bold ${
                isFullyPaid ? 'text-green-900' : 'text-gray-900'
              }`}>
                {isFullyPaid ? 'Fully Paid' : 'No pending amount'}
              </p>
              <p className={`text-xs ${
                isFullyPaid ? 'text-green-600' : 'text-gray-600'
              }`}>
                {isFullyPaid ? `${formatCurrency(totalReceived)} collected` : 'No payments yet'}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
