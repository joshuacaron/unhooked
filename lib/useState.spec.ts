import test, {ExecutionContext} from 'ava';
import {useState} from './useState';
import {setupInstance} from './_testSetup';

test('it should initialize the state to the initial value if present', (t: ExecutionContext) => {
  setupInstance(t);

  const [state, setState] = useState(5);

  t.is(state, 5);
});

test('it should initialize the state to undefined if not present', (t: ExecutionContext) => {
  setupInstance(t);

  const [stateV1, setStateV1] = useState();
  const [stateV2, setStateV2] = useState(5);

  t.is(stateV1, undefined);
  t.is(stateV2, undefined);

  t.is(setStateV2, setStateV1);
});

test('it should update the component on state change', (t: ExecutionContext) => {
  const instance = setupInstance(t);

  const [state, setState] = useState(1);

  t.is(instance.updateCount, 0);
  t.is(state, 1);

  setState(2);

  t.is(instance.updateCount, 1);
  const [stateV2, setStateV2] = useState(1);
  t.is(instance.updateCount, 1);
  t.is(stateV2, 2);
});

test('it should return the same instance on multiple calls if not changed', (t: ExecutionContext) => {
  setupInstance(t);

  const value = {};

  const [stateV1, setStateV1] = useState(value);
  const [stateV2, setStateV2] = useState();

  t.is(stateV1, value);
  t.is(stateV2, stateV1);

  t.is(setStateV2, setStateV1);
});

test('it should support using update functions', (t: ExecutionContext) => {
  const instance = setupInstance(t);

  let [state, setState] = useState(1);

  t.is(state, 1);

  // function variant works
  setState(current => current + 5);
  [state, setState] = useState(1);

  t.is(state, 6);

  // works on subsequent calls
  setState(current => current + 5);
  [state, setState] = useState(1);

  t.is(state, 11);

  // can intermingle with non function variant
  setState(-1);
  [state, setState] = useState(1);

  t.is(state, -1);
});

test('it should support lazy initialization of the initial state', (t: ExecutionContext) => {
  setupInstance(t);

  let timesInitialized = 0;
  let initialState = () => {
    timesInitialized += 1;
    return 'hello world';
  }

  t.is(timesInitialized, 0);

  let [state, setState] = useState<string>(initialState);

  t.is(timesInitialized, 1);
  t.is(state, 'hello world');

  setState('goodbye');
  [state, setState] = useState<string>(initialState);

  t.is(timesInitialized, 1);
  t.is(state, 'goodbye');
});