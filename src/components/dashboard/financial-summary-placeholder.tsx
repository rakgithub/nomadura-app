import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

// A generic card placeholder component that mimics the structure of the financial cards
const CardPlaceholder = () => (
  // Mimics the modern card structure (padding, rounded corners, white background)
  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 h-full">
    {/* Card Header (Title and Icon) */}
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="h-4 w-3/5" /> {/* Title */}
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" /> {/* Icon Circle */}
    </div>

    {/* Primary Value */}
    <Skeleton className="h-10 w-4/5 mb-6" /> {/* Large Main Value (4xl height approx) */}
    
    {/* Key Metrics Breakdown (Border Separator) */}
    <div className="space-y-2 pt-4 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-1/5" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton screen for the Financial Summary section.
 * Displays five placeholder cards matching the layout of the loaded cards.
 */
export function FinancialSummaryPlaceholder() {
  return (
    // Grid layout matching the final FinancialSummary display
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* 5 placeholders for the 5 financial buckets */}
      <CardPlaceholder />
      <CardPlaceholder />
      <CardPlaceholder />
      <CardPlaceholder />
      <CardPlaceholder />
    </div>
  );
}