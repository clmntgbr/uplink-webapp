import { GetMethodColor } from "@/lib/method-color"
import type { Step } from "@/lib/step/types"
import { cn } from "@/lib/utils"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { SquarePenIcon } from "lucide-react"
import { memo } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

function StepNode({ data, selected }: NodeProps) {
  const step = data.step as Step
  const onEditClick = data.onEditClick as (() => void) | undefined

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEditClick?.()
  }

  return (
    <div className="group">
      <Card
        size="sm"
        className={cn(
          "w-auto transition-all",
          selected && "py-3 shadow-lg ring-1 ring-primary"
        )}
      >
        <div className="flex flex-row items-center px-3">
          <Badge
            variant="outline"
            className={cn(GetMethodColor(step.endpoint?.method))}
          >
            {step.endpoint?.method}
          </Badge>
          <div className="flex min-w-0 flex-1 flex-col gap-0 pl-3">
            <p className="truncate text-base font-semibold">{step.name}</p>
            <code className="inline-block w-fit truncate rounded bg-accent px-1.5 py-0.5 font-mono text-xs text-accent-foreground">
              {step.endpoint?.path}
            </code>
          </div>
          <div className="flex items-center justify-center pl-9">
            <Button variant="outline" size="icon" onClick={handleEditClick}>
              <SquarePenIcon />
            </Button>
          </div>
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
