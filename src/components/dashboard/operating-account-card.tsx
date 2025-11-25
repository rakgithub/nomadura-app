import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OperatingStatus } from "@/types/financial";

interface OperatingAccountCardProps {
  balance: number;
  operatingPool: number;
  totalExpenses: number;
  status: OperatingStatus;
}

export function OperatingAccountCard({
  balance,
  operatingPool,
  totalExpenses,
  status,
}: OperatingAccountCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "critical":
        return "bg-red-100 text-red-700";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "warning":
        return "Warning";
      case "critical":
        return "Critical";
    }
  };

  const remainingPercentage =
    operatingPool > 0 ? (balance / operatingPool) * 100 : 0;
  const usedPercentage = 100 - remainingPercentage;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Operating Account</CardTitle>
            <CardDescription className="text-xs">70% pool minus expenses</CardDescription>
          </div>
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}
          >
            {getStatusLabel()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`text-2xl font-bold ${getStatusColor()}`}>
          {formatCurrency(balance)}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Operating Pool (70%)
            </span>
            <span className="text-sm font-semibold">
              {formatCurrency(operatingPool)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Total Expenses
            </span>
            <span className="text-sm font-semibold text-red-600">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Remaining</span>
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {remainingPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Visual bar showing remaining vs used */}
        <div className="space-y-1">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={
                status === "healthy"
                  ? "bg-green-500"
                  : status === "warning"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
              style={{ width: `${Math.max(0, remainingPercentage)}%` }}
            />
          </div>
          {balance < 0 && (
            <p className="text-xs text-red-600">
              Over budget by {formatCurrency(Math.abs(balance))}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
