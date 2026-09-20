import { PreferencesWrapper } from "../wrappers/preferences.mjs";

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
