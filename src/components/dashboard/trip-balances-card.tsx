import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, TrendingDown } from "lucide-react";

interface TripBalancesCardProps {
  balance: number;
  tripCount?: number;
  tripExpenses?: number;
}

export function TripBalancesCard({ balance, tripCount = 0, tripExpenses = 0 }: TripBalancesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Trip Balances</CardTitle>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Plane className="h-5 w-5 text-green-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-green-700">
            {formatCurrency(balance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Available across active trips
          </p>
        </div>

        {tripExpenses > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5" />
                Total Trip Expenses
              </span>
              <span className="font-semibold text-red-600">
                {formatCurrency(tripExpenses)}
              </span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Combined total of all Spendable for Trip amounts across active trips.
          </p>
          {tripCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Across {tripCount} active trip{tripCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {balance > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              This money is ready to be used for trip operations like hotels, transport, and activities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
