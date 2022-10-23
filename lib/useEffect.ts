import {Callback, getInstance} from './instances.js';
import {Input, shouldRun} from './inputs.js';

type EffectFn = () => void | Callback;

function createEffectHook(isSynchronous: boolean): ((callback: EffectFn, inputs?: Input[]) => void) {
  return (callback: EffectFn, inputs?: Input[]) => {
    const instance = getInstance();
    const data = instance._getHookData();

    if (!shouldRun(data, inputs)) {
      return;
    }

    data.callback = callback;

    if (data.cleanup && typeof data.cleanup === 'function') {
      data.cleanup();
      data.cleanup = undefined;
    }

    instance._postRender(() => {
      data.cleanup = data.callback();
    }, isSynchronous);
  };
}

export const useEffect = createEffectHook(false);
export const useLayoutEffect = createEffectHook(true);