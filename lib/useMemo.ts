import {Input, shouldRun} from './inputs.js';
import {getInstance} from './instances.js';

export function useMemo<T>(create: () => T, inputs?: Input[]) {
  const instance = getInstance();
  const data = instance._getHookData();

  if (!shouldRun(data, inputs)) {
    return data.memo;
  }

  data.memo = create();
  return data.memo;
}