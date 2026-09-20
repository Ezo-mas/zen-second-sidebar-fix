export class DirectoryServiceWrapper {
  /**
   * The profile's `chrome/` directory (Gecko's "UChrm" directory-service
   * key). Used instead of resolving a userChrome loader's own registered
   * chrome:// alias (e.g. fx-autoconfig's chrome://userchrome/content/) so
   * this works the same regardless of which loader (fx-autoconfig, Sine,
   * ...) is actually running this script.
   *
   * @returns {string}
   */
  static get profileChromeDir() {
    return Services.dirsvc.get("UChrm", Ci.nsIFile).path;
  }
}
