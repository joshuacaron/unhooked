import {Options} from './lib/options.js';
import {_componentCreator} from './lib/componentCreator.js';

export {useCallback} from './lib/useCallback.js';
export {useRef} from './lib/useRef.js';
export {useState} from './lib/useState.js';
export {useReducer, useObjectReducer} from './lib/useReducer.js';
export {useEffect, useLayoutEffect} from './lib/useEffect.js';
export {useMemo} from './lib/useMemo.js';

export function unhooked<T>(render: (data: T, root: HTMLElement | ShadowRoot) => void, defaultOptions?: Options) {
  return _componentCreator<T>((instance, data, userOptions) => {
    let target: HTMLElement | ShadowRoot = instance;
    const options = {
      useShadowDOM: true,
      ...(defaultOptions || {}),
      ...(userOptions || {}),
    };

    if (options && options.useShadowDOM) {
      target = instance.shadowRoot || instance.attachShadow({
        mode: 'open',
      });
    }

    render(data, target);
  });
}