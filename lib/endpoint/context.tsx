"use client";

import { createContext, useContext } from "react";
import { CreateEndpointPayload, EndpointState } from "./types";

export interface EndpointContextType extends EndpointState {
  fetchEndpoints: () => Promise<void>;
  createEndpoint: (payload: CreateEndpointPayload) => Promise<void>;
}

export const EndpointContext = createContext<EndpointContextType | undefined>(undefined);

export const useEndpoint = () => {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error("useEndpoint must be used within EndpointProvider");
  }
  return context;
};
