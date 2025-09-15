// Use browser.* if available, otherwise fall back to chrome.*
if (typeof browser === 'undefined') {
  var browser = chrome;
}

function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    opcommentfaces: document.querySelector('#commentfaces').checked,
    opanisearch: document.querySelector('#anisearch').checked,
    opspoiler: document.querySelector('#spoiler').checked,
    nuspoiler: document.querySelector('#nuspoiler').checked,
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    if (result.opcommentfaces !== undefined) {
      document.querySelector('#commentfaces').checked = result.opcommentfaces;
    } else {
      document.querySelector('#anisearch').checked = true;
    }

    if (result.opanisearch !== undefined) {
      document.querySelector('#anisearch').checked = result.opanisearch;
    } else {
      document.querySelector('#anisearch').checked = true;
    }

    if (result.opspoiler !== undefined) {
      document.querySelector('#spoiler').checked = result.opspoiler;
    } else {
      document.querySelector('#spoiler').checked = false;
    }

    if (result.nuspoiler !== undefined) {
      document.querySelector('#nuspoiler').checked = result.nuspoiler;
    } else {
      document.querySelector('#nuspoiler').checked = false;
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  const getting = browser.storage.local.get(['opcommentfaces', 'opanisearch', 'opspoiler', 'nuspoiler']);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
