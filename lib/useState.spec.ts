import test from 'ava';
import {useState} from './useState.js';
import {setupInstance} from './_testSetup.js';

test('it should initialize the state to the initial value if present', t => {
  setupInstance(t);

  const [state, setState] = useState(5);

  t.is(state, 5);
});

test('it should initialize the state to undefined if not present', t => {
  setupInstance(t);

  const [stateV1, setStateV1] = useState();
  const [stateV2, setStateV2] = useState(5);

  t.is(stateV1, undefined);
  t.is(stateV2, undefined);

  t.is(setStateV2, setStateV1);
});

test('it should update the component on state change', t => {
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

test('it should return the same instance on multiple calls if not changed', t => {
  setupInstance(t);

  const value = {};

  const [stateV1, setStateV1] = useState(value);
  const [stateV2, setStateV2] = useState();

  t.is(stateV1, value);
  t.is(stateV2, stateV1);

  t.is(setStateV2, setStateV1);
});