import test from 'ava';
import {useReducer, useObjectReducer} from './useReducer.js';
import {setupInstance} from './_testSetup.js';

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

  dispatch();
  t.is(instance.updateCount, 1);

  const [stateV2] = useReducer<number>(x => x + 1);

  t.is(stateV2, 1);
  t.is(instance.updateCount, 1);
});

test('it should update the reducer function if changed between calls', t => {
  setupInstance(t);

  const [stateV1, dispatch] = useReducer(x => x + 1, 0);
  t.is(stateV1, 0);

  dispatch();

  const [stateV2] = useReducer<number>(x => x * 10);
  t.is(stateV2, 1);

  dispatch();

  const [stateV3] = useReducer<number>(x => x * 10);

  t.is(stateV3, 10);
});

test('it should match objects based on the action key', t => {
  setupInstance(t);

  const type = 'TEST';
  const handlers = {
    [type]: (state, action) => ({
      ...state,
      value: action.value,
    }),
  };
  const initialState = {
    value: 1,
  };

  const [stateV1, dispatch] = useObjectReducer(handlers, initialState);

  t.is(stateV1.value, 1);

  dispatch({
    type,
    value: 5,
  });

  const [stateV2] = useObjectReducer(handlers, initialState);

  t.is(stateV1.value, 1);
  t.is(stateV2.value, 5);

  dispatch({
    type: 'OTHER',
  });

  const [stateV3] = useObjectReducer(handlers, initialState);

  t.is(stateV3, stateV2);
});