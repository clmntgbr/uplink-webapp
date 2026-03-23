"use client"

import { StepCard } from "@/components/step-card"
import { useEndpoint } from "@/lib/endpoint/context"
import { Endpoint } from "@/lib/endpoint/types"
import { Step } from "@/lib/step/types"

export default function WorkflowId() {
  const { endpoints } = useEndpoint()

  const step = {
    id: "1",
    name: "Login",
    description: "Login to the system",
    endpoint: endpoints.members[5] as Endpoint,
  } as Step

  if (!step.endpoint) {
    return <div>No endpoint found</div>
  }

  return (
    <>
      <StepCard step={step} />
    </>
  )
}
