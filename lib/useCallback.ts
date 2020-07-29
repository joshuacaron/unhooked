import {Input} from './inputs.js';
import {useMemo} from './useMemo.js';

export function useCallback(callback: Function, inputs?: Input[]) {
  return useMemo(() => callback, inputs);
}