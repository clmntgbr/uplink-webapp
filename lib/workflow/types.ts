import { Paginate } from "@/lib/paginate"
import { Step } from "@/lib/step/types"

export interface WorkflowStep {
  id: string
  step: Step
  position: { x: number; y: number }
}

export interface WorkflowConnection {
  id: string
  from: string
  to: string
}

export interface Workflow {
  "@id"?: string
  id?: string
  name: string
  description?: string
  variables?: Record<string, string>
  steps?: WorkflowStep[]
  connections?: WorkflowConnection[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateWorkflowPayload {
  name: string
  description?: string
}

export interface UpdateWorkflowPayload {
  name?: string
  description?: string
  steps?: WorkflowStep[]
  connections?: WorkflowConnection[]
}

export interface WorkflowState {
  workflows: Paginate<Workflow>
  isLoading: boolean
  error: string | null
}

export type WorkflowAction =
  | { type: "SET_WORKFLOWS"; payload: Paginate<Workflow> }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
