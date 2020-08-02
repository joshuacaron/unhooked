export function createAction<T>(name: string, prepare?: (T) => {payload: any}): (T) => ({type: string, payload: any}) {
  const actionCreator = (payload: T) => {
    let action = {type: name, payload};

    if (prepare && typeof prepare === 'function') {
      action = Object.assign({type: name}, prepare(payload));
    }

    return action;
  };

  actionCreator.toString = () => name;

  return actionCreator;
}