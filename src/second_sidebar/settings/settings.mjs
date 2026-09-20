import { PreferencesWrapper } from "../wrappers/preferences.mjs";
import {
  fileExists,
  migrateLegacyFile,
  readFile,
  writeFile,
} from "../utils/files.mjs";

export class Settings {
  /**
   *
   * @param {string} pref
   * @returns {Object | Array<Object> | null}
   */
  static load(pref) {
    const value = PreferencesWrapper.prefHasUserValue(pref)
      ? JSON.parse(PreferencesWrapper.getStringPref(pref))
      : null;
    return value;
  }

  /**
   *
   * @param {string} pref
   * @param {Object | Array<Object>} value
   */
  static save(pref, value) {
    PreferencesWrapper.setStringPref(pref, JSON.stringify(value));
  }
}

/**
 * Same as `Settings`, but backs large/scaling data (arrays that grow with the
 * number of web panels) with a JSON file instead of a preference. Firefox
 * warns and degrades when a single preference value grows too large, so this
 * keeps that data out of prefs.js as Gecko itself recommends.
 */
export class FileSettings {
  /**
   *
   * @param {string} path
   * @param {string} legacyPref
   * @returns {Promise<Object | Array<Object> | null>}
   */
  static async load(path, legacyPref) {
    await migrateLegacyFile(path);

    if (await fileExists(path)) {
      return JSON.parse(await readFile(path));
    }

    // Migrate data written by older versions that stored it in a preference.
    if (PreferencesWrapper.prefHasUserValue(legacyPref)) {
      const value = JSON.parse(PreferencesWrapper.getStringPref(legacyPref));
      await FileSettings.save(path, value);
      PreferencesWrapper.clearUserPref(legacyPref);
      return value;
    }

    return null;
  }

  /**
   *
   * @param {string} path
   * @param {Object | Array<Object>} value
   */
  static async save(path, value) {
    await writeFile(path, JSON.stringify(value));
  }
}
