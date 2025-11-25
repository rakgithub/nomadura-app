import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BusinessRevenueCardProps {
  revenue: number;
  profitPool: number;
  operatingPool: number;
}

export function BusinessRevenueCard({
  revenue,
  profitPool,
  operatingPool,
}: BusinessRevenueCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Business Revenue</CardTitle>
        <CardDescription className="text-xs">Total income from all trips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Profit Pool (30%)
            </span>
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(profitPool)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Operating Pool (70%)
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {formatCurrency(operatingPool)}
            </span>
          </div>
        </div>

        {/* Visual bar showing 30/70 split */}
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="bg-green-500" style={{ width: "30%" }} />
          <div className="bg-blue-500" style={{ width: "70%" }} />
        </div>
      </CardContent>
    </Card>
  );
}
