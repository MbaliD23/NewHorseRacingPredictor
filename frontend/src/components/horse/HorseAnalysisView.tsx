import { useState } from "react";
import {
  ChevronLeft,
  Heart,
  TrendingUp,
  Clock,
  Tag,
  Trophy,
  Scale,
  Glasses,
  Medal,
  Droplets,
  Flag,
  User,
  Lightbulb,
  ChevronDown,
  Info,
  Layers,
  MapPin,
  Flame
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Horse } from "@/types/race";
import placeholderSilks from "@/assets/placeholder_silks.jpg";

interface HorseAnalysisViewProps {
  horse: Horse | null;
  raceTitle?: string;
  raceNumber?: number;
  venueName?: string;
}

export function HorseAnalysisView({
  horse,
  raceTitle,
  raceNumber,
  venueName,
}: HorseAnalysisViewProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Fallbacks for display purposes to match mockup aesthetic if backend values are missing
  const horseName = horse?.name ?? "PACIFIC COBBLER";
  const saddleNo = horse?.draw_number ?? horse?.id ?? 1;
  const jockeyName = horse?.jockey_name ?? "R. Fourie";
  const trainerName = horse?.trainer_name ?? "A. Smith";
  const weightVal = horse?.weight_value ? `${horse.weight_value.toFixed(1)} kg` : "60.0 kg";
  const drawNo = horse?.draw_number ?? 5;
  const meritRating = horse?.speed_index ? Math.round(horse.speed_index * 10) : 84;
  const winPercent = horse?.trainer_jockey_win_percent
    ? Math.round(horse.trainer_jockey_win_percent)
    : 60;

  // Mock performance data matching mockup rings
  const performanceMetrics = [
    { label: "Trainer", percent: winPercent, color: "green" as const, icon: User },
    { label: "Jockey", percent: 50, color: "green" as const, icon: User },
    { label: "Wet", percent: 67, color: "green" as const, icon: Droplets },
    { label: "Course", percent: 57, color: "green" as const, icon: MapPin },
    { label: "Distance", percent: 62, color: "orange" as const, icon: Flame },
    { label: "Course & Distance", percent: 58, color: "purple" as const, icon: Flag },
  ];

  // Mock recent form matching screenshot
  const recentForm = [
    { date: "18 May 2024", course: venueName ?? "Greyville", dist: "1600m", pos: 2, margin: "1.25 lengths", jockey: jockeyName, weight: "59.0" },
    { date: "27 Apr 2024", course: venueName ?? "Greyville", dist: "1400m", pos: 1, margin: "0.75 lengths", jockey: jockeyName, weight: "58.5" },
    { date: "06 Apr 2024", course: venueName ?? "Greyville", dist: "1600m", pos: 4, margin: "2.10 lengths", jockey: jockeyName, weight: "59.5" },
    { date: "16 Mar 2024", course: venueName ?? "Greyville", dist: "1200m", pos: 3, margin: "1.80 lengths", jockey: jockeyName, weight: "57.5" },
    { date: "02 Mar 2024", course: venueName ?? "Greyville", dist: "1400m", pos: 6, margin: "4.35 lengths", jockey: jockeyName, weight: "58.0" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 text-gray-800">
      {/* Card Container */}
      <div className="bg-white rounded-3xl border border-purple-100/80 shadow-[0_10px_40px_rgba(139,92,246,0.06)] p-4 sm:p-7 space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-lg font-bold text-white shadow-md shadow-purple-600/20">
                {saddleNo}
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  {horseName}
                </h1>
                {raceTitle ? (
                  <p className="text-xs text-purple-600 font-medium">
                    {venueName ? `${venueName} • ` : ""}Race {raceNumber ? `${raceNumber}: ` : ""}{raceTitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
              isFavorite
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-400 hover:text-red-500"
            }`}
            aria-label="Favorite horse"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Section 1: About the horse */}
        <div className="rounded-2xl border border-purple-100/70 bg-purple-50/20 p-5 sm:p-6 transition-all hover:border-purple-200">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-purple-900">About the horse</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Metadata list */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Description</span>
                <span className="font-bold text-gray-900 capitalize">{horse?.pedigree_description ?? "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Date of Birth</span>
                <span className="font-bold text-gray-900">{horse?.dob ?? "Unknown"}</span>
              </div>
              <div className="h-px w-full bg-purple-100/60 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Jockey</span>
                <span className="font-bold text-gray-900">{jockeyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Trainer</span>
                <span className="font-bold text-gray-900">{trainerName}</span>
              </div>
            </div>

            {/* Right Jockey Colours */}
            <div className="flex flex-col items-center justify-center pt-2 md:pt-0 md:border-l md:border-purple-100/60 md:pl-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Jockey Colours</h3>
              
              <div className="flex items-center gap-4">
                {/* Silks graphic */}
                <img src={placeholderSilks} alt="Jockey Silks" className="w-24 h-24 sm:w-28 sm:h-28 object-contain mix-blend-multiply" />
                
                {/* Colours Text Badge */}
                <div className="max-w-[150px] rounded-xl bg-purple-50/80 p-3 text-xs font-medium text-purple-900 border border-purple-100/80 leading-relaxed shadow-sm">
                  {horse?.silks ?? "Colours not available"}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5 mt-3">
                <span className="h-2 w-2 rounded-full bg-purple-600" />
                <span className="h-2 w-2 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Key details */}
        <div className="rounded-2xl border border-purple-100/70 bg-white p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Tag className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-purple-900">Key details</h2>
          </div>

          {/* Top Row (5 items) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-center">
            <div className="pt-2 sm:pt-0">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Mass</span>
              <div className="flex items-center justify-center text-purple-700 mb-1">
                <Scale className="h-6 w-6" />
              </div>
              <span className="text-base font-extrabold text-gray-900">{weightVal}</span>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Draw</span>
              <div className="flex items-center justify-center text-purple-700 mb-1">
                <Layers className="h-6 w-6" />
              </div>
              <span className="text-base font-extrabold text-gray-900">{drawNo}</span>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Merit Rating</span>
              <div className="flex items-center justify-center text-purple-700 mb-1">
                <Medal className="h-6 w-6" />
              </div>
              <span className="text-base font-extrabold text-gray-900">{meritRating}</span>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Blinkers</span>
              <div className="flex items-center justify-center text-purple-700 mb-1">
                <Glasses className="h-6 w-6" />
              </div>
              <span className="text-base font-extrabold text-gray-900">{horse?.equipment?.includes('B') ? 'Yes' : 'No'}</span>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Alumites</span>
              <div className="flex items-center justify-center text-purple-700 mb-1">
                <Glasses className="h-6 w-6" />
              </div>
              <span className="text-base font-extrabold text-gray-900">{horse?.equipment?.includes('A') ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100" />

          {/* Bottom Row (3 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-center">
            <div className="flex items-center justify-center gap-3 pt-2 sm:pt-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-gray-500 block">Odds</span>
                <span className="text-base font-extrabold text-gray-900">{horse?.odds ?? "-"}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 sm:pt-0 sm:pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-gray-500 block">Stakes</span>
                <span className="text-base font-extrabold text-gray-900">{horse?.stakes ?? "-"}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 sm:pt-0 sm:pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Tag className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-gray-500 block">Selling Price</span>
                <span className="text-base font-extrabold text-gray-900">{horse?.sale_price ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: How they have been performing */}
        <div className="rounded-2xl border border-purple-100/70 bg-white p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-purple-900">How they have been performing</h2>
            </div>
            
            <button className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">
              <Info className="h-4 w-4" />
              What do these mean?
            </button>
          </div>

          {/* 6 Circular Gauges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 py-2">
            {performanceMetrics.map((item) => (
              <CircularGauge
                key={item.label}
                percent={item.percent}
                label={item.label}
                color={item.color}
                icon={item.icon}
              />
            ))}
          </div>

          {/* Tip Banner */}
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 p-3 text-xs font-semibold text-emerald-800">
            <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Higher % means better recent performance</span>
          </div>
        </div>

        {/* Section 4: Recent form */}
        <div className="rounded-2xl border border-purple-100/70 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-purple-900">Recent form</h2>
            </div>

            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              View full history
              <ChevronDown className={`h-4 w-4 transform transition-transform ${showFullHistory ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-600">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Distance</th>
                  <th className="pb-3">Position</th>
                  <th className="pb-3">Margins</th>
                  <th className="pb-3">Jockey</th>
                  <th className="pb-3">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentForm.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 font-semibold text-gray-800">{row.date}</td>
                    <td className="py-3 text-gray-600">{row.course}</td>
                    <td className="py-3 text-gray-600">{row.dist}</td>
                    <td className="py-3">
                      <PositionBadge pos={row.pos} />
                    </td>
                    <td className="py-3 text-gray-600">{row.margin}</td>
                    <td className="py-3 text-gray-700">{row.jockey}</td>
                    <td className="py-3 font-semibold text-gray-800">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center text-xs text-gray-400">
            Stats are based on recent data. Tap any item for more info.
          </div>
        </div>

      </div>
    </div>
  );
}

function CircularGauge({
  percent,
  label,
  sublabel = "Last 14 days",
  color = "green",
  icon: Icon,
}: {
  percent: number;
  label: string;
  sublabel?: string;
  color?: "green" | "orange" | "purple";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const radius = 30;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const colorStyles = {
    green: {
      stroke: "#22c55e",
      iconColor: "text-emerald-600",
    },
    orange: {
      stroke: "#f97316",
      iconColor: "text-orange-500",
    },
    purple: {
      stroke: "#7c3aed",
      iconColor: "text-purple-600",
    },
  }[color];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={radius}
            className="text-gray-100"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={colorStyles.stroke}
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-sm font-extrabold text-gray-900">{percent}%</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 justify-center">
        <Icon className={`w-3.5 h-3.5 ${colorStyles.iconColor}`} />
        <span className="text-xs font-bold text-gray-800 leading-tight">{label}</span>
      </div>
      <span className="text-[11px] text-gray-400 font-medium">{sublabel}</span>
    </div>
  );
}

function PositionBadge({ pos }: { pos: number }) {
  const bg =
    pos === 1
      ? "bg-emerald-500"
      : pos === 2
      ? "bg-emerald-600"
      : pos === 3
      ? "bg-orange-500"
      : pos === 4
      ? "bg-slate-400"
      : "bg-gray-400";

  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-white font-bold text-xs shadow-xs ${bg}`}>
      {pos}
    </span>
  );
}
