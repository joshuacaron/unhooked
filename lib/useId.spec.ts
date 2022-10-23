import test, {ExecutionContext} from 'ava';
import {setupInstance} from './_testSetup';
import {useId} from './useId';

test('it should create unique ids for each separate hook', (t: ExecutionContext) => {
  setupInstance(t);

  let id1 = useId();
  let alsoId1 = useId();

  // should be stable on calls within the same hook
  t.true(id1 === alsoId1);

  // new component shouldn't reuse
  setupInstance(t);
  const id2 = useId();
  const alsoId2 = useId();

  t.true(id2 === alsoId2);
  t.false(id1 === id2);

  // should be one digit off
  let numberRegex = /-([0-9]+)$/;
  let counter1 = parseInt(id1.match(numberRegex)[1]);
  let counter2 = parseInt(id2.match(numberRegex)[1]);

  t.is(counter2, counter1 + 1);
});
