import type { Endpoint } from "@/lib/endpoint/types"
import type { Step } from "@/lib/step/types"
import { useWorkflow } from "@/lib/workflow/context"
import type {
  Workflow,
  WorkflowConnection,
  WorkflowStep,
} from "@/lib/workflow/types"
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeProps,
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
  useMemo,
  useRef,
  useState,
} from "react"
import { v4 as uuidv4 } from "uuid"
import DeleteEdgeButton from "./delete-edge-button"
import StepNode from "./step-node"

const nodeTypes = { stepNode: StepNode }

export type { Workflow, WorkflowConnection, WorkflowStep }

export type WorkflowCanvasRef = object

interface WorkflowCanvasProps {
  workflow?: Workflow
  onWorkflowChange?: (workflow: Workflow) => void
  onStepSelect?: (step: WorkflowStep | null) => void
  onSave?: (workflow: Workflow) => void | Promise<void>
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
      step: {
        id: workflowStep.id,
        name: workflowStep.name,
        description: workflowStep.description,
        endpointId: workflowStep.endpointId,
        endpoint: workflowStep.endpoint,
      },
      index: workflowStep.index,
      onEditClick: undefined,
    },
  }))

  const edges: Edge[] = workflow.connections.map((conn) => ({
    id: conn.id,
    source: conn.from,
    target: conn.to,
    type: "default",
    markerEnd: { type: MarkerType.ArrowClosed },
  }))

  return { nodes, edges }
}

function calculateStepIndexes(
  nodes: Node[],
  edges: Edge[]
): Map<string, string> {
  const indexMap = new Map<string, string>()

  const incomingEdges = new Map<string, string[]>()
  edges.forEach((edge) => {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, [])
    }
    incomingEdges.get(edge.target)!.push(edge.source)
  })

  const rootNodes = nodes.filter(
    (node) =>
      !incomingEdges.has(node.id) || incomingEdges.get(node.id)!.length === 0
  )

  const queue: Array<{ nodeId: string; index: string }> = rootNodes.map(
    (node, i) => ({
      nodeId: node.id,
      index: String(i + 1),
    })
  )

  const visited = new Set<string>()

  while (queue.length > 0) {
    const { nodeId, index } = queue.shift()!

    if (visited.has(nodeId)) continue
    visited.add(nodeId)

    indexMap.set(nodeId, index)

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId)

    if (outgoingEdges.length === 1) {
      const targetId = outgoingEdges[0].target
      const baseIndex = Math.floor(Number.parseFloat(index))
      queue.push({ nodeId: targetId, index: String(baseIndex + 1) })
    } else if (outgoingEdges.length > 1) {
      outgoingEdges.forEach((edge, i) => {
        const baseIndex = Math.floor(Number.parseFloat(index))
        const subIndex = `${baseIndex + 1}.${i + 1}`
        queue.push({ nodeId: edge.target, index: subIndex })
      })
    }
  }

  return indexMap
}

