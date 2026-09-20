import { Browser } from "./browser.mjs";
import { XULElement } from "./xul_element.mjs";

export class Tab extends XULElement {
  /**
   *
   * @param {object} params
   * @param {string?} params.id
   * @param {Array<string>} params.classList
   * @param {HTMLElement?} params.element
   */
  constructor({ id = null, classList = [], element } = {}) {
    super({ tag: "tab", id, classList, element });
  }

  /**
   * @returns {Browser?}
   */
  get linkedBrowser() {
    return new Browser({ element: this.element.linkedBrowser });
  }

  /**
   *
   * @returns {boolean}
   */
  get selected() {
    return this.element.selected ?? false;
  }

  /**
   * @returns {boolean}
   */
  get soundPlaying() {
    return this.element.soundPlaying;
  }

  /**
   * @returns {boolean}
   */
  get muted() {
    return this.element.muted;
  }

  /**
   * @returns {string}
   */
  get image() {
    return this.element.image;
  }

  /**
   * @returns {boolean}
   */
  get undiscardable() {
    return this.element.undiscardable ?? false;
  }

  /**
   * Opts this tab out of Firefox's automatic memory-pressure tab unloader
   * (mirrors the `autoDiscardable` WebExtension tabs property). Tabs
   * playing audio or currently selected are only deprioritized by that
   * unloader, not exempt, so it can still discard one; recovering from
   * that inside a hidden secondary window is not reliable here.
   *
   * @param {boolean} value
   * @returns {Tab}
   */
  setUndiscardable(value) {
    this.element.undiscardable = value;
    return this;
  }

  /**
   *
   * @returns {Tab}
   */
  toggleMuteAudio() {
    this.element.toggleMuteAudio();
    return this;
  }
}
