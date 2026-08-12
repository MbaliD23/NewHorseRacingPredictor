import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

type FilterValue = "all" | "live" | "upcoming";

export function FilterPills({
  value,
  onChange,
  selectedVariant = "gold",
  className,
  activeButtonClassName,
  inactiveButtonClassName,
  labels,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  selectedVariant?: "gold" | "purple";
  className?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  labels?: Partial<Record<FilterValue, string>>;
}) {
  const buttonLabels = {
    all: labels?.all ?? "All",
    live: labels?.live ?? "Live",
    upcoming: labels?.upcoming ?? "Upcoming",
  };

  return (
    <div className={cn("filter-row", className)}>
      <Button
        variant={value === "all" ? selectedVariant : "outline"}
        size="sm"
        className={value === "all" ? activeButtonClassName : inactiveButtonClassName}
        onClick={() => onChange("all")}
      >
        {buttonLabels.all}
      </Button>
      <Button
        variant={value === "live" ? selectedVariant : "outline"}
        size="sm"
        className={value === "live" ? activeButtonClassName : inactiveButtonClassName}
        onClick={() => onChange("live")}
      >
        {buttonLabels.live}
      </Button>
      <Button
        variant={value === "upcoming" ? selectedVariant : "outline"}
        size="sm"
        className={value === "upcoming" ? activeButtonClassName : inactiveButtonClassName}
        onClick={() => onChange("upcoming")}
      >
        {buttonLabels.upcoming}
      </Button>
    </div>
  );
}
