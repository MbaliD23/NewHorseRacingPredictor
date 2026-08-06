import { AlertTriangle, Loader2 } from "lucide-react";
import type { PropsWithChildren } from "react";
import type { AsyncStateProps } from "@/types/api";

export function AsyncBoundary({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No data available.",
  children,
}: PropsWithChildren<AsyncStateProps>) {
  if (isLoading) {
    return (
      <div className="state-panel">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>Loading</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="state-panel border-red-500/40">
        <AlertTriangle className="h-8 w-8 text-red-300" />
        <span>Unable to load data.</span>
      </div>
    );
  }

  if (isEmpty) {
    return <div className="state-panel">{emptyMessage}</div>;
  }

  return <>{children}</>;
}
