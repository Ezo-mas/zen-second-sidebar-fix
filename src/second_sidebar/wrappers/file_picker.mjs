export class FilePickerWrapper {
  /**
   * Opens a native "Save As" dialog for a JSON file.
   *
   * @param {Window} window
   * @param {string} title
   * @param {string} defaultFileName
   * @returns {Promise<string?>} chosen file path, or null if cancelled
   */
  static async pickSaveFile(window, title, defaultFileName) {
    const picker = Cc["@mozilla.org/filepicker;1"].createInstance(
      Ci.nsIFilePicker,
    );
    picker.init(window.browsingContext, title, Ci.nsIFilePicker.modeSave);
    picker.appendFilter("JSON", "*.json");
    picker.defaultString = defaultFileName;
    picker.defaultExtension = "json";
    const result = await new Promise((resolve) => picker.open(resolve));
    return result === Ci.nsIFilePicker.returnCancel ? null : picker.file.path;
  }

  /**
   * Opens a native "Open" dialog for a JSON file.
   *
   * @param {Window} window
   * @param {string} title
   * @returns {Promise<string?>} chosen file path, or null if cancelled
   */
  static async pickOpenFile(window, title) {
    const picker = Cc["@mozilla.org/filepicker;1"].createInstance(
      Ci.nsIFilePicker,
    );
    picker.init(window.browsingContext, title, Ci.nsIFilePicker.modeOpen);
    picker.appendFilter("JSON", "*.json");
    const result = await new Promise((resolve) => picker.open(resolve));
    return result === Ci.nsIFilePicker.returnCancel ? null : picker.file.path;
  }
}
