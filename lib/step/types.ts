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
