"use client"

import { createContext, useContext } from "react"
import {
  CreateConnectionPayload,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  Workflow,
  WorkflowState,
} from "./types"

interface WorkflowContextType extends WorkflowState {
  fetchWorkflows: () => Promise<void>
  fetchWorkflow: (id: string) => Promise<Workflow>
  removeConnection: (id: string) => Promise<void>
  addConnection: (payload: CreateConnectionPayload) => Promise<void>
  createWorkflow: (payload: CreateWorkflowPayload) => Promise<void>
  updateWorkflow: (payload: UpdateWorkflowPayload) => Promise<void>
}

export const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
)

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
