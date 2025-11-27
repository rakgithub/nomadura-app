import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OperatingStatus } from "@/types/financial";
import { Briefcase } from "lucide-react";

interface OperatingAccountCardProps {
  balance: number;
  operatingBase?: number; // New: base amount from advances
  tripExpenses: number;
  status: OperatingStatus;
}

export function OperatingAccountCard({
  balance,
  operatingBase,
  tripExpenses,
  status,
}: OperatingAccountCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
    }
  };

  const getIconBgColor = () => {
    switch (status) {
      case "healthy":
        return "bg-green-100";
      case "warning":
        return "bg-orange-100";
      case "critical":
        return "bg-red-100";
    }
  };

  const getIconColor = () => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Operating Account</CardTitle>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getIconBgColor()}`}>
            <Briefcase className={`h-5 w-5 ${getIconColor()}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Available for trip spending
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Money available for on-trip spending. Hotels, cabs, local transport, guides — use it anytime.
          </p>
        </div>

        {/* Breakdown */}
        {operatingBase !== undefined && (
          <div className="pt-3 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Base</span>
              <span className="font-medium">{formatCurrency(operatingBase)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trip Expenses</span>
              <span className="font-medium text-red-600">-{formatCurrency(tripExpenses)}</span>
            </div>
          </div>
        )}

        {/* Visual bar showing remaining vs used */}
        {balance < 0 && (
          <p className="text-xs text-red-600 text-center">
            Over budget by {formatCurrency(Math.abs(balance))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
