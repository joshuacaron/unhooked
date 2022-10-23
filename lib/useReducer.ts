import {getInstance} from './instances.js';
import {Action} from './createAction';

export type Dispatch = (action: Action<any>) => void;
export type Reducer<T> = (state: T, action: Action<any>) => T;
export type ReducerHandlers<T> = {
  [key: string]: Reducer<T>,
};

type ReducerInternalData<T> = {
  reducer?: Reducer<T>,
  state?: T,
  dispatch?: Dispatch,
};

export function useReducer<T>(reducer: Reducer<T>, initialState?: T);
export function useReducer<T, S>(reducer: Reducer<T>, initialState: (S) => T, initialArg?: S);
export function useReducer<T, S>(reducer: Reducer<T>, initialState?: (T | ((S) => T)), initialArg?: S): [T, Dispatch] {
  const instance = getInstance();
  const data: ReducerInternalData<T> = instance._getHookData();

  data.reducer = reducer;

  if (!data.hasOwnProperty('state')) {
    if (initialState instanceof Function) {
      data.state = initialState(initialArg);
    } else {
      data.state = initialState;
    }
    data.dispatch = (action: Action<any>) => {
      data.state = data.reducer(data.state, action);
      instance._update();
    };
  }

  return [data.state, data.dispatch];
}

export function useObjectReducer<T>(handlers: ReducerHandlers<T>, initialState?: T): [T, Dispatch] {
  return useReducer<T>((state, action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }

    return state;
  }, initialState);
}