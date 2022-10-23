import {useState} from './useState';

function startTransition(setState, callback) {
  setState(true);
  setTimeout(callback, 0);
}

export function useTransition(): [boolean, (callback: Function) => void] {
  const [state, setState] = useState(false);
  return [state, (callback: Function) => startTransition(setState ,callback)];
}