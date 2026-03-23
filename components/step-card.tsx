import { GetMethodColor } from "@/lib/method-color"
import { Step } from "@/lib/step/types"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

interface StepCardProps {
  step: Step
}

export function StepCard({ step }: StepCardProps) {
  return (
    <Card
      size="sm"
      className="mx-auto w-full max-w-sm flex-row items-center gap-4 px-4"
    >
      <CardContent
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-md font-bold",
          GetMethodColor(step.endpoint.method)
        )}
      >
        <p>{step.endpoint.method}</p>
      </CardContent>
      <CardHeader className="flex-1 gap-0">
        <CardTitle className="text-lg font-semibold">{step.name}</CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
