import { axiosClient } from "@/api/axiosClient";
import { endpoints } from "@/api/endpoints";
import type { Race, Venue } from "@/types/race";

export async function getRaces() {
  const { data } = await axiosClient.get<Venue[]>(endpoints.races);
  return data;
}

export async function getRace(raceId: number | string) {
  const { data } = await axiosClient.get<Race | null>(endpoints.race(raceId));
  return data;
}
