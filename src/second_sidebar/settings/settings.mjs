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
    if (!PreferencesWrapper.prefHasUserValue(pref)) {
      return null;
    }
    try {
      return JSON.parse(PreferencesWrapper.getStringPref(pref));
    } catch (error) {
      console.error(`Failed to parse pref "${pref}", using defaults:`, error);
      return null;
    }
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
      try {
        return JSON.parse(await readFile(path));
      } catch (error) {
        console.error(`Failed to parse "${path}", using defaults:`, error);
        return null;
      }
    }

    // Migrate data written by older versions that stored it in a preference.
    if (PreferencesWrapper.prefHasUserValue(legacyPref)) {
      try {
        const value = JSON.parse(PreferencesWrapper.getStringPref(legacyPref));
        await FileSettings.save(path, value);
        PreferencesWrapper.clearUserPref(legacyPref);
        return value;
      } catch (error) {
        console.error(
          `Failed to parse legacy pref "${legacyPref}", using defaults:`,
          error,
        );
        return null;
      }
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
