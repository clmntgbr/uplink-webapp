"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useEndpoint } from "@/lib/endpoint/context"
import { GetMethodColor } from "@/lib/method-color"
import { useStep } from "@/lib/step/context"
import { stepSchema } from "@/lib/step/schema"
import type { Step } from "@/lib/step/types"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { LinkIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { Badge } from "./ui/badge"
import { Field, FieldDescription, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface StepDrawerProps {
  step: Step | null
  workflowId: string | undefined
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function StepDrawer({
  step,
  workflowId,
  isOpen,
  onOpenChange,
  onUpdate,
}: StepDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateStep } = useStep()
  const { endpoints } = useEndpoint()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof stepSchema>>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      name: step?.name,
      description: step?.description,
      endpointId: step?.endpointId,
    },
  })

  const onSubmit = async (data: z.infer<typeof stepSchema>) => {
    if (!step) return
    setIsLoading(true)
    await updateStep(step.id, {
      ...data,
      id: step.id,
      workflowId,
      endpointId: data.endpointId,
    })
    setIsLoading(false)
    onUpdate()
    onClose()
  }

  const onClose = () => {
    reset()
    onOpenChange(false)
  }

  useEffect(() => {
    if (isOpen && step) {
      reset({
        name: step.name,
        description: step.description,
        endpointId: step.endpointId,
      })
    }
  }, [isOpen, step, reset])

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full w-[35vw]! max-w-[35vw]! flex-col">
        <DrawerHeader className="mb-4 shrink-0 border-b">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DrawerTitle className="flex items-center gap-3">
                <LinkIcon className="size-10 rounded-full bg-primary p-2 text-primary-foreground" />
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold">{step?.name}</span>
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    {step?.description}
                  </span>
                </div>
              </DrawerTitle>
            </div>
          </div>
        </DrawerHeader>
        <form
          id="step-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-4">
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel
                  htmlFor="input-field-name"
                  className={cn(errors.name && "text-destructive")}
                >
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="input-field-name"
                  type="text"
                  required
                  {...register("name")}
                  placeholder="Enter the step name"
                />
                <FieldDescription>The name of the step.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="input-field-name"
                  className={cn(errors.description && "text-destructive")}
                >
                  Description <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="input-field-description"
                  type="text"
                  required
                  {...register("description")}
                  placeholder="Enter the step description"
                />
                <FieldDescription>The name of the step.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="input-field-endpoint"
                  className={cn(errors.endpointId && "text-destructive")}
                >
                  Endpoint <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  name="endpointId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        {endpoints.members.map((endpoint) => (
                          <SelectItem key={endpoint.id} value={endpoint.id}>
                            <span className="flex flex-row items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(GetMethodColor(endpoint.method))}
                              >
                                {endpoint.method}
                              </Badge>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-foreground">
                                  {endpoint.name}
                                </p>
                              </div>
                              <code className="ml-auto inline-block max-w-[150px] shrink-0 truncate rounded bg-accent px-1.5 py-0.5 font-mono text-xs text-accent-foreground">
                                {endpoint.path}
                              </code>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>The endpoint for this step.</FieldDescription>
              </Field>
            </div>
          </div>
          <DrawerFooter className="mt-auto shrink-0 border-t">
            <Button
              className="w-full"
              variant="default"
              type="submit"
              disabled={isLoading}
            >
              Update
            </Button>
            <DrawerClose asChild onClick={onClose}>
              <Button className="w-full" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
