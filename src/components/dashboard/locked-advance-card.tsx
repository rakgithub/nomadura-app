import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

interface LockedAdvanceCardProps {
  amount: number;
}

export function LockedAdvanceCard({ amount }: LockedAdvanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Locked Advance</CardTitle>
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-amber-600">
            {formatCurrency(amount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Unlocks when trips complete
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Portion of your revenue that stays locked until a trip is completed. Once the trip ends, this moves into Profit Pool and Operating Pool.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
