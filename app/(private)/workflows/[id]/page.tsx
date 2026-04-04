"use client"

import EndpointsLibrary from "@/components/endpoints-library"
import { StepDrawer } from "@/components/step-drawer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkflowCanvas, { WorkflowCanvasRef } from "@/components/workflow-canvas"
import { useWorkflow } from "@/lib/workflow/context"
import { Workflow, WorkflowStep } from "@/lib/workflow/types"
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

  const handleSave = useCallback(
    async (workflowPayload?: Workflow) => {
      const workflowData = workflowPayload ?? workflow
      if (!workflowData?.id) return
      await updateWorkflow(workflowData)
    },
    [workflow, updateWorkflow]
  )

  const handleStepUpdate = useCallback(async () => {
    const updatedWorkflow = await fetchWorkflow(id as string)
    setWorkflow((prev) => {
      if (!prev) return updatedWorkflow
      return {
        ...prev,
        steps: updatedWorkflow.steps?.map((newStep) => {
          const oldStep = prev.steps?.find((s) => s.id === newStep.id)
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
      <Tabs
        defaultValue="overview"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
          <div className="flex min-w-0 flex-1 justify-start">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">
                {workflow.name}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {workflow.description}
              </p>
            </div>
          </div>
          <TabsList className="shrink-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="flex min-w-0 flex-1 justify-end">
            <Button type="button" variant="outline">
              Settings
            </Button>
          </div>
        </header>
        <TabsContent
          value="overview"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <EndpointsLibrary />
            <WorkflowCanvas
              ref={canvasRef}
              workflow={workflow}
              onWorkflowChange={handleWorkflowChange}
              onStepSelect={handleStepSelect}
              onSave={handleSave}
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
        </TabsContent>
        <TabsContent
          value="analytics"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-auto p-4 text-sm text-muted-foreground"
        >
          The quick brown fox jumps over the lazy dog — placeholder content for
          this tab.
        </TabsContent>
      </Tabs>
    </div>
  )
}
