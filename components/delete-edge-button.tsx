import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react"
import { Trash2 } from "lucide-react"

type PersistGraph = (nodes: Node[], edges: Edge[]) => void

type DeleteEdgeButtonProps = EdgeProps & {
  onPersistGraph?: PersistGraph
}

export default function DeleteEdgeButton({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  onPersistGraph,
}: DeleteEdgeButtonProps) {
  const { setEdges, getNodes } = useReactFlow()
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const onEdgeClick = () => {
    console.log("[workflow canvas] connection removed (trash button)", {
      edgeId: id,
      from: source,
      to: target,
    })
    setEdges((edges) => {
      const next = edges.filter((edge) => edge.id !== id)
      onPersistGraph?.(getNodes(), next)
      return next
    })
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="hover:text-destructive-foreground flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100"
            onClick={onEdgeClick}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
