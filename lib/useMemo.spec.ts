import test from 'ava';
import {setupInstance} from './_testSetup';
import {useMemo} from './useMemo';

test(`it should call create every time if there's no inputs`, t => {
  setupInstance(t);

  let called = 0;
  let create = () => {
    called += 1;
    return called;
  };

  const result1 = useMemo(create);
  const result2 = useMemo(create);

  t.is(result1, 1);
  t.is(result2,2);
});

test(`it should not call create again if inputs is empty`, t => {
  setupInstance(t);

  let called = 0;
  let create = () => {
    called += 1;
    return called;
  };

  const result1 = useMemo(create, []);
  const result2 = useMemo(create, []);

  t.is(result1, 1);
  t.is(result2, 1);
});

test(`it should not call create again if inputs doesn't change`, t => {
  setupInstance(t);

  let called = 0;
  let create = () => {
    called += 1;
    return called;
  };

  const inputs = [1, {}];

  const result1 = useMemo(create, [...inputs]);
  const result2 = useMemo(create, [...inputs]);

  t.is(result1, 1);
  t.is(result2, 1);
});

test(`it should call create again if inputs changes`, t => {
  setupInstance(t);

  let called = 0;
  let create = () => {
    called += 1;
    return called;
  };

  const result1 = useMemo(create, [1, {}]);
  const result2 = useMemo(create, [1, {}]);
  const result3 = useMemo(create, [2, {}]);

  t.is(result1, 1);
  t.is(result2, 2);
  t.is(result3, 3);
});
