"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CONDITION_TYPES,
  OPERATORS,
  OutputPort,
  type OutputConditionType,
  type OutputOperator,
} from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface OutputsEditorProps {
  outputs: OutputPort[]
  onChange: (outputs: OutputPort[]) => void
}

export function OutputsEditor({ outputs, onChange }: OutputsEditorProps) {
  const [editingOutputs, setEditingOutputs] = useState<OutputPort[]>(outputs)

  const handleAddOutput = () => {
    const newOutput: OutputPort = {
      id: `output-${Date.now()}`,
      label: "New Output",
      conditionType: "status_code",
      operator: "=",
      value: "200",
    }
    const updated = [...editingOutputs, newOutput]
    setEditingOutputs(updated)
    onChange(updated)
  }

  const handleRemoveOutput = (index: number) => {
    const updated = editingOutputs.filter((_, i) => i !== index)
    setEditingOutputs(updated)
    onChange(updated)
  }

  const handleUpdateOutput = (
    index: number,
    field: keyof OutputPort,
    value: string
  ) => {
    const updated = editingOutputs.map((output, i) =>
      i === index ? { ...output, [field]: value } : output
    )
    setEditingOutputs(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Conditional Outputs</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddOutput}
          className="h-7 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Output
        </Button>
      </div>

      <div className="space-y-2">
        {editingOutputs.map((output, index) => (
          <div
            key={output.id}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Output {index + 1}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveOutput(index)}
                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor={`label-${index}`} className="text-xs">
                  Label
                </Label>
                <Input
                  id={`label-${index}`}
                  value={output.label}
                  onChange={(e) =>
                    handleUpdateOutput(index, "label", e.target.value)
                  }
                  className="h-8 text-xs"
                  placeholder="e.g., Success"
                />
              </div>

              <div>
                <Label htmlFor={`condition-${index}`} className="text-xs">
                  Condition Type
                </Label>
                <Select
                  value={output.conditionType}
                  onValueChange={(value) =>
                    handleUpdateOutput(
                      index,
                      "conditionType",
                      value as OutputConditionType
                    )
                  }
                >
                  <SelectTrigger id={`condition-${index}`} className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value} className="text-xs">
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {output.conditionType !== "timeout" &&
                output.conditionType !== "default" && (
                  <>
                    <div>
                      <Label htmlFor={`operator-${index}`} className="text-xs">
                        Operator
                      </Label>
                      <Select
                        value={output.operator || "="}
                        onValueChange={(value) =>
                          handleUpdateOutput(
                            index,
                            "operator",
                            value as OutputOperator
                          )
                        }
                      >
                        <SelectTrigger id={`operator-${index}`} className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map((op) => (
                            <SelectItem key={op.value} value={op.value} className="text-xs">
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`value-${index}`} className="text-xs">
                        Value
                      </Label>
                      <Input
                        id={`value-${index}`}
                        value={output.value || ""}
                        onChange={(e) =>
                          handleUpdateOutput(index, "value", e.target.value)
                        }
                        className="h-8 text-xs"
                        placeholder="e.g., 200"
                      />
                    </div>
                  </>
                )}
            </div>
          </div>
        ))}

        {editingOutputs.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">
            No outputs defined. Click &quot;Add Output&quot; to create conditional
            branches.
          </p>
        )}
      </div>
    </div>
  )
}
