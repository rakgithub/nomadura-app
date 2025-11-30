import { cn } from "@/lib/utils"; // Assuming a utility function for conditional class merging
import React from "react";

// Define the component props, extending standard div props for flexibility
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  // We don't need custom props, as we extend all standard HTML div props
}

/**
 * A reusable component to display a skeleton loading state (placeholder).
 * It uses the Tailwind CSS 'animate-pulse' utility for a smooth loading effect.
 *
 * @param className - Optional CSS classes to override default appearance (e.g., width, height).
 * @param props - Standard HTML div attributes.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        // Base styling for the skeleton block
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        // Apply any custom classes passed in
        className
      )}
      {...props}
    />
  );
}