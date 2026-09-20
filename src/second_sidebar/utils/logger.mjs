import { PreferencesWrapper } from "../wrappers/preferences.mjs";

const DEBUG_PREF = "second-sidebar.debug-logging";

/**
 * Gate for verbose, per-action console output (tab lifecycle, per-setting
 * change events, etc). Off by default so normal use doesn't spam the
 * Browser Console; flip `second-sidebar.debug-logging` to `true` in
 * about:config to see it. Real errors always use console.error directly and
 * are never gated behind this - only routine/diagnostic noise is.
 */
export class Logger {
  /**
   * @returns {boolean}
   */
  static get enabled() {
    return (
      PreferencesWrapper.prefHasUserValue(DEBUG_PREF) &&
      PreferencesWrapper.getBoolPref(DEBUG_PREF)
    );
  }

  /**
   *
   * @param {Array<*>} args
   */
  static debug(...args) {
    if (this.enabled) console.log(...args);
  }
}
