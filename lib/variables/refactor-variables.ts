/**
 * Replace variable references in a string value
 */
export function replaceVariableInString(text: string, oldName: string, newName: string): string {
  const regex = new RegExp(`\\{\\{${oldName}\\}\\}`, "g");
  return text.replace(regex, `{{${newName}}}`);
}

/**
 * Replace variable references in an object (recursively)
 */
export function replaceVariableInObject(obj: unknown, oldName: string, newName: string): unknown {
  if (typeof obj === "string") {
    return replaceVariableInString(obj, oldName, newName);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceVariableInObject(item, oldName, newName));
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariableInObject(value, oldName, newName);
    }
    return result;
  }

  return obj;
}

/**
 * Check if a variable is used in an object
 */
export function isVariableUsedInObject(obj: unknown, variableName: string): boolean {
  if (typeof obj === "string") {
    return obj.includes(`{{${variableName}}}`);
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => isVariableUsedInObject(item, variableName));
  }

  if (obj !== null && typeof obj === "object") {
    return Object.values(obj).some((value) => isVariableUsedInObject(value, variableName));
  }

  return false;
}

/**
 * Find all steps that use a specific variable
 */
export function findStepsUsingVariable(
  steps: Array<{
    id: string;
    name: string;
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    header: Record<string, unknown>;
  }>,
  variableName: string
): Array<{ id: string; name: string; locations: string[] }> {
  const result: Array<{ id: string; name: string; locations: string[] }> = [];

  for (const step of steps) {
    const locations: string[] = [];

    if (isVariableUsedInObject(step.body, variableName)) {
      locations.push("body");
    }
    if (isVariableUsedInObject(step.query, variableName)) {
      locations.push("query");
    }
    if (isVariableUsedInObject(step.header, variableName)) {
      locations.push("header");
    }

    if (locations.length > 0) {
      result.push({
        id: step.id,
        name: step.name,
        locations,
      });
    }
  }

  return result;
}
