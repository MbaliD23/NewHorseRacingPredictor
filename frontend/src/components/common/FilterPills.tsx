import { Clock } from "lucide-react";

export type FilterValue = "all" | "today" | "upcoming";

export function FilterPills({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  const pillClass = (isActive: boolean) =>
    `whitespace-nowrap shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer h-10 sm:h-11 flex items-center justify-center ${
      isActive
        ? "border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-500/20"
        : "border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-gray-700 dark:text-slate-300 hover:-translate-y-0.5 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-white dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-xs"
    }`;

  const iconClass = (isActive: boolean) => (isActive ? "text-white" : "text-purple-600");

  return (
    <div className="flex flex-row items-center flex-nowrap gap-2 shrink-0">
      <button
        type="button"
        aria-pressed={value === "all"}
        onClick={() => onChange("all")}
        className={pillClass(value === "all")}
      >
        All
      </button>
      <button
        type="button"
        aria-pressed={value === "today"}
        onClick={() => onChange("today")}
        className={`flex items-center gap-2 ${pillClass(value === "today")}`}
      >
        <div className={`h-2.5 w-2.5 shrink-0 aspect-square rounded-full ${value === "today" ? "bg-white" : "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"}`} />
        Today's Races
      </button>
      <button
        type="button"
        aria-pressed={value === "upcoming"}
        onClick={() => onChange("upcoming")}
        className={`flex items-center gap-2 ${pillClass(value === "upcoming")}`}
      >
        <Clock className={`h-4 w-4 ${iconClass(value === "upcoming")}`} />
        Upcoming Races
      </button>
    </div>
  );
}
