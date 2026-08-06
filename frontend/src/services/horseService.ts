import type { Horse } from "@/types/horse";

export async function getHorse(_: number | string): Promise<Horse | null> {
  // The backend exposes /horses/{horse_id} as HTML, not JSON.
  // No standalone JSON horse detail endpoint exists in the actual contract.
  return null;
}
