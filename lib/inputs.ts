import {HookData} from './instances.js';

export type Input = any;

export function shouldRun(data: HookData, inputs: Input[]) {
  const shouldRun = inputs === undefined || !data.inputs || data.inputs.some((input, i) => input !== inputs[i]);

  data.inputs = inputs;
  return shouldRun;
}