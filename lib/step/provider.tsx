"use client"

import { useCallback, useReducer } from "react"
import { putStep } from "./api"
import { StepContext } from "./context"
import { StepReducer } from "./reducer"
import { StepState, UpdateStepPayload } from "./types"

const initialState: StepState = {
  isLoading: false,
  error: null,
}

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [, dispatch] = useReducer(StepReducer, initialState)

  const updateStep = useCallback(
    async (id: string, payload: UpdateStepPayload) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        await putStep({ ...payload, id })
      } catch {
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    []
  )
  return (
    <StepContext.Provider value={{ updateStep }}>
      {children}
    </StepContext.Provider>
  )
}
