import {getInstance} from './instances.js';

export type Updater<T> = (previous: T) => T;
export type NextState<T> = T |  Updater<T>;
export type SetStateFn<T> = (nextState: NextState<T>) => void;
export type InitialState<T> = T | (() => T);

type InternalStateData<T> = {
  state?: T,
  setState?: SetStateFn<T>,
};

export function useState<T>(initialState?: InitialState<T>): [T, SetStateFn<T>] {
  const instance = getInstance();
  const data: InternalStateData<T> = instance._getHookData();

  if (!data.hasOwnProperty('state')) {
    if (initialState instanceof Function) {
      data.state = initialState();
    } else {
      data.state = initialState;
    }

    data.setState = (nextState: NextState<T>) => {
      if (nextState instanceof Function) {
        data.state = nextState(data.state);
      } else {
        data.state = nextState;
      }

      instance._update();
    }
  }

  return [data.state, data.setState];
}