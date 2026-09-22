import { FileSettings } from "./settings.mjs";
import { WebPanelSettings } from "./web_panel_settings.mjs";

const PATH = "second-sidebar-data/web-panels.json";
const LEGACY_PREF = "second-sidebar.web-panels";

export class WebPanelsSettings {
  /**@type {Array<WebPanelSettings} */
  #webPanels = [];

  /**
   *
   * @param {Array<WebPanelSettings>} webPanels
   */
  constructor(webPanels) {
    this.#webPanels = webPanels;
  }

  get webPanels() {
    return this.#webPanels;
  }

  /**
   *
   * @param {string} sidebarPosition
   * @param {string} defaultFloatingOffset
   * @returns {Promise<WebPanelsSettings>}
   */
  static async load(sidebarPosition, defaultFloatingOffset) {
    const data = (await FileSettings.load(PATH, LEGACY_PREF)) ?? [];

    return new WebPanelsSettings(
      data.map((webPanelData) =>
        WebPanelSettings.fromObject(
          sidebarPosition,
          `var(--space-${defaultFloatingOffset})`,
          webPanelData,
        ),
      ),
    );
  }

  save() {
    return FileSettings.save(
      PATH,
      this.#webPanels.map((webPanel) => webPanel.toObject()),
    );
  }
}
