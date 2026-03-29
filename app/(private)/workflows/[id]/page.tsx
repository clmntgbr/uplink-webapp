"use client"

import EndpointsLibrary from "@/components/endpoints-library"
import { StepDrawer } from "@/components/step-drawer"
import { Button } from "@/components/ui/button"
import WorkflowCanvas, { WorkflowCanvasRef } from "@/components/workflow-canvas"
import { useWorkflow } from "@/lib/workflow/context"
import { Workflow, WorkflowStep } from "@/lib/workflow/types"
import { Save } from "lucide-react"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

export default function WorkflowId() {
  const canvasRef = useRef<WorkflowCanvasRef>(null)

  const { id } = useParams()

  const { updateWorkflow, fetchWorkflow } = useWorkflow()
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [workflow, setWorkflow] = useState<Workflow | null>(null)

  useEffect(() => {
    fetchWorkflow(id as string).then((workflow) => {
      setWorkflow(workflow)
    })
  }, [fetchWorkflow, id])

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow)
  }, [])

  const handleStepSelect = useCallback((step: WorkflowStep | null) => {
    setSelectedStep(step)
    if (step) {
      setIsDrawerOpen(true)
    }
  }, [])

  const handleSave = useCallback(async () => {
    const workflowData = {
      ...workflow,
    }

    await updateWorkflow(workflowData)
  }, [workflow, updateWorkflow])

  const handleStepUpdate = useCallback(async () => {
    const updatedWorkflow = await fetchWorkflow(id as string)
    setWorkflow(prev => {
      if (!prev) return updatedWorkflow
      return {
        ...prev,
        steps: updatedWorkflow.steps?.map(newStep => {
          const oldStep = prev.steps?.find(s => s.id === newStep.id)
          return {
            ...newStep,
            position: oldStep?.position || newStep.position,
          }
        }),
        connections: prev.connections,
      }
    })
  }, [fetchWorkflow, id])

  if (!workflow) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">{workflow.name}</h1>
          <p className="text-xs text-muted-foreground">
            {workflow.description}
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Workflow
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <EndpointsLibrary />
        <WorkflowCanvas
          ref={canvasRef}
          workflow={workflow}
          onWorkflowChange={handleWorkflowChange}
          onStepSelect={handleStepSelect}
        />
      </div>
      <StepDrawer
        onUpdate={handleStepUpdate}
        workflowId={workflow.id}
        step={
          selectedStep
            ? {
                id: selectedStep.id,
                name: selectedStep.name,
                description: selectedStep.description,
                endpoint: selectedStep.endpoint,
                endpointId: selectedStep.endpointId,
                position: selectedStep.position,
              }
            : null
        }
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  )
}
