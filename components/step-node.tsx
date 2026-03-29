import { GetMethodColor } from "@/lib/method-color"
import type { Step } from "@/lib/step/types"
import { cn } from "@/lib/utils"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { memo } from "react"
import { Badge } from "./ui/badge"
import { Card, CardHeader, CardTitle } from "./ui/card"

function StepNode({ data, selected }: NodeProps) {
  const step = data.step as Step
  const index = data.index as string | undefined

  return (
    <div className="group">
      <Card
        size="sm"
        className={cn(
          "w-full transition-all",
          selected && "py-3 shadow-lg ring-1 ring-primary"
        )}
        style={{
          minWidth: "500px",
        }}
      >
        <div className="flex flex-row items-center gap-3 px-3">
          <Badge
            variant="outline"
            className={cn(GetMethodColor(step.endpoint?.method))}
          >
            {step.endpoint?.method}
          </Badge>
          <CardHeader className="min-w-0 flex-1 gap-0 py-0 group-data-[size=sm]/card:px-0">
            <CardTitle className="truncate text-base font-semibold">
              {step.name}
            </CardTitle>
          </CardHeader>
          <code className="ml-auto inline-block max-w-[150px] shrink-0 truncate rounded bg-accent px-1.5 py-0.5 font-mono text-xs text-accent-foreground">
            {step.endpoint?.path}
          </code>
        </div>
      </Card>

      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="-top-1!"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="-bottom-1!"
        isConnectable={true}
      />
    </div>
  )
}

export default memo(StepNode)
