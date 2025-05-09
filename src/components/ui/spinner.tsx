
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <div className="h-full w-full rounded-full border-2 border-b-transparent border-t-primary" />
    </div>
  );
}
