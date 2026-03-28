"use client"

import { createContext, useContext } from "react"
import { UpdateStepPayload } from "./types"

export interface StepContextType {
  updateStep: (id: string, payload: UpdateStepPayload) => Promise<void>
}

export const StepContext = createContext<StepContextType | undefined>(undefined)

export const useStep = () => {
  const context = useContext(StepContext)
  if (!context) {
    throw new Error("useStep must be used within StepProvider")
  }
  return context
}
