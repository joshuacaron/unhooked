import test from 'ava';
import {createAction} from './createAction.js';

test('it should return a function', t => {
  const increment = createAction('unhooked/increment');

  t.is(typeof(increment), 'function');
});

test('it should return the name when calling toString', t => {
  const increment = createAction('unhooked/increment');

  t.is(increment.toString(), 'unhooked/increment');
});

test('it should return an object with type as name, and payload as the argument', t => {
  const increment = createAction('unhooked/increment');

  const action = increment(5);

  t.is(action.payload, 5);
  t.is(action.type, 'unhooked/increment');
});

test('it should customize the payload if specifying a prepare function', t => {
  const increment = createAction('unhooked/increment', value => ({payload: value * 2}));
  const action = increment(5);

  t.is(action.payload, 10);
  t.is(action.type, 'unhooked/increment');
});

test('it should call toString when used as the key in an object', t => {
  const increment = createAction('unhooked/increment');
  const reduce = (state, action) => state + action.payload;

  const reducer = {
    // @ts-ignore
    [increment]: reduce,
  };

  const expected = {
    'unhooked/increment': reduce,
  };

  t.deepEqual(reducer, expected);
})