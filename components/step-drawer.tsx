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
import { useStep } from "@/lib/step/context"
import { stepSchema } from "@/lib/step/schema"
import type { Step } from "@/lib/step/types"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { Field, FieldDescription, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof stepSchema>>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      name: step?.name,
      description: step?.description,
    },
  })

  const onSubmit = async (data: z.infer<typeof stepSchema>) => {
    if (!step) return
    setIsLoading(true)
    await updateStep(step.id, {
      ...data,
      id: step.id,
      workflowId,
      description: data.description,
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
    if (isOpen) {
      reset({
        name: step?.name,
        description: step?.description,
      })
    }
  }, [isOpen, step?.name, step?.description, reset])

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full flex-col">
        <DrawerHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DrawerTitle>{step?.name}</DrawerTitle>
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
