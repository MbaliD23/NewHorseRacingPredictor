import { axiosClient } from "@/api/axiosClient";
import { endpoints } from "@/api/endpoints";
import type { ApiStatus } from "@/types/api";

export async function getStatus() {
  const { data } = await axiosClient.get<ApiStatus>(endpoints.status);
  return data;
}
