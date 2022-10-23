import {getInstance, Ref} from './instances.js';

type InternalRefData<T> = {
  ref?: Ref<T>,
};

export function useRef<T>(initialValue?: T): Ref<T> {
  const instance = getInstance();
  const data: InternalRefData<T> = instance._getHookData();

  if (!data.hasOwnProperty('ref')) {
    data.ref = {
      current: initialValue,
    };
  }

  return data.ref;
}