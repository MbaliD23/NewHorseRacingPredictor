import type { Horse } from "@/types/race";
import type { HorseOrderBy } from "@/store/predictionStore";

function getComparableNumber(value: number | null | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseOddsValue(value: string | null | undefined) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const cleaned = value.trim().toUpperCase().replace(/F$/, "");
  const fractionMatch = cleaned.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator !== 0) {
      return numerator / denominator;
    }
  }

  const numericMatch = cleaned.match(/\d+(?:\.\d+)?/);
  return numericMatch ? Number(numericMatch[0]) : Number.POSITIVE_INFINITY;
}

export function sortHorses(horses: Horse[], orderBy: HorseOrderBy) {
  return [...horses].sort((left, right) => {
    switch (orderBy) {
      case "draw_number": {
        const diff =
          getComparableNumber(left.draw_number, Number.POSITIVE_INFINITY) -
          getComparableNumber(right.draw_number, Number.POSITIVE_INFINITY);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
      case "runner_number": {
        const diff =
          getComparableNumber(left.runner_number, Number.POSITIVE_INFINITY) -
          getComparableNumber(right.runner_number, Number.POSITIVE_INFINITY);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
      case "weight": {
        const diff =
          getComparableNumber(right.weight_value, Number.NEGATIVE_INFINITY) -
          getComparableNumber(left.weight_value, Number.NEGATIVE_INFINITY);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
      case "merit_rating": {
        const diff =
          getComparableNumber(right.merit_rating, Number.NEGATIVE_INFINITY) -
          getComparableNumber(left.merit_rating, Number.NEGATIVE_INFINITY);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
      case "predicted_finish": {
        const diff =
          getComparableNumber(left.predicted_time, Number.POSITIVE_INFINITY) -
          getComparableNumber(right.predicted_time, Number.POSITIVE_INFINITY);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
      case "odds": {
        const diff = parseOddsValue(left.odds) - parseOddsValue(right.odds);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
      case "horse_name": {
        const diff = left.name.localeCompare(right.name);
        if (diff !== 0) {
          return diff;
        }
        break;
      }
    }

    const runnerDiff =
      getComparableNumber(left.runner_number, Number.POSITIVE_INFINITY) -
      getComparableNumber(right.runner_number, Number.POSITIVE_INFINITY);
    if (runnerDiff !== 0) {
      return runnerDiff;
    }

    return left.name.localeCompare(right.name);
  });
}
