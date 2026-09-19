import { BrowserElements } from "../browser_elements.mjs";
import {
  getZenElementSeparation,
  isZenBrowserContainer,
} from "../utils/zen.mjs";
import { Div } from "./base/div.mjs";

/**
 * Represents the area where the sidebar box is positioned.
 * This class handles the positioning of the sidebar relative to the main browser tab area.
 */
export class SidebarBoxArea extends Div {
  constructor() {
    super({ id: "sb2-box-area" });
    this.updatePosition();
  }

  /**
   * Updates the position of the sidebar box area to match the dimensions
   * and position of the main browser tab area.
   * @returns {SidebarBoxArea} This instance for method chaining.
   */
  updatePosition() {
    if (isZenBrowserContainer(BrowserElements.browser)) {
      const browserRect = BrowserElements.browser.getBoundingClientRect();
      const sidebarMainRect = document
        .getElementById("sb2-main")
        ?.getBoundingClientRect();
      const sidebarWidth = sidebarMainRect?.width ?? 0;
      const gap = getZenElementSeparation(document);
      const reservedWidth = sidebarWidth > 0 ? sidebarWidth + gap : 0;
      const wrapperPosition =
        document.getElementById("sb2-wrapper")?.getAttribute("position") ??
        "right";
      const left = wrapperPosition === "left" ? reservedWidth : 0;
      const width = Math.max(0, browserRect.width - reservedWidth);

      this.setProperty("left", `${left}px`)
        .setProperty("top", "0px")
        .setProperty("width", `${width}px`)
        .setProperty("height", "100%");
      return this;
    }

    const rect = BrowserElements.tabbrowserTabbox.getBoundingClientRect();
    const browserRect = BrowserElements.browser.getBoundingClientRect();
    this.setProperty("left", `${rect.left - browserRect.left}px`)
      .setProperty("top", `${rect.top - browserRect.top}px`)
      .setProperty("width", `${rect.width}px`)
      .setProperty("height", `${rect.height}px`);
    return this;
  }
}
