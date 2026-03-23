import { Step } from "@/lib/step/types";
import { Workflow } from "@/lib/workflow/types";
import { useMemo } from "react";

export interface VariableSource {
  name: string;
  stepId?: string;
  stepPosition?: number;
  stepName?: string;
  source: "workflow" | "step";
}

export interface VariableCollision {
  variableName: string;
  sources: VariableSource[];
}

export function useVariables(workflow: Workflow | null, steps: Step[], currentStepPosition?: number) {
  const allVariables = useMemo(() => {
    const variables: VariableSource[] = [];

    if (workflow?.variables) {
      Object.keys(workflow.variables).forEach((name) => {
        variables.push({
          name,
          source: "workflow",
        });
      });
    }

    steps.forEach((step) => {
      if (step.setVariables) {
        Object.keys(step.setVariables).forEach((name) => {
          variables.push({
            name,
            stepId: step.id,
            stepPosition: step.position,
            stepName: step.name,
            source: "step",
          });
        });
      }
    });

    return variables;
  }, [workflow, steps]);

  const availableVariables = useMemo(() => {
    if (currentStepPosition === undefined) {
      return allVariables;
    }

    return allVariables.filter((v) => {
      if (v.source === "workflow") return true;
      if (v.stepPosition === undefined) return true;
      return v.stepPosition < currentStepPosition;
    });
  }, [allVariables, currentStepPosition]);

  const collisions = useMemo(() => {
    const collisionMap = new Map<string, VariableSource[]>();

    allVariables.forEach((variable) => {
      const existing = collisionMap.get(variable.name);
      if (existing) {
        existing.push(variable);
      } else {
        collisionMap.set(variable.name, [variable]);
      }
    });

    const result: VariableCollision[] = [];
    collisionMap.forEach((sources, variableName) => {
      if (sources.length > 1) {
        result.push({ variableName, sources });
      }
    });

    return result;
  }, [allVariables]);

  const checkVariableCollision = (variableName: string, excludeStepId?: string): VariableCollision | null => {
    const sources = allVariables.filter((v) => v.name === variableName && v.stepId !== excludeStepId);

    if (sources.length > 0) {
      return { variableName, sources };
    }

    return null;
  };

  const suggestVariableName = (baseName: string, excludeStepId?: string): string => {
    const existingNames = new Set(allVariables.filter((v) => v.stepId !== excludeStepId).map((v) => v.name));

    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let counter = 1;
    while (existingNames.has(`${baseName}_${counter}`)) {
      counter++;
    }

    return `${baseName}_${counter}`;
  };

  const extractVariablesFromString = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((match) => match[1].trim());
  };

  return {
    allVariables,
    availableVariables,
    collisions,
    checkVariableCollision,
    suggestVariableName,
    extractVariablesFromString,
  };
}
