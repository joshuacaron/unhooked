# unhooked

A simple library for using React.js-inspired hooks in web components.

It is intended to be used with [lit-html](https://lit-html.polymer-project.org/) or other similar rendering engines,
but it is agnostic of your choice of rendering engines.

This is very similar to [haunted](https://github.com/matthewp/haunted) which is an excellent library. See the section
below on prior art for the design differences between the two libraries if you're unsure which to use.


## API

unhooked has a named export for `unhooked` to set up the library, as well as one for each hook.

NOTE: hooks follow the same [rules](https://reactjs.org/docs/hooks-rules.html) as in React. The order they're
called in cannot change, so you should use them inside if statements or other conditional logic.

All React hooks are supported except for the following:

`useImperativeHandle` from React is not defined here since it doesn't make a lot of sense in the context of web
components. When defining functions with the `function` keyword (rather than ES2015 arrow syntax), `this` is bound to
the HTMLElement instance of the web component. Use can use this directly in the hook, or use it in a `useEffect` hook
if needed to customize the interface of the web component.

`useContext` is not currently defined, but will be added in the future.


### `unhooked(renderFunction, options?)`

Sets up and returns a custom wrapper for `customElements.define` that wraps functions into classes extending HTMLElement
 and applies any default options from the optional parameters.

This should be global and defined in one spot in your application and exported for use in all your components.

The `renderFunction` parameter should be a function that takes the return value of your functional component as the
first parameter, and the DOM node to render it to as the second parameter.

Examples:

    // using lit-html
    import {render} from 'lit-html';
    import {unhooked} from 'unhooked';

    export const defineElement = unhooked(render);


    // without a rendering library -- not recommended!
    import {unhooked} from 'unhooked';

    export const defineElement = unhooked((html, domNode) => domNode.innerHTML = html);

The optional `options` parameter defines the default options to apply to all components. If not specified the defaults
are:

    {
      useShadowDOM: true
    }

The returned function takes the name of the web component, the function of the component, and an optional options
parameter to override the defaults above.

Example:

    // web-components.js
    import {render, html} from 'lit-html';
    import {unhooked} from 'unhooked';

    export const defineElement = unhooked(render, {useShadowDOM: false});


    // my-component.js
    import {defineElement} from './web-components.js';

    function MyComponent() {
      return html`<p>Hello World!</p>`;
    }

    defineElement('my-component', MyComponent, {useShadowDOM: true});


### Properties and Attributes

unhooked uses essentially the same api to define the mapping between properties and attributes of the web component as
[lit-element](https://lit-element.polymer-project.org/guide/properties).

Specifying a `.properties` object on a functional component setups up the mapping between properties and attributes.
The `.properties` object should have property names as keys, and property config objects as values.
Any handled properties are exposed as parameters in the function itself, and trigger updates when changed.

Specify `attribute: false` to turn off mapping attributes to properties, or `attribute: othername` to customize the
mapping of a differently named attribute to the property. 

Specify `type: String | Number | Boolean | Object | Array` to define the default type conversions between
attributes and properties. Objects and arrays are serialized/deserialized with json by default.

Specify `hasChanged: (oldValue, newValue) => boolean` to override the default changed checking for whether or not
to re-render and update when the value changes. By default this is compared by reference e.g. `oldValue !== newValue`.

Specify `reflect: true` to enable mapping changes to properties back to attributes. This is not as useful as in
lit-element since your state should probably be stored in hooks, but is included for compatability with lit-element
and niche uses that might use this.

Specify `noAccessor: true` to prevent creating getters and setters for the property on the component.

Specify `converter: (value: string, type): instance of type` (from attribute to property only) or
`converter: {fromAttribute: (value, type) => instance of type, toAttribute: (value, type) => string value}` to customize
the default conversions to/from attributes.

See the [lit-element documentation on properties](https://lit-element.polymer-project.org/guide/properties) for more
information on all of these config options.

For simple use-cases it's enough to just specify the `type` option.

Example:

    // my-component.js
    import {defineElement} from './web-components.js';
    import {html} from 'lit-html';
    
    // value is mapped from a string to an Array
    function MyComponent({value}) {
        return html`
            <p>Length: ${value.length}</p>
            <p>Items: ${value.join(', ')}<p>
        `;
    }
    
    MyComponent.properties = {
        value: {
            // Uses JSON.parse to convert from string attribute to array property
            type: Array,
        },
    };
    
    defineElement('my-component, MyComponent);
    
    
    // index.html
    ...
    <my-component value="[1, 2, 3]"></my-component>


### `useState` hook

`const [state, setState] = useState(initialState?)`

Keeps track of some state, and provides a function to update it. If specified the `initialState` is set
as the value on the first render only. Calling setState updates the value and re-renders the component.

See [React docs](https://reactjs.org/docs/hooks-reference.html#usestate) for more information.

Example:

    import {useState} from 'unhooked';
    import {html} from 'lit-html';
    
    function TestStateHook() {
        const [state, setState] = useState(0);
    
        return html`
            <button @click=${() => setState(state + 1)}>{state}</button>
        `;
    }


### `useRef` hook

`const ref = useRef(initialValue?)`

Keeps track of a mutable reference. Any changes do not cause a rerender. Not used for accessing component instances
like in React, since with web components you have access to the dom directly (`this` in non-arrow functional
components is bound to the instance of the HTMLElement for the component).

See [React docs](https://reactjs.org/docs/hooks-reference.html#useref) for more information.

Example:

    import {useRef} from 'unhooked';
    import {html} from 'lit-html';
    
    function TestRefHook() {
        const ref = useRef();
        
        const onClick = () => {
            if (ref.current) {
                // Already running setTimeout
                return;
            }
            
            ref.current = setTimeout(() => {
                window.alert('hello world!');
                ref.current = null;
            }, 1000);
        };
        
        return html`<button @click=${onClick}>Click me</button>`
    }


### `useReducer` hook

`const [state, dispatch] = useReducer(reducer, initialState?)`

Tracks state and applies to apply the next value of state from the current one.

See [React docs](https://reactjs.org/docs/hooks-reference.html#usereducer) for more information.

Example:

    import {useReducer} from 'unhooked';
    import {html} from 'lit-html';
    
    function ReducerHookTest() {
        const [state, dispatch] = useReducer((state, action) => state + action, 0);
        
        const onClick = () => {
            dispatch(state < 5 ? 1 : 2);
        };
        
        return html`<button @click=${onClick}>${state}</button>`;
    }


### `useObjectReducer` hook

A common use of the `useReducer` hook is for redux-style reducers where the argument of the dispatch function is an 
object with a `type` value indicated the type of the action, and the reducer function switches over those to decide
how to update the state.

To ease this common use-case we also provide a `useObjectReducer` hook which works similarly to the `createReducer`
function in the [redux-toolkit](https://redux-toolkit.js.org/api/createReducer) but with the argument order switched
around to match that of the `useReducer` hook.

Example:

    import {useObjectReducer} from 'unhooked';
    import {html} from 'lit-html';
    
    function ObjectReducerHookTest() {
        const [state, dispatch] = useObjectReducer({
            increment: (state, action) => ({
                ...state,
                value: state.value + action.payload,
            }),
            decrement: (state, action) => ({
                ...state,
                value: state.value - action.payload,
            }),
            setUnit: (state, action) => ({
                ...state,
                unit: action.payload,
            }),
        }, {
            value: 0,
            unit: 1,
        );
        
        return html`
            <p>Current value: ${state.value}</p>
            
            <label>
                Current unit:
                <input type="number" @change=${e => dispatch({type: 'setUnit', payload: parseInt(e.target.value)} .value=${state.unit}></input>
            </label>
            
            <button @click=${() => dispatch({type: 'increment', payload: 1})}>increment</button>
            <button @click=${() => dispatch({type: 'decrement', payload: 1})}>decrement</button>
        `;
    }
    

### `createAction`

`const actionCreator = createAction(name, prepareFunction?)`

We also export a `createAction` function similar to [this one](https://redux-toolkit.js.org/api/createAction) from
the redux toolkit to ease setup and creation of actions for use in redux-style reducers.

The first parameter is the name of the action, which gets exposed as `action.type`. The action creator itself also
return the name when calling `toString()` so that it can be used directly as the key in an object reducer.

The second parameter is an optional function to customize the payload. It receives any arguments to the action creator
and should return an object with a payload property.

Example:

    import {createAction} from 'unhooked';
    import {html} from 'lit-html';
    
    const increment = createAction('unhooked/increment');
    const decrement = createAction('unhooked/decrement');
    
    function CreateActionTest() {
        const [state, dispatch] = useObjectReducer({
            [increment]: (state, action) => state + action.payload,
            [decrement]: (state, action) => state - action.payload,
        }, 5);
        
        return html`
            <p>Current value: ${state}</p>
            <button @click=${() => dispatch(increment(1))}>increment</button>
            <button @click=${() => dispatch(decrement(1))}>decrement</button>
        `;
    }


### `useEffect` and `useLayoutEffect` hooks

`useEffect(callback, inputs?)`

The `useEffect` hook (and the `useLayoutEffect` variant) execute a function after rendering the component.
`useLayoutEffect` executes synchronously immediately after rendering, and the `useEffect` executes asynchronously
after rendering. You should use `useEffect` unless you explicitly need the timing guarantees of `useLayoutEffect`.

The second parameter of both hooks is an optional array of values to compare. If those values haven't changed, the
callback is skipped. The values are compared by reference. To only run a function on first mount pass `[]` as the inputs
argument.

For more information see the React docs for [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)
and [useLayoutEffect](https://reactjs.org/docs/hooks-reference.html#uselayouteffect).

Example:

    import {useEffect} from 'unhooked';
    import {html} from 'lit-html';
    
    function EffectHookTest() {
        useEffect(() => {
            console.log('just rendered!);
        }, []);
        
        return html`<p>hello world</p>`;
    }

    
### `useCallback` hook

`const callback = useCallback(fn, inputs?)`

The `useCallback` hook returns a persistent reference to a function unless the input arguments change. This is
helpful for good performance with event listeners and stuff where they might not need to change every render. NOTE: how
useful this hook is depends on the rendering engine you're using though.

The `inputs` optional parameter works as specified above in the `useEffect` hook documentation. If you don't specify
the inputs, the function will get redefined each render and so the hook does nothing.

See [React docs](https://reactjs.org/docs/hooks-reference.html#usecallback) for more information.

Example:

    import {useCallback} from 'unhooked';
    import {html} from 'lit-html';
    
    function CallbackHookTest() {
        // function never changes; always a consistent reference
        const onClick = useCallback(() => console.log('was clicked'), []);
        
        return <button @click=${onClick}>click me</button>
    }


### `useMemo` hook

`const value = useMemo(fn, inputs?)`

The `useMemo` hook works similarly to the `useCallback` hook except it executes the function instead of just capturing
the value of it. This is useful for expensive to calculate values that don't necessarily change every render.

See [React docs](https://reactjs.org/docs/hooks-reference.html#usememo) for more information.

Example:

    import {useMemo, useState, useReducer} from 'unhooked';
    import {html} from 'lit-html';
    
    function MemoHookTest() {
        const [value, setValue] = useState(1);
        const absValue = useMemo(() => Math.abs(value), [value]);
        
        // Forces a rerender; absValue not recalculated
        const [, forceUpdate] = useReducer(v => v + 1, 0);
        
        return html`
            <input type="number" .value=${value} @change=${e => setValue(parseFloat(e.target.value))} placeholder="Value:" />
            <p>Absolute value: ${absValue}</p>
            <button @click=${forceUpdate}>Force update</button>
        `;
    }


## Prior Art

This is very similar to [haunted](https://github.com/matthewp/haunted) which is an excellent library
for using hooks in web components. If that library meets your needs, you should definitely consider using it
as it has been around longer and has many more users.

unhooked also takes inspiration from [lit-element](https://lit-element.polymer-project.org/) for the mapping
from attributes to properties which is excellent, and [React](https://reactjs.org/) for hooks.

However there are a couple of things this library addresses that make it a better fit for some use-cases
that haunted doesn't apply to:

1. IE11 support -- unhooked is written with language features that can be used in all major browsers including IE11
and easily transpiled (for class support). haunted uses features of ES2015 proxies that aren't supported in
the polyfills so it doesn't work in IE11 at all (at least I couldn't configure the polyfills to get it working, your
experience might vary).

2. Shadow DOM -- similarly not using shadow dom makes it significantly easier to use support older browsers such as IE11,
so unhooked allows global opt in/out of using shadow dom rather than having to configure it on every component

3. Rendering engines -- unhooked works across all rendering engines and doesn't bundle one as part of
the library. Most existing projects will have something for this already, so by packaging a rendering engine in,
 you risk duplicating the library and increasing the size of the bundle or creating runtime errors with incompatible
 features that aren't exported and might not work in all versions of the library.

4. Type conversions on attributes -- the ability to parse json from attributes into properties, or other type conversions,
makes web components significantly easier to use in traditional server-rendered applications.