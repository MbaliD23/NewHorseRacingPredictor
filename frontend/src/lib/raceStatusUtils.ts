/**
 * Race display status resolved client-side against the current local time.
 *
 * Priority:
 *   1. "live"      — backend is_live flag is true, OR race_time is today and has already passed
 *   2. "today"     — race_time is today's calendar date AND start time is still in the future
 *   3. "upcoming"  — race_time is a future calendar date (is_upcoming=true from backend)
 *   4. "scheduled" — catch-all fallback (no flags, no parseable time)
 */
export type RaceDisplayStatus = "live" | "today" | "upcoming" | "scheduled";

export function getRaceDisplayStatus(
  race: {
    is_live: boolean;
    is_upcoming: boolean;
    race_time: string | null;
  },
  now: Date = new Date()
): RaceDisplayStatus {
  // Backend already computed is_live (same hour, same day, not past)
  if (race.is_live) return "live";

  if (race.race_time) {
    const raceDate = new Date(race.race_time);
    if (!Number.isNaN(raceDate.getTime())) {
      // Build today's date boundary in local time (midnight → 23:59:59.999)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const isToday = raceDate >= todayStart && raceDate <= todayEnd;

      if (isToday) {
        // Post time has passed → show Live even if backend flag hasn't caught up yet
        if (raceDate <= now) return "live";
        // Post time is still in the future → Today's Race
        return "today";
      }
    }
  }

  // Future calendar date
  if (race.is_upcoming) return "upcoming";

  // Past, no flags, or unparseable time
  return "scheduled";
}
