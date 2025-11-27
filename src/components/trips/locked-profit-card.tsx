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
import { Lock, Info } from "lucide-react";

interface LockedProfitCardProps {
  amount: number;
  tripReserve: number;
  unusedTripSpend: number;
  isCompleted: boolean;
}

export function LockedProfitCard({
  amount,
  tripReserve,
  unusedTripSpend,
  isCompleted,
}: LockedProfitCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  return (
    <Card className={isCompleted ? "border-amber-200 bg-amber-50/30" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
          Locked Profit
          {!isCompleted && <Lock className="h-3 w-3" />}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs space-y-2">
                  <p className="font-semibold text-amber-900">
                    {isCompleted ? "Released to Profit Wallet" : "Potential profit when trip completes"}
                  </p>
                  <p className="text-sm text-amber-700">
                    This becomes your profit once the trip is marked completed. If any trip budget remains unused, it gets added here automatically.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-amber-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Trip Reserve</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(tripReserve)}</span>
                    </div>
                    {unusedTripSpend > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700">Unused Trip Spend</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(unusedTripSpend)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-1.5 border-t border-amber-200 font-semibold">
                      <span className="text-amber-900">Total Locked Profit</span>
                      <span className="text-amber-600">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                  {isCompleted && (
                    <p className="text-sm text-amber-800 pt-2 border-t border-amber-200 font-medium">
                      ✅ Trip completed! This profit has been added to your Total Profit.
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold text-amber-600">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
