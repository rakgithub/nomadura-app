import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface ProfitCardProps {
  profit: number;
  withdrawableProfit: number;
  totalWithdrawals: number;
}

export function ProfitCard({
  profit,
  withdrawableProfit,
  totalWithdrawals,
}: ProfitCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const hasProfit = profit > 0;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Profit (Withdrawable)</CardTitle>
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div
            className={`text-3xl font-bold ${
              hasProfit ? "text-amber-700" : "text-gray-400"
            }`}
          >
            {formatCurrency(withdrawableProfit)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Available to withdraw
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Your total earned profit from all completed trips.
          </p>
          {!hasProfit && (
            <p className="text-xs text-muted-foreground mt-2">
              Profit will show here after trips are completed.
            </p>
          )}
        </div>

        {hasProfit && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Profit</span>
              <span className="font-semibold text-amber-600">
                {formatCurrency(profit)}
              </span>
            </div>
            {totalWithdrawals > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawn</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(totalWithdrawals)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
