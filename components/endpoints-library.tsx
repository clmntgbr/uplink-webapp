"use client"

import { useEndpoint } from "@/lib/endpoint/context"
import type { Endpoint } from "@/lib/endpoint/types"
import { GetMethodColor } from "@/lib/method-color"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"

export default function EndpointsLibrary() {
  const { endpoints } = useEndpoint()

  const onDragStart = (event: React.DragEvent, endpoint: Endpoint) => {
    event.dataTransfer.setData(
      "application/workflow-endpoint",
      JSON.stringify(endpoint)
    )
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <aside className="bg-chrome-bg flex h-full w-72 flex-col border-r border-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Endpoint Library
        </h2>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {endpoints.members.map((endpoint) => (
          <div
            key={endpoint.id}
            draggable
            onDragStart={(e) => onDragStart(e, endpoint)}
            className="group flex cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-all duration-100 select-none hover:border-border hover:bg-background active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded text-[8px] font-bold " +
                  GetMethodColor(endpoint.method)
              )}
            >
              {endpoint.method}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {endpoint.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {endpoint.baseUri}
                {endpoint.path}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] text-muted-foreground">
          Drag endpoints onto the canvas to build your workflow.
        </p>
      </div>
    </aside>
  )
}
