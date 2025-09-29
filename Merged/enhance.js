import {browser, setOptions} from "./utils.js";

const defaultOptions = {
  "legacy": {
    "enabled": true, "subOptions": {
      "aniSearch": {"enabled": true},
      "commentFaces": {"enabled": true},
      "spoiler": {"enabled": true},
      "nuSpoiler": {"enabled": false},
    }
  }
}

async function onUpdate(details) {
  if (details.reason === "install") {
    await setOptions(defaultOptions);
    browser.storage.sync.set({legacySynced: true});
  } else if (details.reason === "update") {
    const legacySynced = (await browser.storage.sync.get('legacySynced')).legacySynced;
    if (legacySynced) {
      return;
    }
    const legacySettings = await browser.storage.local.get(["opcommentfaces", "opanisearch", "opspoiler", "nuspoiler"]);
    const options = structuredClone(defaultOptions);

    const legacyOptions = options.legacy.subOptions;
    if (legacySettings.opcommentfaces !== undefined) {
      legacyOptions.commentFaces.enabled = !!legacySettings.opcommentfaces;
    }
    if (legacySettings.opanisearch !== undefined) {
      legacyOptions.aniSearch.enabled = !!legacySettings.opanisearch;
    }
    if (legacySettings.opspoiler !== undefined) {
      legacyOptions.spoiler.enabled = !!legacySettings.opspoiler;
    }
    if (legacySettings.nuspoiler !== undefined) {
      legacyOptions.nuSpoiler.enabled = !!legacySettings.nuspoiler;
    }

    if (Object.values(legacyOptions).some(opt => opt.enabled)) {
      options.legacy.enabled = true;
    }
    await setOptions(options);
    browser.storage.sync.set({legacySynced: true});
  }
}

browser.runtime.onInstalled.addListener(onUpdate);
