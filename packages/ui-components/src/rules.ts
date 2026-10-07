import { Style } from '@heliks/tiles-ui';


export type StylesheetRule = Partial<Style>;

const RULES = new Map<string, StylesheetRule>();

export function setRule(id: string, rule: StylesheetRule): void {
  RULES.set(id, rule);
}

export function getRule(id: string): StylesheetRule | undefined {
  return RULES.get(id)
}

export function clearRules(): void {
  RULES.clear();
}




