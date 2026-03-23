"use client"

import { createContext, useContext } from "react"
import { Workflow, WorkflowState, CreateWorkflowPayload } from "./types"
import { Paginate } from "../paginate"

interface WorkflowContextType extends WorkflowState {
  fetchWorkflows: () => Promise<void>
  fetchWorkflow: (id: string) => Promise<Workflow>
  createWorkflow: (payload: CreateWorkflowPayload) => Promise<void>
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
