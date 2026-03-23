import { GetMethodColor } from "@/lib/method-color"
import type { Step } from "@/lib/step/types"
import type { OutputPort } from "@/lib/types"
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

const CONDITION_COLORS: Record<string, string> = {
  status_code: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  equals: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  contains: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  timeout: "bg-rose-500/15 text-rose-600 border-rose-500/20",
  default: "bg-muted text-muted-foreground border-border",
}

function formatPortLabel(port: OutputPort): string {
  if (port.conditionType === "timeout") return "⏱ Timeout"
  if (port.conditionType === "default") return "↓ Default"
  const op = port.operator || "="
  return `${port.value || "?"} ${op === "=" ? "" : op}`.trim()
}

function StepNode({ data, selected }: NodeProps) {
  const step = data.step as Step
  const outputs = (data.outputs as OutputPort[] | undefined) || []

  return (
    <div className="group">
      <Card
        size="sm"
        className={cn(
          "w-full transition-all",
          selected && "py-3 shadow-lg ring-2 ring-primary"
        )}
        style={{
          minWidth:
            outputs.length > 2 ? `${outputs.length * 90 + 40}px` : "300px",
        }}
      >
        <div className="flex flex-row items-center px-3">
          <CardContent
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-md p-0 " +
                GetMethodColor(step.endpoint.method)
            )}
          >
            <p className="font-bold" style={{ fontSize: "10px" }}>
              {step.endpoint.method}
            </p>
          </CardContent>
          <CardHeader className="flex-1 gap-0 p-0">
            <CardTitle className="text-base font-semibold">
              {step.name}
            </CardTitle>
            <CardDescription className="truncate text-xs">
              {step.description}
            </CardDescription>
          </CardHeader>
        </div>

        {outputs.length > 0 && (
          <div className="px-3 pt-2">
            <div className="flex gap-1">
              {outputs.map((port) => (
                <div
                  key={port.id}
                  className={`flex-1 rounded border px-1.5 py-1 text-center text-[10px] ${CONDITION_COLORS[port.conditionType] || CONDITION_COLORS.default}`}
                >
                  <div className="mb-0.5 text-[8px] tracking-wider uppercase opacity-60">
                    {port.conditionType === "status_code"
                      ? "Status"
                      : port.conditionType}
                  </div>
                  <div className="font-medium">{formatPortLabel(port)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Handle type="target" position={Position.Top} className="-top-1!" />

      {outputs.length > 0 ? (
        outputs.map((port, i) => {
          const total = outputs.length
          const pct = total === 1 ? 50 : (i / (total - 1)) * 80 + 10
          return (
            <Handle
              key={port.id}
              type="source"
              position={Position.Bottom}
              id={port.id}
              style={{ left: `${pct}%` }}
              className="-bottom-1!"
            />
          )
        })
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="-bottom-1!"
        />
      )}
    </div>
  )
}

export default memo(StepNode)
