import test from 'ava';
import {setupInstance} from './_testSetup';
import {useEffect} from './useEffect';

test('it should run the cleanup function on subsequent renders', t => {
  const component = setupInstance(t);

  let didCleanup = false;
  function callback() {
    return () => {
      didCleanup = true;
    };
  }

  useEffect(callback, [1]);
  component._render();

  t.is(didCleanup, false);

  useEffect(callback, [2]);
  component._render();

  t.is(didCleanup, true);
});

test('it should run the effect', t => {
  const component = setupInstance(t);

  let didRun = false;
  function callback() {
    didRun = true;
  }

  useEffect(callback, []);
  component._render();

  t.is(didRun, true);
});


test('it should run the cleanup function on unmount', t => {
  const component = setupInstance(t);

  let didCleanup = false;
  let didRun = false;
  function callback() {
    didRun = true;
    return () => {
      didCleanup = true;
    };
  }

  useEffect(callback, []);
  component._render();

  t.is(didRun, true);
  t.is(didCleanup, false);

  component.disconnectedCallback();

  t.is(didCleanup, true);
});

test('it should use the inputs array to handle renders properly', t => {
  let component = setupInstance(t);

  let renderCount = 0;
  let cleanupCount = 0;

  function callback() {
    renderCount += 1;
    return () => {
      cleanupCount += 1;
    };
  }

  // only on mount & unmount
  useEffect(callback, []);
  component._render();

  t.is(renderCount, 1);
  t.is(cleanupCount, 0);

  useEffect(callback, []);
  component._render();

  t.is(renderCount, 1);
  t.is(cleanupCount, 0);

  renderCount = 0;
  cleanupCount = 0;
  component = setupInstance(t);

  // on every render
  for (let i = 0; i < 1; ++i) {
    useEffect(callback);
    component._render();

    t.is(renderCount, i + 1);
    t.is(cleanupCount, i);
  }

  renderCount = 0;
  cleanupCount = 0;
  component = setupInstance(t);

  // on input change
  useEffect(callback, [1]);
  component._render();

  t.is(renderCount, 1);
  t.is(cleanupCount, 0);

  useEffect(callback, [2]);
  component._render();

  t.is(renderCount, 2);
  t.is(cleanupCount, 1);

  useEffect(callback, [2]);
  component._render();

  t.is(renderCount, 2);
  t.is(cleanupCount, 1);
});
