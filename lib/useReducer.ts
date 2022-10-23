import {getInstance} from './instances.js';
import {ActionCreator, Action} from './createAction';

export type Dispatch = (action: Action<any>) => void;
export type Reducer<T> = (state: T, action: Action<any>) => T;
export type ReducerHandlers<T> = {
  [key: string]: Reducer<T>,
};

export function useReducer<T>(reducer: Reducer<T>, initialState?: T): [T, Dispatch] {
  const instance = getInstance();
  const data = instance._getHookData();

  data.reducer = reducer;

  if (!data.hasOwnProperty('state')) {
    data.state = initialState;
    data.dispatch = (action: Action<any>) => {
      data.state = data.reducer(data.state, action);
      instance._update();
    };
  }

  return [data.state, data.dispatch];
}

export function useObjectReducer<T>(handlers: ReducerHandlers<T>, initialState?: T): [T, Dispatch] {
  const instance = getInstance();
  const data = instance._getHookData();

  data.handlers = handlers;

  if (!data.hasOwnProperty('state')) {
    data.state = initialState;
    data.dispatch = (action: Action<any>) => {
      if (data.handlers.hasOwnProperty(action.type)) {
        data.state = data.handlers[action.type](data.state, action);
      }
      instance._update();
    };
  }

  return [data.state, data.dispatch];
}