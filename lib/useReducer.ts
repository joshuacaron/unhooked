import {getInstance} from './instances.js';

export interface Action {
  type: string,
  [key: string]: any,
}

export function useReducer<T>(reducer: (state: T, action: Action) => T, initialState?: T): [T, (action?: Action) => void] {
  const instance = getInstance();
  const data = instance._getHookData();

  data.reducer = reducer;

  if (!data.hasOwnProperty('state')) {
    data.state = initialState;
    data.dispatch = (action: Action) => {
      data.state = data.reducer(data.state, action);
      instance._update();
    };
  }

  return [data.state, data.dispatch];
}


export function useObjectReducer<T>(handlers: {[type: string]: (state: T, action: Action) => T}, initialState?: T): [T, (action?: Action) => void] {
  const instance = getInstance();
  const data = instance._getHookData();

  data.handlers = handlers;

  if (!data.hasOwnProperty('state')) {
    data.state = initialState;
    data.dispatch = (action: Action) => {
      if (data.handlers.hasOwnProperty(action.type)) {
        data.state = data.handlers[action.type](data.state, action);
      }
      instance._update();
    };
  }

  return [data.state, data.dispatch];
}