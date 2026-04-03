"use client"

import { useCallback, useEffect, useReducer } from "react"
import { initPaginate } from "../paginate"
import { useProject } from "../project/context"
import {
  deleteConnection,
  getWorkflow,
  getWorkflows,
  postConnection,
  postWorkflow,
  putWorkflow,
} from "./api"
import { WorkflowContext } from "./context"
import { WorkflowReducer } from "./reducer"
import {
  CreateConnectionPayload,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  Workflow,
  WorkflowState,
} from "./types"

const initialState: WorkflowState = {
  workflows: initPaginate<Workflow>(),
  isLoading: false,
  error: null,
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(WorkflowReducer, initialState)
  const { project } = useProject()

  const fetchWorkflows = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const workflows = await getWorkflows()
      dispatch({ type: "SET_WORKFLOWS", payload: workflows })
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch workflows" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const fetchWorkflow = useCallback(
    async (workflowId: string): Promise<Workflow> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const workflow = await getWorkflow(workflowId)
        return workflow
      } catch {
        dispatch({ type: "SET_ERROR", payload: "Failed to fetch workflow" })
        throw new Error("Failed to fetch workflow")
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    []
  )

  const createWorkflow = useCallback(
    async (payload: CreateWorkflowPayload) => {
      await postWorkflow(payload)
      await fetchWorkflows()
    },
    [fetchWorkflows]
  )

  const updateWorkflow = useCallback(async (payload: UpdateWorkflowPayload) => {
    await putWorkflow(payload)
    // await fetchWorkflows()
  }, [])

  const removeConnection = useCallback(async (id: string) => {
    await deleteConnection(id)
  }, [])

  const addConnection = useCallback(
    async (payload: CreateConnectionPayload) => postConnection(payload),
    []
  )

  useEffect(() => {
    if (project?.id) {
      fetchWorkflows()
    }
  }, [fetchWorkflows, project?.id])

  return (
    <WorkflowContext.Provider
      value={{
        ...state,
        fetchWorkflows,
        fetchWorkflow,
        createWorkflow,
        updateWorkflow,
        removeConnection,
        addConnection,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}
