// import puppeteer from 'puppeteer';
import {Callback, exposeInstance, HookData} from './instances.js';

// export async function setupBrowser(t) {
//   const browser = await puppeteer.launch({headless: false, devtools: true});
//   const page = await browser.newPage();
//   await page.setContent(`<!doctype html>
// <html>
// <head>
// <script type="module" src='../lit.js'></script>
// </head>
// <body>
// <div id='root'></div>
// </body>
// </html>`);
//
//   t.teardown(async () => {
//     debugger;
//     await page.close();
//     await browser.close();
//   });
//
//   return page;
// }

export function setupInstance(t) {
  const instance = {
    updateCount: 0,
    hookData: {} as HookData,
    _post: [],
    _getHookData() {
      return instance.hookData;
    },
    _update() {
      instance.updateCount += 1;
    },
    _postRender(fn: Callback, isSynchronous: boolean) {
      instance._post.push([fn, isSynchronous]);
    },
    _render() {
      for (let [fn, isSync] of this._post) {
        fn(); // only sync for testing
      }
      instance._post = [];
    },
    disconnectedCallback() {
      if (instance.hookData.cleanup && typeof instance.hookData.cleanup === 'function') {
        instance.hookData.cleanup();
      }
    }
  };

  // @ts-ignore
  exposeInstance(instance);

  t.teardown(() => exposeInstance(undefined));

  return instance;
}
