export interface Ref<T> {
  current: T | undefined,
}

export interface HookData {
  [key: string]: any,
}

export type Callback = () => void;

export interface UnhookedComponent extends HTMLElement {
  _getHookData(): HookData,
  _update(): void,
  _postRender(fn: Callback, isSynchronous: boolean): void,
}

let _instance: Ref<UnhookedComponent> = {
  current: undefined,
};

export function getInstance(): UnhookedComponent | undefined {
  return _instance.current;
}

export function exposeInstance(instance: UnhookedComponent): void {
  _instance.current = instance;
}