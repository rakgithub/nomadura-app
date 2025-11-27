import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface SpendableTripCardProps {
  balance: number;
  baseAmount: number;
  expensesSpent: number;
}

export function SpendableTripCard({
  balance,
  baseAmount,
  expensesSpent,
}: SpendableTripCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const isDepleted = balance <= 0;
  const percentageUsed = baseAmount > 0 ? (expensesSpent / baseAmount) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          Spendable for Trip
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs space-y-2">
                  <p className="font-semibold text-green-900">Available to spend right now</p>
                  <p className="text-sm text-green-700">
                    This money is ready to be used for trip operations like hotels, transport, and activities.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-green-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Base Amount</span>
                      <span className="font-semibold text-green-900">{formatCurrency(baseAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Expenses Spent</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(expensesSpent)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1.5 border-t border-green-200">
                      <span className="text-green-700">Budget Usage</span>
                      <span className="font-semibold text-green-900">{Math.round(percentageUsed)}%</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-lg font-bold ${isDepleted ? "text-red-600" : "text-green-600"}`}>
          {formatCurrency(balance)}
        </div>
      </CardContent>
    </Card>
  );
}
