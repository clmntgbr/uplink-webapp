"use client";

import { useCallback, useEffect, useReducer } from "react";
import { initPaginate } from "../paginate";
import { useProject } from "../project/context";
import { getEndpoints, postEndpoint } from "./api";
import { EndpointContext } from "./context";
import { EndpointReducer } from "./reducer";
import { CreateEndpointPayload, Endpoint, EndpointState } from "./types";

const initialState: EndpointState = {
  endpoints: initPaginate<Endpoint>(),
  isLoading: false,
  error: null,
};

export function EndpointProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(EndpointReducer, initialState);
  const { project } = useProject();

  const fetchEndpoints = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const endpoints = await getEndpoints();
      dispatch({ type: "SET_ENDPOINTS", payload: endpoints });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch endpoints" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const createEndpoint = useCallback(
    async (payload: CreateEndpointPayload) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await postEndpoint(payload);
        await fetchEndpoints();
      } catch {
        dispatch({ type: "SET_ERROR", payload: "Failed to create endpoint" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [fetchEndpoints],
  );

  useEffect(() => {
    if (project?.id) {
      fetchEndpoints();
    }
  }, [fetchEndpoints, project?.id]);

  return (
    <EndpointContext.Provider
      value={{
        ...state,
        fetchEndpoints,
        createEndpoint,
      }}
    >
      {children}
    </EndpointContext.Provider>
  );
}
