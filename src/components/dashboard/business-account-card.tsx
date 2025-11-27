import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface BusinessAccountCardProps {
  balance: number;
  businessExpenses: number;
}

export function BusinessAccountCard({
  balance,
  businessExpenses,
}: BusinessAccountCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const isLow = balance < businessExpenses * 0.2;
  const isNegative = balance < 0;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Business Account</CardTitle>
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-purple-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div
            className={`text-3xl font-bold ${
              isNegative
                ? "text-red-600"
                : isLow
                ? "text-amber-600"
                : "text-purple-700"
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Available for business expenses
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Money available for business expenses like ads and tools.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This is 50% of the spendable amount (non-reserve portion) from all advances.
          </p>
        </div>

        {businessExpenses > 0 && (
          <div className="pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Business Expenses</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(businessExpenses)}
              </span>
            </div>
          </div>
        )}

        {isNegative && (
          <div className="pt-3 border-t">
            <p className="text-xs text-red-600 font-medium">
              ⚠️ Negative balance - expenses exceeded available funds
            </p>
          </div>
        )}

        {isLow && !isNegative && balance > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-amber-600 font-medium">
              ⚠️ Running low - consider recording more advances
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
