import { Paginate } from "@/lib/paginate"
import {
  CreateConnectionPayload,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  Workflow,
  WorkflowConnection,
} from "./types"

function extractId(value: unknown): string | undefined {
  if (typeof value === "string" && value) {
    return value.includes("/") ? (value.split("/").pop() ?? value) : value
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>
    if (typeof o["@id"] === "string") return extractId(o["@id"])
    if (o.id !== undefined) return extractId(o.id)
  }
  return undefined
}

function connectionFromResponse(
  data: unknown,
  fallback: { from: string; to: string }
): WorkflowConnection {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid connection response")
  }
  const o = data as Record<string, unknown>
  const id = extractId(o.id ?? o["@id"])
  if (!id) {
    throw new Error("Connection response missing id")
  }
  const from =
    extractId(o.from) ??
    extractId((o as { source?: string }).source) ??
    fallback.from
  const to =
    extractId(o.to) ??
    extractId((o as { target?: string }).target) ??
    fallback.to
  return { id, from, to }
}

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
): Promise<WorkflowConnection> => {
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

  const data = await response.json()
  return connectionFromResponse(data, {
    from: payload.from,
    to: payload.to,
  })
}
