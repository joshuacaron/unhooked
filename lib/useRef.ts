import {getInstance, Ref} from './instances.js';

export function useRef<T>(initialValue?: T): Ref<T> {
  const instance = getInstance();
  const data = instance._getHookData();

  if (!data.hasOwnProperty('ref')) {
    data.ref = {
      current: initialValue,
    };
  }

  return data.ref;
}