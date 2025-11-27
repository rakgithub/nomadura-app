import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface BusinessRevenueCardProps {
  earnedRevenue: number;
  totalAdvanceReceived: number;
  profitPool: number;
}

export function BusinessRevenueCard({
  earnedRevenue,
  totalAdvanceReceived,
  profitPool,
}: BusinessRevenueCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const earnedOperating = earnedRevenue * 0.70;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Earned Revenue</CardTitle>
            <CardDescription className="text-xs">From completed trips only</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(earnedRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue from completed trips
          </p>
        </div>

        {/* Breakdown */}
        <div className="pt-3 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profit Pool (30%)</span>
            <span className="font-medium text-green-600">{formatCurrency(profitPool)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Operating (70%)</span>
            <span className="font-medium" style={{ color: "#9CBB04" }}>{formatCurrency(earnedOperating)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground text-xs">Unearned (Advance)</span>
            <span className="font-medium text-xs text-amber-600">{formatCurrency(totalAdvanceReceived)}</span>
          </div>
        </div>

        {/* Visual bar showing 30/70 split */}
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="bg-green-500" style={{ width: "30%" }} />
          <div style={{ width: "70%", backgroundColor: "#9CBB04" }} />
        </div>
      </CardContent>
    </Card>
  );
}
