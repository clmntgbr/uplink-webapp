import { GetMethodColor } from "@/lib/method-color"
import type { Step } from "@/lib/step/types"
import { cn } from "@/lib/utils"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { memo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

function StepNode({ data, selected }: NodeProps) {
  const step = data.step as Step

  return (
    <div className="group">
      <Card
        size="sm"
        className={cn(
          "w-full transition-all",
          selected && "py-3 shadow-lg ring-2 ring-primary"
        )}
        style={{
          minWidth: "300px",
        }}
      >
        <div className="flex flex-row items-center px-3">
          <CardContent
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-md p-0 " +
                GetMethodColor(step.endpoint?.method || "GET")
            )}
          >
            <p className="font-bold" style={{ fontSize: "10px" }}>
              {step.endpoint?.method || "GET"}
            </p>
          </CardContent>
          <CardHeader className="flex-1 gap-0 p-0">
            <CardTitle className="truncate text-base font-semibold">
              {step.name}
            </CardTitle>
            <CardDescription className="truncate text-xs">
              {step.description}
            </CardDescription>
          </CardHeader>
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
