import { Paginate } from "@/lib/paginate"
import {
  CreateConnectionPayload,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  Workflow,
} from "./types"

export const getWorkflows = async (): Promise<Paginate<Workflow>> => {
  const response = await fetch("/api/workflows", {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch workflows")
  }

  return response.json()
}

export const getWorkflow = async (id: string): Promise<Workflow> => {
  const response = await fetch(`/api/workflows/${id}`, {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch workflow")
  }

  return response.json()
}

export const putWorkflow = async (
  payload: UpdateWorkflowPayload
): Promise<Workflow> => {
  const response = await fetch(`/api/workflows/${payload.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to update workflow")
  }

  return response.json()
}

export const postWorkflow = async (
  payload: CreateWorkflowPayload
): Promise<Workflow> => {
  const response = await fetch("/api/workflows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create workflow")
  }

  return response.json()
}

export const deleteConnection = async (id: string): Promise<void> => {
  const response = await fetch(`/api/connections/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete connection")
  }
}

export const postConnection = async (
  payload: CreateConnectionPayload
): Promise<void> => {
  const response = await fetch(`/api/connections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create connection")
  }
}
