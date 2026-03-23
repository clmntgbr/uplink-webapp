import { Paginate } from "@/lib/paginate";
import { CreateEndpointPayload, Endpoint } from "./types";

export const getEndpoints = async (): Promise<Paginate<Endpoint>> => {
  const response = await fetch("/api/endpoints", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch endpoints");
  }

  return response.json();
};

export const postEndpoint = async (payload: CreateEndpointPayload): Promise<void> => {
  const response = await fetch("/api/endpoints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create endpoint");
  }
};
