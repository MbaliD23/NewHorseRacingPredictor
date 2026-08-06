import { Button } from "@/components/common/Button";

type FilterValue = "all" | "live" | "upcoming";

export function FilterPills({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  return (
    <div className="filter-row">
      <Button variant={value === "all" ? "gold" : "outline"} size="sm" onClick={() => onChange("all")}>
        All
      </Button>
      <Button variant={value === "live" ? "gold" : "outline"} size="sm" onClick={() => onChange("live")}>
        Live
      </Button>
      <Button variant={value === "upcoming" ? "gold" : "outline"} size="sm" onClick={() => onChange("upcoming")}>
        Upcoming
      </Button>
    </div>
  );
}
