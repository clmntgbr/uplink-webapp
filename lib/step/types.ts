import { Endpoint } from "../endpoint/types"

export interface Step {
  id: string
  name: string
  description?: string
  endpoint: Endpoint
}
