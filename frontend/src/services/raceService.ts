import { axiosClient } from "@/api/axiosClient";
import { endpoints } from "@/api/endpoints";
import type { Race, Venue } from "@/types/race";

const TODAY = new Date("2026-08-14T00:00:00");

function parseMeetingDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sortVenuesByMeetingDate(venues: Venue[]) {
  return [...venues].sort((left, right) => {
    const leftDate = parseMeetingDate(left.meeting_date);
    const rightDate = parseMeetingDate(right.meeting_date);

    const leftIsPast = leftDate ? leftDate.getTime() < TODAY.getTime() : true;
    const rightIsPast = rightDate ? rightDate.getTime() < TODAY.getTime() : true;

    if (leftIsPast !== rightIsPast) {
      return leftIsPast ? 1 : -1;
    }

    const leftTime = leftDate?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightTime = rightDate?.getTime() ?? Number.POSITIVE_INFINITY;

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.venue.localeCompare(right.venue);
  });
}

export async function getRaces() {
  const { data } = await axiosClient.get<Venue[]>(endpoints.races);
  return sortVenuesByMeetingDate(data);
}

export async function getRace(raceId: number | string) {
  const { data } = await axiosClient.get<Race | null>(endpoints.race(raceId));
  return data;
}
