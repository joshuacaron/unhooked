import {Input, shouldRun} from './inputs.js';
import {getInstance} from './instances.js';

type InternalMemoData<T> = {
  memo?: T,
  inputs?: Input[],
};

export function useMemo<T>(create: () => T, inputs?: Input[]) {
  const instance = getInstance();
  const data: InternalMemoData<T> = instance._getHookData();

  if (!shouldRun(data, inputs)) {
    return data.memo;
  }

  data.memo = create();
  return data.memo;
}