import { UpdateStepPayload } from "./types"

export const putStep = async (payload: UpdateStepPayload): Promise<void> => {
  const response = await fetch(`/api/steps/${payload.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to update step")
  }
}
