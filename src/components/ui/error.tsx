import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An error occurred while loading this page.",
  retry,
}: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
