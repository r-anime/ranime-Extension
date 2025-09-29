// Use browser.* if available, otherwise fall back to chrome.*
if (typeof browser === 'undefined') {
  var browser = chrome;
}

export {browser};

export function loadOptions() {
  return new Promise(resolve => {
    browser.storage.sync.get('options', (items) => {
      resolve(items.options || {});
    });
  });
}

export async function setOptions(options) {
  return browser.storage.sync.set({options: options});
}

export function domReady() {
  return new Promise(resolve => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
}
