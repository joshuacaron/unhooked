import test from 'ava';
import {setupInstance} from './_testSetup.js';
import {useCallback} from './useCallback.js';

test('it should return a fixed reference to a function if no inputs are specified', t => {
  setupInstance(t);

  const f = x => x;
  const g = x => x;

  t.not(f, g);

  const result1 = useCallback(f);
  const result2 = useCallback(g);
  const result3 = useCallback(f);

  t.is(result1, f);
  t.is(result2, g);
  t.is(result3, f);
});

test('it should not update the reference if inputs is empty', t => {
  setupInstance(t);

  const f = x => x;
  const g = x => x;

  const result1 = useCallback(f, []);
  const result2 = useCallback(g, []);

  t.is(result1, f);
  t.is(result2, f);
});