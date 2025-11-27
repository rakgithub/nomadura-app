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

interface TripReserveLockedCardProps {
  amount: number;
  reservePercentage: number;
}

export function TripReserveLockedCard({ amount, reservePercentage }: TripReserveLockedCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const reservePercent = Math.round(reservePercentage * 100);

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
          Trip Reserve
          <Lock className="h-3 w-3" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs space-y-2">
                  <p className="font-semibold text-blue-900">{reservePercent}% of advance</p>
                  <p className="text-sm text-blue-700">
                    Saved for this trip only. Stays locked until trip is completed.
                    Any unused amount will turn into profit after the trip.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold text-blue-600">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