function reactFlowToWorkflow(
  nodes: Node[],
  edges: Edge[],
  currentWorkflow?: Workflow
): Workflow {
  const indexMap = calculateStepIndexes(nodes, edges)

  const steps: WorkflowStep[] = nodes.map((node) => {
    const step = node.data.step as Step
    return {
      id: node.id,
      name: step.name,
      description: step.description,
      endpointId: step.endpoint?.id,
      endpoint: step.endpoint,
      position: node.position,
      index: indexMap.get(node.id) || "0",
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
  function WorkflowCanvas(
    { workflow, onWorkflowChange, onStepSelect, onSave },
    ref
  ) {
    const { addConnection } = useWorkflow()
    const initialState = workflowToReactFlow(workflow)
    const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes)
    const [edges] = useEdgesState(initialState.edges)
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)
    const onWorkflowChangeRef = useRef(onWorkflowChange)
    const workflowRef = useRef(workflow)
    const onSaveRef = useRef(onSave)
    const prevStepsRef = useRef<string>("")

    useEffect(() => {
      onWorkflowChangeRef.current = onWorkflowChange
      workflowRef.current = workflow
      onSaveRef.current = onSave
    })

    useEffect(() => {
      if (!workflow?.steps) return

      const stepsDataJson = JSON.stringify(
        workflow.steps.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          endpoint: s.endpoint,
        }))
      )

      if (stepsDataJson === prevStepsRef.current) return
      prevStepsRef.current = stepsDataJson

      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          const workflowStep = workflow.steps?.find((s) => s.id === node.id)
          if (workflowStep && node.data.step) {
            return {
              ...node,
              data: {
                ...node.data,
                step: {
                  ...(node.data.step as Step),
                  name: workflowStep.name,
                  description: workflowStep.description,
                  endpoint: workflowStep.endpoint,
                  endpointId: workflowStep.endpointId,
                },
              },
            }
          }
          return node
        })
      )
    }, [workflow?.steps, setNodes])

    useEffect(() => {
      if (onWorkflowChangeRef.current) {
        const updatedWorkflow = reactFlowToWorkflow(
          nodes,
          edges,
          workflowRef.current
        )

        onWorkflowChangeRef.current(updatedWorkflow)
      }
    }, [nodes, edges])

    const handleEditClick = useCallback(
      (node: Node) => {
        if (onStepSelect) {
          const step = node.data.step as Step
          const indexMap = calculateStepIndexes(nodes, edges)
          const workflowStep: WorkflowStep = {
            id: node.id,
            name: step.name,
            description: step.description,
            endpointId: step.endpoint?.id,
            endpoint: step.endpoint,
            position: node.position,
            index: indexMap.get(node.id) || "0",
          }
          onStepSelect(workflowStep)
        }
      },
      [onStepSelect, nodes, edges]
    )

    const nodesWithIndexes = nodes.map((node) => {
      const indexMap = calculateStepIndexes(nodes, edges)
      return {
        ...node,
        data: {
          ...node.data,
          index: indexMap.get(node.id) || "0",
          onEditClick: () => handleEditClick(node),
        },
      }
    })

    useImperativeHandle(ref, () => ({}))

    const saveGraphSnapshot = useCallback(
      (nextNodes: Node[], nextEdges: Edge[]) => {
        const wf = reactFlowToWorkflow(
          nextNodes,
          nextEdges,
          workflowRef.current
        )
        const save = onSaveRef.current
        if (!save || !wf.id) return
        void Promise.resolve(save(wf)).catch((err) =>
          console.error("[workflow canvas] failed to save workflow", err)
        )
      },
      []
    )

    const edgeTypes = useMemo(
      () => ({
        default: (props: EdgeProps) => (
          <DeleteEdgeButton {...props} onPersistGraph={saveGraphSnapshot} />
        ),
      }),
      [saveGraphSnapshot]
    )

    const isValidConnection = useCallback((connection: Connection | Edge) => {
      const source = "source" in connection ? connection.source : null
      const target = "target" in connection ? connection.target : null
      return source !== target
    }, [])

    const onConnect = useCallback(
      (params: Connection) => {
        if (!workflow?.id) return
        addConnection({
          workflowId: workflow?.id,
          from: params.source!,
          to: params.target!,
        })
      },
      [addConnection, workflow?.id]
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
          position,
        }

        const newNode: Node = {
          id: uuidv4(),
          type: "stepNode",
          position,
          data: {
            step,
          },
        }

        console.log("[workflow canvas] step added from library", {
          stepId: newNode.id,
          endpointId: endpoint.id,
          name: endpoint.name,
          position,
        })

        setNodes((nds) => {
          const updated = [...nds, newNode]
          saveGraphSnapshot(updated, edges)
          return updated
        })
      },
      [rfInstance, setNodes, edges, saveGraphSnapshot]
    )

    const handlePaneClick = useCallback(() => {
      if (onStepSelect) {
        onStepSelect(null)
      }
    }, [onStepSelect])

    const handleNodesChange = useCallback(
      (changes: NodeChange[]) => {
        let shouldSave = false
        for (const change of changes) {
          if (change.type === "position" && change.dragging === false) {
            console.log("[workflow canvas] step moved", {
              stepId: change.id,
              position: change.position,
            })
            shouldSave = true
          } else if (change.type === "remove") {
            console.log("[workflow canvas] step removed", { stepId: change.id })
            shouldSave = true
          }
        }
        if (shouldSave) {
          const nextNodes = applyNodeChanges(changes, nodes)
          saveGraphSnapshot(nextNodes, edges)
        }
        onNodesChange(changes)
      },
      [onNodesChange, nodes, edges, saveGraphSnapshot]
    )

    return (
      <div ref={reactFlowWrapper} className="h-full flex-1">
        <ReactFlow
          nodes={nodesWithIndexes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[5, 5]}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          elementsSelectable={true}
          nodesConnectable={true}
          nodesDraggable={true}
          edgesFocusable={true}
          edgesReconnectable={false}
          defaultEdgeOptions={{
            type: "default",
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
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
