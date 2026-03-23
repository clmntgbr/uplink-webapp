export type NodeCategory = 'trigger' | 'action' | 'condition' | 'delay' | 'loop' | 'subprocess';

export interface NodeTypeDefinition {
  type: NodeCategory;
  label: string;
  description: string;
  icon: string;
}

export const NODE_TYPES: NodeTypeDefinition[] = [
  { type: 'trigger', label: 'Trigger', description: 'Starts the workflow', icon: 'Zap' },
  { type: 'action', label: 'Action', description: 'Performs a task', icon: 'Play' },
  { type: 'condition', label: 'Conditional', description: 'Branches by logic', icon: 'GitBranch' },
  { type: 'delay', label: 'Delay', description: 'Waits before continuing', icon: 'Clock' },
  { type: 'loop', label: 'Loop', description: 'Repeats a set of steps', icon: 'Repeat' },
  { type: 'subprocess', label: 'Sub-process', description: 'Runs a nested flow', icon: 'Layers' },
];

export type OutputConditionType = 'status_code' | 'equals' | 'contains' | 'timeout' | 'default';

export const CONDITION_TYPES: { value: OutputConditionType; label: string }[] = [
  { value: 'status_code', label: 'Status Code' },
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'default', label: 'Default' },
];

export type OutputOperator = '=' | '!=' | '>' | '<' | '>=' | '<=';

export const OPERATORS: { value: OutputOperator; label: string }[] = [
  { value: '=', label: '=' },
  { value: '!=', label: '≠' },
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '≥' },
  { value: '<=', label: '≤' },
];

/** Named output port on a node */
export interface OutputPort {
  id: string;
  label: string;
  conditionType: OutputConditionType;
  operator?: OutputOperator;
  value?: string;
}
