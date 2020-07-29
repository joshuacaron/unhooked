import {getInstance} from './instances.js';

export function useState<T>(initialState?: T): [T, (nextState: T) => void] {
  const instance = getInstance();
  const data = instance._getHookData();

  if (!data.hasOwnProperty('state')) {
    data.state = initialState;
    data.setState = (nextState: T) => {
      data.state = nextState;
      instance._update();
    }
  }

  return [data.state, data.setState];
}