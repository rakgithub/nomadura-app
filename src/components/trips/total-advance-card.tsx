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

interface TotalAdvanceCardProps {
  amount: number;
  paymentCount?: number;
}

export function TotalAdvanceCard({ amount, paymentCount = 0 }: TotalAdvanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          Total Advance
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs space-y-2">
                  <p className="font-semibold text-slate-900">Money collected in advance for this trip</p>
                  {paymentCount > 0 && (
                    <p className="text-sm text-slate-600">
                      Received through {paymentCount} payment{paymentCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold text-slate-700">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
