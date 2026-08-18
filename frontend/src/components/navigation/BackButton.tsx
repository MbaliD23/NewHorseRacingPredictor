import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  label?: string;
  className?: string;
  showLabel?: boolean;
  fallbackTo?: string;
};

export function BackButton({
  label = "Back",
  className,
  showLabel = false,
  fallbackTo = "/",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <Button
      variant="outline"
      size={showLabel ? "lg" : "icon"}
      className={cn("back-arrow workflow-back-button", className)}
      onClick={handleClick}
      type="button"
      aria-label={label}
      title={label}
    >
      <ArrowLeft className="h-5 w-5" />
      {showLabel ? <span className="hidden sm:inline">{label}</span> : null}
    </Button>
  );
}
