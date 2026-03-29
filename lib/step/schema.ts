import * as z from "zod"

export const stepSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
  description: z.string().optional(),
  endpointId: z.string().min(1, "Endpoint is required"),
})
