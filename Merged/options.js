// Use browser.* if available, otherwise fall back to chrome.*
if (typeof browser === 'undefined') {
  var browser = chrome;
}

async function main(options) {
  const optionsForm = document.getElementsByClassName('ranimeenhanced-options')[0].getElementsByTagName('form')[0];

  for (const option of optionsForm.getElementsByClassName('option')) {
    const input = option.getElementsByTagName('input')[0];
    const inputs = getSubOptionInputs(option, input);

    const optionData = getOptions(options, input);

    input.checked = optionData.enabled;
    const subOptionsDom = inputs.map((input) => input.closest('.option'));
    if (!optionData.enabled) {
      for (const subOptionDom of subOptionsDom) {
        subOptionDom.classList.add('disabled');
        subOptionDom.disabled = true;
      }
      for (const i of inputs) {
        i.disabled = true;
      }
    }
    input.addEventListener('change', (e) => {
      optionData.enabled = e.target.checked;
      browser.storage.sync.set({options: options});
      for (const i of inputs) {
        i.disabled = !optionData.enabled;
      }

      if (optionData.enabled) {
        for (const subOptionDom of subOptionsDom) {
          subOptionDom.classList.remove('disabled');
        }
      } else {
        for (const subOptionDom of subOptionsDom) {
          subOptionDom.classList.add('disabled');
        }
      }
    });
  }
}

function getOptions(options, current) {
  const names = [current.name];

  while (current) {
    if (current.dataset.moduleName && names.at(-1) !== current.dataset.moduleName) {
      names.push(current.dataset.moduleName);
    }
    current = current.parentElement;
  }
  names.reverse();

  const last = names.pop();
  for (const name of names) {
    if (!(name in options)) {
      options[name] = {};
    }
    options = options[name];
    if (!('subOptions' in options)) {
      options.subOptions = {};
    }
    options = options.subOptions;
  }
  if (!(last in options)) {
    options[last] = {enabled: false}
  }
  return options[last];
}

function getSubOptionInputs(current, input) {
  while (current) {
    if (current.classList.contains('sub-options')) {
      return [];
    } else if (current.classList.contains('option-group')) {
      return Array.from(current.getElementsByTagName('input')).filter(i => i !== input);
    }
    current = current.parentElement;
  }
  return [];
}

function domReady() {
  return new Promise(resolve => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
}

function loadOptions() {
  return new Promise(resolve => {
    browser.storage.sync.get('options', (items) => {
      resolve(items.options || {});
    });
  });
}

const [options] = await Promise.all([loadOptions(), domReady()]);
main(options);
