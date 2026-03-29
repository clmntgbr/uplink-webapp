import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react"
import { Trash2 } from "lucide-react"

export default function DeleteEdgeButton({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id))
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
