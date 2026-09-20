export class UrlbarInputPatcher {
  static patch() {
    console.log("Patching #urlbar-input...");
    this.#defineLazyGetter();
    this.#patchTabSwitchFocusChange();
    this.#suppressValueFormatterErrors();
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

  static #suppressValueFormatterErrors() {
    const childWindow = window[1];
    // UrlbarValueFormatter's internals are private class fields, so they
    // can't be guarded from outside. permitUnload (tab close) can still
    // reach it and dereference the hidden urlbar's always-null editor
    // (see #defineLazyGetter). There is no visible urlbar to format here,
    // so just swallow that specific benign error.
    childWindow.addEventListener("error", (event) => {
      if (event.filename?.includes("UrlbarValueFormatter.sys.mjs")) {
        event.preventDefault();
      }
    });
  }
}
