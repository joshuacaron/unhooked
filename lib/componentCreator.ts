import {Options} from './options.js';
import {Callback, exposeInstance, HookData, UnhookedComponent} from './instances.js';

export type Type = String | Boolean | Number | Array<any> | Object;

type SimpleConverter<T> = (value: string, type: Type) => T;
interface DetailedConverter<T> {
  fromAttribute: (value: string, type: Type) => T,
  toAttribute: (value: T, type: Type) => string,
}

export type Converter<T> = SimpleConverter<T> | DetailedConverter<T>;

export interface Property<T> {
  attribute: string | boolean,
  converter: Converter<T>,
  hasChanged: (oldValue: T, newValue: T) => boolean,
  noAccessor: boolean,
  reflect: boolean,
  type: Type,
}

interface WorkingProperty<T> extends Property<T> {
  _attributeName?: string,
  _toAttribute?: (value: T) => string | T,
  _fromAttribute?: (value: string) => T,
}

export interface PropertyMap<T> {
  [propertyName: string]: Property<T>,
}

interface WorkingPropertyMap<T> {
  [propertyName: string]: WorkingProperty<T>,
}

type RenderFunc<T> = (props: object) => T;

export interface RenderFuncWithProperties<T> extends RenderFunc<T> {
  properties?: PropertyMap<T>,
}

export function _componentCreator<T>(renderFn: ((instance: HTMLElement, data: T, options?: Options) => void)):
  ((name: string, render: RenderFuncWithProperties<T>, options?: Options) => void) {
  return (name: string, render: RenderFuncWithProperties<T>, options?: Options) => {

    const properties: WorkingPropertyMap<T> = {};

    for (let [propertyName, baseProperty] of Object.entries(render.properties || {})) {
      const property: WorkingProperty<T> = {
        attribute: true,
        converter: {
          fromAttribute: (value, type) => {
            switch (type) {
              case String:
                return value;
              case Number:
                return Number(value);
              case Boolean:
                return value !== undefined && value !== null;
              default:
                return JSON.parse(value);
            }
          },
          toAttribute: (value, type) => {
            switch (type) {
              case String:
              case Number:
              case Boolean:
                return value;
              default:
                return JSON.stringify(value);
            }
          },
        },
        hasChanged: (oldValue: any, newValue: any) => oldValue !== newValue,
        noAccessor: false,
        reflect: false,
        type: String,
        ...baseProperty,
      };

      if (property.attribute) {
        property._attributeName = typeof property.attribute === 'string' ?
          property.attribute :
          propertyName.toLowerCase();
      }

      if (property.converter) {
        property._toAttribute = (value: T) =>
          'toAttribute' in property.converter ?
            property.converter.toAttribute(value, property.type) :
            value;
        property._fromAttribute = (value: string) =>
          'fromAttribute' in property.converter ?
            property.converter.fromAttribute(value, property.type) :
            property.converter(value, property.type);
      }

      properties[propertyName] = property;
    }

    class Component extends HTMLElement implements UnhookedComponent {
      private _hooksData: HookData[];
      private _hooksCounter: number;
      private _post: [Callback, boolean][];
      private _props: {[key: string]: any};
      private _shouldIgnoreAttributeChanges: boolean;

      constructor() {
        super();

        this._hooksData = [];
        this._hooksCounter = -1;
        this._post = [];
        this._props = {};
        this._shouldIgnoreAttributeChanges = false;

        for (let [propertyName, property] of Object.entries(properties)) {
          if (!property._attributeName || !this.hasAttribute(property._attributeName)) {
            continue;
          }

          this._props[propertyName] = property._fromAttribute(this.getAttribute(property._attributeName));
        }
      }


      static get observedAttributes() {
        return Object.entries(properties).filter(([, property]) => property.attribute).map(([_, property]) => property._attributeName);
      }

      attributeChangedCallback(name, oldValue, newValue) {
        // Avoids looping with reflect
        if (this._shouldIgnoreAttributeChanges) {
          return;
        }

        const data = Object.entries(properties).find(x => x[1]._attributeName === name);

        if (!data) {
          return;
        }
        const [propertyName, property] = data;

        if (property.noAccessor) {
          return;
        }

        this[propertyName] = property._fromAttribute(newValue);
      }

      connectedCallback() {
        this._update();
      }

      _update() {
        setTimeout(() => {
          this._render();
        }, 0);
      }

      _getHookData() {
        this._hooksCounter += 1;

        if (!this._hooksData.hasOwnProperty(this._hooksCounter)) {
          this._hooksData.push({});
        }

        return this._hooksData[this._hooksCounter];
      }

      _postRender(fn: Callback, isSynchronous: boolean) {
        this._post.push([fn, isSynchronous]);
      }

      _render() {
        this._hooksCounter = -1;
        exposeInstance(this);

        const props = {...this._props};
        renderFn(this, render.call(this, props), options);

        for (let [fn, isSync] of this._post) {
          if (isSync) {
            fn();
          } else {
            setTimeout(fn, 0);
          }
        }
        this._post = [];
      }
    }

    for (let [propertyName, property] of Object.entries(properties)) {
      if (property.noAccessor) {
        continue;
      }

      Object.defineProperty(Component.prototype, propertyName, {
        get(): any {
          return this._props[propertyName];
        },
        set(value: T) {
          if (!property.hasChanged(value, this[propertyName])) {
            return;
          }

          if (property.reflect && property.attribute) {
            this._shouldIgnoreAttributeChanges = true;
            this.setAttribute(property._attributeName,property._toAttribute(value));
            this._shouldIgnoreAttributeChanges = false;
          }

          this._props[propertyName] = value;

          this._update();
        },
      });
    }

    customElements.define(name, Component);
  };
}
