export type Action<T> = {
  type: string,
  payload: T,
};

type ActionMatcher<T> = (action: Action<any>) => action is Action<T>;

export type ActionCreator<T> = {
  (payload: T): Action<T>,
  toString: () => string,
  match: ActionMatcher<T>,
}

export function createAction<T>(name: string, prepare?: (T) => {payload: any}): ActionCreator<T> {
  const actionCreator = (payload: T) => {
    let action = {type: name, payload};

    if (prepare && typeof prepare === 'function') {
      action = Object.assign({type: name}, prepare(payload));
    }

    return action;
  };

  actionCreator.toString = () => name;

  actionCreator.match = (action: Action<any>): action is Action<T> => action.type === name;

  return actionCreator;
}