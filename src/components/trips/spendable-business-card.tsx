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

interface SpendableBusinessCardProps {
  amount: number;
}

export function SpendableBusinessCard({ amount }: SpendableBusinessCardProps) {
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
          Spendable for Business
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs space-y-2">
                  <p className="font-semibold text-purple-900">This trip's contribution to business budget</p>
                  <p className="text-sm text-purple-700">
                    Amount you can use immediately for business expenses such as marketing, ads, tools, or operations.
                  </p>
                  <p className="text-sm text-purple-700 pt-2 border-t border-purple-200">
                    This amount is added to your global Business Balance and can be used for any business expense.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold text-purple-600">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
