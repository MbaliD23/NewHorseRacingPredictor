import { Clock } from "lucide-react";

type FilterValue = "all" | "live" | "upcoming";

export function FilterPills({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  const pillClass = (isActive: boolean) =>
    `rounded-full border px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
      isActive
        ? "border-purple-600 bg-purple-600 text-white shadow-purple-200"
        : "border-gray-200 bg-white/75 text-gray-700 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-white hover:text-purple-700 hover:shadow-md"
    }`;

  const iconClass = (isActive: boolean) => (isActive ? "text-white" : "text-purple-600");

  return (
    <div className="flex items-center gap-3">
      <button
        aria-pressed={value === "all"}
        onClick={() => onChange("all")}
        className={pillClass(value === "all")}
      >
        All
      </button>
      <button
        aria-pressed={value === "live"}
        onClick={() => onChange("live")}
        className={`flex items-center gap-2 ${pillClass(value === "live")}`}
      >
        <div className={`h-2.5 w-2.5 shrink-0 aspect-square rounded-full ${value === "live" ? "bg-white" : "bg-purple-600"}`} />
        Live Now
      </button>
      <button
        aria-pressed={value === "upcoming"}
        onClick={() => onChange("upcoming")}
        className={`flex items-center gap-2 ${pillClass(value === "upcoming")}`}
      >
        <Clock className={`h-4 w-4 ${iconClass(value === "upcoming")}`} />
        Upcoming
      </button>
    </div>
  );
}
