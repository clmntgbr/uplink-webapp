import type { Endpoint } from "@/lib/endpoint/types"
import type { Step } from "@/lib/step/types"
import type {
  Workflow,
  WorkflowConnection,
  WorkflowStep,
} from "@/lib/workflow/types"
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  ReactFlow,
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
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { v4 as uuidv4 } from "uuid"
import StepNode from "./step-node"

const nodeTypes = { stepNode: StepNode }

export type { Workflow, WorkflowConnection, WorkflowStep }

export type WorkflowCanvasRef = object

interface WorkflowCanvasProps {
  workflow?: Workflow
  onWorkflowChange?: (workflow: Workflow) => void
  onStepSelect?: (step: WorkflowStep | null) => void
}

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
    },
  }))

  const edges: Edge[] = workflow.connections.map((conn) => ({
    id: conn.id,
    source: conn.from,
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
  const steps: WorkflowStep[] = nodes.map((node) => {
    const step = node.data.step as Step
    return {
      id: node.id,
      step: {
        id: step.id,
        name: step.name,
        description: step.description,
        endpointId:
          step.endpoint?.["@id"] || step.endpoint?.id || step.endpointId,
      },
      position: node.position,
    }
  })

  const connections: WorkflowConnection[] = edges.map((edge) => ({
    id: edge.id,
    from: edge.source,
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
    const onWorkflowChangeRef = useRef(onWorkflowChange)
    const workflowRef = useRef(workflow)

    useEffect(() => {
      onWorkflowChangeRef.current = onWorkflowChange
      workflowRef.current = workflow
    })

    useEffect(() => {
      if (onWorkflowChangeRef.current) {
        const updatedWorkflow = reactFlowToWorkflow(
          nodes,
          edges,
          workflowRef.current
        )
        console.log("Workflow update - edges:", edges)
        console.log(
          "Workflow update - connections:",
          updatedWorkflow.connections
        )
        onWorkflowChangeRef.current(updatedWorkflow)
      }
    }, [nodes, edges])

    useImperativeHandle(ref, () => ({}))

    const isValidConnection = useCallback((connection: Connection | Edge) => {
      const source = "source" in connection ? connection.source : null
      const target = "target" in connection ? connection.target : null
      return source !== target
    }, [])

    const onConnect = useCallback(
      (params: Connection) => {
        setEdges((eds) => {
          const newEdge = {
            id: uuidv4(),
            source: params.source!,
            target: params.target!,
            type: "smoothstep",
          }
          const newEdges = [...eds, newEdge]
          return newEdges
        })
      },
      [setEdges]
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
          endpointId: endpoint.id,
        }

        const newNode: Node = {
          id: uuidv4(),
          type: "stepNode",
          position,
          data: {
            step,
          },
        }

        setNodes((nds) => {
          const updated = [...nds, newNode]
          return updated
        })
      },
      [rfInstance, setNodes]
    )

    const handleNodeClick = useCallback(
      (_: React.MouseEvent, node: Node) => {
        if (onStepSelect) {
          const workflowStep: WorkflowStep = {
            id: node.id,
            step: node.data.step as Step,
            position: node.position,
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
      },
      [onNodesChange]
    )

    const handleEdgesChange = useCallback(
      (changes: EdgeChange[]) => {
        onEdgesChange(changes)
      },
      [onEdgesChange]
    )

    return (
      <div ref={reactFlowWrapper} className="h-full flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
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
          connectionLineType={ConnectionLineType.SmoothStep}
          proOptions={{ hideAttribution: true }}
          connectionMode={ConnectionMode.Loose}
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
