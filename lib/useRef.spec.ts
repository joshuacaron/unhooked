import test from 'ava';
import {useRef} from './useRef';
import {setupInstance} from './_testSetup';

test('it should not trigger rerenders', t => {
  const instance = setupInstance(t);

  t.is(0, instance.updateCount);

  const ref = useRef(2);

  ref.current = 3;

  useRef(0);

  t.is(0, instance.updateCount);
});

test('it should not change the value on subsequent function calls', t => {
  setupInstance(t);

  const ref = useRef(1);
  const ref2 = useRef(2);
  const ref3 = useRef(3);

  t.assert(ref === ref2 && ref2 === ref3);
  t.is(ref.current, 1);
  t.is(ref2.current, 1);
  t.is(ref3.current, 1);
});

test('it should update the value on changes to .current', t => {
  setupInstance(t);

  const ref = useRef(0);

  t.is(ref.current, 0);

  ref.current = 1;

  t.is(ref.current, 1);

  const ref2 = useRef(10);

  t.is(ref.current, 1);
  t.is(ref2.current, 1);

  ref2.current = 5;

  t.is(ref.current, 5);
  t.is(ref2.current, 5);
});