import type { Endpoint } from "@/lib/endpoint/types"
import type { Step } from "@/lib/step/types"
import type { OutputPort } from "@/lib/types"
import type {
  Workflow,
  WorkflowConnection,
  WorkflowStep,
} from "@/lib/workflow/types"
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import StepNode from "./step-node"

const nodeTypes = { stepNode: StepNode }

export type { Workflow, WorkflowConnection, WorkflowStep }

export interface WorkflowCanvasRef {
  updateStepOutputs: (stepId: string, outputs: OutputPort[]) => void
}

interface WorkflowCanvasProps {
  workflow?: Workflow
  onWorkflowChange?: (workflow: Workflow) => void
  onStepSelect?: (step: WorkflowStep | null) => void
}

let nodeId = 100

function workflowToReactFlow(workflow?: Workflow): {
  nodes: Node[]
  edges: Edge[]
} {
  if (!workflow || !workflow.steps || !workflow.connections) {
    return { nodes: [], edges: [] }
  }

  const nodes: Node[] = workflow.steps.map((workflowStep) => ({
    id: workflowStep.id,
    type: "stepNode",
    position: workflowStep.position,
    data: {
      step: workflowStep.step,
      outputs: workflowStep.outputs,
    },
  }))

  const edges: Edge[] = workflow.connections.map((conn) => ({
    id: conn.id,
    source: conn.from,
    sourceHandle: conn.fromHandle,
    target: conn.to,
    type: "smoothstep",
  }))

  return { nodes, edges }
}

function reactFlowToWorkflow(
  nodes: Node[],
  edges: Edge[],
  currentWorkflow?: Workflow
): Workflow {
  const steps: WorkflowStep[] = nodes.map((node) => ({
    id: node.id,
    step: node.data.step as Step,
    position: node.position,
    outputs: (node.data.outputs as OutputPort[]) || [],
  }))

  const connections: WorkflowConnection[] = edges.map((edge) => ({
    id: edge.id,
    from: edge.source,
    fromHandle: edge.sourceHandle || null,
    to: edge.target,
  }))

  return {
    id: currentWorkflow?.id,
    name: currentWorkflow?.name || "Untitled Workflow",
    description: currentWorkflow?.description,
    steps,
    connections,
  }
}

const WorkflowCanvas = forwardRef<WorkflowCanvasRef, WorkflowCanvasProps>(
  function WorkflowCanvas({ workflow, onWorkflowChange, onStepSelect }, ref) {
    const initialState = workflowToReactFlow(workflow)
    const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges)
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

    const notifyWorkflowChange = useCallback(() => {
      if (onWorkflowChange) {
        const updatedWorkflow = reactFlowToWorkflow(nodes, edges, workflow)
        onWorkflowChange(updatedWorkflow)
      }
    }, [nodes, edges, workflow, onWorkflowChange])

    const updateStepOutputs = useCallback(
      (stepId: string, outputs: OutputPort[]) => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === stepId
              ? { ...node, data: { ...node.data, outputs } }
              : node
          )
        )
        setTimeout(() => notifyWorkflowChange(), 0)
      },
      [setNodes, notifyWorkflowChange]
    )

    useImperativeHandle(ref, () => ({
      updateStepOutputs,
    }))

    const onConnect = useCallback(
      (params: Connection) => {
        setEdges((eds) => {
          const newEdges = addEdge({ ...params, type: "smoothstep" }, eds)
          setTimeout(() => notifyWorkflowChange(), 0)
          return newEdges
        })
      },
      [setEdges, notifyWorkflowChange]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
    }, [])

    const onDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault()
        const raw = event.dataTransfer.getData("application/workflow-endpoint")
        if (!raw || !rfInstance) return

        const endpoint: Endpoint = JSON.parse(raw)
        const position = rfInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const step: Step = {
          id: endpoint.id,
          name: endpoint.name,
          description: `${endpoint.path}`,
          endpoint,
        }

        const newNode: Node = {
          id: `step-${++nodeId}`,
          type: "stepNode",
          position,
          data: {
            step,
            outputs: [],
          },
        }

        setNodes((nds) => {
          const updated = [...nds, newNode]
          setTimeout(() => notifyWorkflowChange(), 0)
          return updated
        })
      },
      [rfInstance, setNodes, notifyWorkflowChange]
    )

    const handleNodeClick = useCallback(
      (_: React.MouseEvent, node: Node) => {
        if (onStepSelect) {
          const workflowStep: WorkflowStep = {
            id: node.id,
            step: node.data.step as Step,
            position: node.position,
            outputs: (node.data.outputs as OutputPort[]) || [],
          }
          onStepSelect(workflowStep)
        }
      },
      [onStepSelect]
    )

    const handlePaneClick = useCallback(() => {
      if (onStepSelect) {
        onStepSelect(null)
      }
    }, [onStepSelect])

    const handleNodesChange = useCallback(
      (changes: NodeChange[]) => {
        onNodesChange(changes)
        setTimeout(() => notifyWorkflowChange(), 0)
      },
      [onNodesChange, notifyWorkflowChange]
    )

    const handleEdgesChange = useCallback(
      (changes: EdgeChange[]) => {
        onEdgesChange(changes)
        setTimeout(() => notifyWorkflowChange(), 0)
      },
      [onEdgesChange, notifyWorkflowChange]
    )

    return (
      <div ref={reactFlowWrapper} className="h-full flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--canvas-dot))"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    )
  }
)

export default WorkflowCanvas
