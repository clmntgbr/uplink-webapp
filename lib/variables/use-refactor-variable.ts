"use client";

import { Step } from "@/lib/step/types";
import { findStepsUsingVariable, replaceVariableInObject } from "@/lib/variables/refactor-variables";
import { useState } from "react";

interface RefactorVariableOptions {
  oldName: string;
  newName: string;
  currentStepId: string;
  steps: Step[];
  onUpdateStep: (stepId: string, updates: Partial<Step>) => Promise<void>;
}

interface RefactorResult {
  success: boolean;
  updatedSteps: number;
  error?: string;
}

export function useRefactorVariable() {
  const [isRefactoring, setIsRefactoring] = useState(false);

  const refactorVariable = async ({
    oldName,
    newName,
    currentStepId,
    steps,
    onUpdateStep,
  }: RefactorVariableOptions): Promise<RefactorResult> => {
    setIsRefactoring(true);

    try {
      // Find all steps that use this variable (after the current step)
      const currentStepPosition = steps.find((s) => s.id === currentStepId)?.position ?? 0;
      const subsequentSteps = steps.filter((s) => s.position > currentStepPosition);
      const affectedSteps = findStepsUsingVariable(subsequentSteps, oldName);

      if (affectedSteps.length === 0) {
        setIsRefactoring(false);
        return { success: true, updatedSteps: 0 };
      }

      // Update all affected steps
      const updatePromises = affectedSteps.map(async (affected) => {
        const step = steps.find((s) => s.id === affected.id);
        if (!step) return;

        const updates: Partial<Step> = {};

        if (affected.locations.includes("body")) {
          updates.body = replaceVariableInObject(step.body, oldName, newName) as Record<string, unknown>;
        }

        if (affected.locations.includes("query")) {
          updates.query = replaceVariableInObject(step.query, oldName, newName) as Record<string, unknown>;
        }

        if (affected.locations.includes("header")) {
          updates.header = replaceVariableInObject(step.header, oldName, newName) as Record<string, unknown>;
        }

        await onUpdateStep(step.id, updates);
      });

      await Promise.all(updatePromises);

      setIsRefactoring(false);
      return { success: true, updatedSteps: affectedSteps.length };
    } catch (error) {
      setIsRefactoring(false);
      return {
        success: false,
        updatedSteps: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const checkVariableUsage = (variableName: string, currentStepId: string, steps: Step[]) => {
    const currentStepPosition = steps.find((s) => s.id === currentStepId)?.position ?? 0;
    const subsequentSteps = steps.filter((s) => s.position > currentStepPosition);
    return findStepsUsingVariable(subsequentSteps, variableName);
  };

  return {
    refactorVariable,
    checkVariableUsage,
    isRefactoring,
  };
}
