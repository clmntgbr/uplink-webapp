import { Endpoint } from "../endpoint/types"

export interface Step {
  id: string
  name: string
  description?: string
  endpoint: Endpoint
  endpointId?: string
  index?: string
  position: { x: number; y: number }
}

export interface UpdateStepPayload {
  id: string
  name?: string
  description?: string
  endpointId?: string
  workflowId?: string
}

export interface StepState {
  error: string | null
  isLoading: boolean
}

export type StepAction = { type: "SET_LOADING"; payload: boolean }
