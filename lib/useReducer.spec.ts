import test, {ExecutionContext} from 'ava';
import {useReducer, useObjectReducer, Reducer} from './useReducer';
import {setupInstance} from './_testSetup';
import {createAction} from './createAction';

test('it should initialize the state to the initialState parameter if specified', t => {
  setupInstance(t);

  const [stateV1] = useReducer(x => x, 1);
  const [stateV2] = useReducer(x => x, 2);

  t.is(stateV1, 1);
  t.is(stateV2, 1);
});

test('it should initialize the state to undefined it not passed in', t => {
  setupInstance(t);

  const [stateV1] = useReducer(x => x);
  const [stateV2] = useReducer(x => x, 10);

  t.is(stateV1, undefined);
  t.is(stateV2, undefined);
});

test('it should return a persistent reference', t => {
  setupInstance(t);

  const value = {};

  const [stateV1, dispatchV1] = useReducer(x => x, value);
  const [stateV2, dispatchV2] = useReducer(x => x);

  t.is(stateV1, value);
  t.is(stateV2, value);
  t.is(dispatchV2, dispatchV1);
});

test('it should update the component on dispatch', t => {
  const instance = setupInstance(t);

  t.is(instance.updateCount, 0);

  const [stateV1, dispatch] = useReducer(x => x + 1, 0);

  t.is(stateV1, 0);

  dispatch({type: 'test', payload: null});
  t.is(instance.updateCount, 1);

  const [stateV2] = useReducer<number>(x => x + 1);

  t.is(stateV2, 1);
  t.is(instance.updateCount, 1);
});

test('it should update the reducer function if changed between calls', t => {
  setupInstance(t);

  const [stateV1, dispatch] = useReducer(x => x + 1, 0);
  t.is(stateV1, 0);

  dispatch({type: 'test', payload: null});

  const [stateV2] = useReducer<number>(x => x * 10);
  t.is(stateV2, 1);

  dispatch({type: 'test', payload: null});

  const [stateV3] = useReducer<number>(x => x * 10);

  t.is(stateV3, 10);
});

test('it should match objects based on the action key', t => {
  setupInstance(t);

  const type = 'TEST';
  const handlers = {
    [type]: (state, action) => ({
      ...state,
      value: action.payload,
    }),
  };
  const initialState = {
    value: 1,
  };

  const [stateV1, dispatch] = useObjectReducer(handlers, initialState);

  t.is(stateV1.value, 1);

  dispatch({
    type,
    payload: 5,
  });

  const [stateV2] = useObjectReducer(handlers, initialState);

  t.is(stateV1.value, 1);
  t.is(stateV2.value, 5);

  dispatch({
    type: 'OTHER',
    payload: null,
  });

  const [stateV3] = useObjectReducer(handlers, initialState);

  t.is(stateV3, stateV2);
});

test('it should filter properly using the match method', (t: ExecutionContext) => {
  setupInstance(t);

  const append = createAction<number>('append');
  const prepend = createAction<number>('prepend');
  const replace = createAction<number[]>('replace');

  const reducer: Reducer<number[]> = (state, action) => {
    // payload properly should be properly typed in Typescript
    if (append.match(action)) {
      return [...state, action.payload];
    }

    if (prepend.match(action)) {
      return [action.payload, ...state];
    }

    if (replace.match(action)) {
      return action.payload;
    }
  }

  let [state, dispatch] = useReducer<number[]>(reducer, [1]);
  t.deepEqual(state, [1]);

  dispatch(append(5));
  [state, dispatch] = useReducer<number[]>(reducer, [1]);
  t.deepEqual(state, [1, 5]);

  dispatch(prepend(7));
  [state, dispatch] = useReducer<number[]>(reducer, [1]);
  t.deepEqual(state, [7, 1, 5]);

  dispatch(replace([1, 2, 3]));
  [state, dispatch] = useReducer<number[]>(reducer, [1]);
  t.deepEqual(state, [1, 2, 3]);
});

test('it should support lazy initialization of the initial state', (t: ExecutionContext) => {
  setupInstance(t);

  let timesInitialized = 0;

  const reducer: Reducer<number> = (state, action) => state + action.payload;
  const initialState = () => {
    timesInitialized += 1;
    return Math.pow(10, 2);
  };

  t.is(timesInitialized, 0);
  let [state, dispatch] = useReducer(reducer, initialState);

  t.is(timesInitialized, 1);
  t.is(state, 100);

  dispatch({payload: 10});
  [state, dispatch] = useReducer(reducer, initialState);

  t.is(timesInitialized, 1);
  t.is(state, 110);
});

test('it should support lazy initialization with an argument', (t: ExecutionContext) => {
  setupInstance(t);

  let timesInitialized = 0;

  const reducer: Reducer<number> = (state, action) => state + action.payload;
  const initialState = (arg: string) => {
    timesInitialized += 1;
    return arg.length;
  };

  t.is(timesInitialized, 0);
  let [state, dispatch] = useReducer(reducer, initialState, 'hello world');

  t.is(timesInitialized, 1);
  t.is(state, 11);

  dispatch({payload: 10});
  [state, dispatch] = useReducer(reducer, initialState, 'test');

  t.is(timesInitialized, 1);
  t.is(state, 21);
});