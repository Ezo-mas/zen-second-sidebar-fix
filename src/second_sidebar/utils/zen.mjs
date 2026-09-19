export const ZEN_TABBOX_WRAPPER_ID = "zen-tabbox-wrapper";

/**
 * @param {Element?} element
 * @returns {boolean}
 */
export function isZenBrowserContainer(element) {
  return element?.id === ZEN_TABBOX_WRAPPER_ID;
}

/**
 * @param {Document} document
 * @returns {number}
 */
export function getZenElementSeparation(document) {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--zen-element-separation",
    ),
  );
  return Number.isFinite(value) ? value : 6;
}

/**
 * Prevent Zen from treating an embedded browser window as a syncable workspace.
 *
 * @param {Window?} window
 */
export function markZenWindowUnsynced(window) {
  try {
    if (!window) return;

    window._zenStartupSyncFlag = "unsynced";
    window.document?.documentElement?.setAttribute(
      "zen-unsynced-window",
      "true",
    );
  } catch (error) {
    console.log("Failed to mark web panels window as Zen unsynced:", error);
  }
}
