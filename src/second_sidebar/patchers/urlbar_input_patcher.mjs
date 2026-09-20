export class UrlbarInputPatcher {
  static patch() {
    console.log("Patching #urlbar-input...");
    this.#defineLazyGetter();
    this.#patchTabSwitchFocusChange();
    this.#patchValueFormatterUpdate();
    console.log("#urlbar-input was patched");
  }

  static #defineLazyGetter() {
    const childWindow = window[1];
    const urlbarInput = childWindow.document.querySelector("#urlbar-input");
    ChromeUtils.defineLazyGetter(urlbarInput, "editor", () => null);
  }

  static #patchTabSwitchFocusChange() {
    const urlbar = window[1].gURLBar;
    const afterTabSelectAndFocusChange = urlbar._afterTabSelectAndFocusChange;
    if (typeof afterTabSelectAndFocusChange !== "function") return;

    urlbar._afterTabSelectAndFocusChange = function (...args) {
      // The hidden urlbar may have no view. Its focus handler must not
      // interrupt tab removal before the temporary panel is deleted.
      if (!this.view) return;
      return afterTabSelectAndFocusChange.apply(this, args);
    };
  }

  static #patchValueFormatterUpdate() {
    const valueFormatter = window[1].gURLBar?.valueFormatter;
    if (typeof valueFormatter?.update !== "function") return;

    // The hidden urlbar's editor is always null (see #defineLazyGetter), but
    // formatting (e.g. triggered by tab close permitUnload checks) still
    // dereferences it and throws. There is no visible urlbar to format here.
    valueFormatter.update = async () => {};
  }
}
