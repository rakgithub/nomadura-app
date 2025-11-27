import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";

interface TripReservesCardProps {
  amount: number;
}

export function TripReservesCard({ amount }: TripReservesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Trip Reserves</CardTitle>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-blue-700">
            {formatCurrency(amount)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Protected funds for trip expenses only
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Total reserved money across all ongoing trips that will convert to profit after completion.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This represents potential profit locked in active trips.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
