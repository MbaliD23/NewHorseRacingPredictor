import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export function BackButton({ label = "Back", className, showLabel = false }: { label?: string; className?: string; showLabel?: boolean }) {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size={showLabel ? "lg" : "icon"}
      className={cn("back-arrow", className)}
      onClick={() => navigate(-1)}
      aria-label={label}
      title={label}
    >
      <ArrowLeft className="h-5 w-5" />
      {showLabel ? <span>{label}</span> : null}
    </Button>
  );
}
