"use client"

import EndpointsLibrary from "@/components/endpoints-library"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import WorkflowCanvas, { WorkflowCanvasRef } from "@/components/workflow-canvas"
import { Workflow, WorkflowStep } from "@/lib/workflow/types"
import { Save } from "lucide-react"
import { useCallback, useRef, useState } from "react"

export default function WorkflowId() {
  const canvasRef = useRef<WorkflowCanvasRef>(null)

  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)

  const [workflow, setWorkflow] = useState<Workflow>({
    id: "new",
    name: "New Workflow",
    description: "Build your workflow by dragging steps onto the canvas",
    steps: [],
    connections: [],
  })

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow)
  }, [])

  const handleStepSelect = useCallback((step: WorkflowStep | null) => {
    setSelectedStep(step)
  }, [])

  const handleSave = useCallback(() => {
    const workflowData = {
      ...workflow,
      savedAt: new Date().toISOString(),
    }
  }, [workflow])

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
        {selectedStep && (
          <aside className="flex w-80 flex-col border-l border-border bg-background">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Step Properties</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm font-medium">
                      {selectedStep.step.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Endpoint
                    </label>
                    <p className="font-mono text-xs">
                      {selectedStep.step.endpoint.path}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Method
                    </label>
                    <p className="text-sm font-medium">
                      {selectedStep.step.endpoint.method}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  )
}
