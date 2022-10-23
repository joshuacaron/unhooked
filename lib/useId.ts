import {useMemo} from './useMemo';

// TODO: configurable prefixes
let prefix = 'unhooked-';
let counter = 0;

export function useId(): string {
  return useMemo<string>(() => `${prefix}-${counter++}`, []);
}