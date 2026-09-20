import { FileSettings } from "./settings.mjs";
import { WebPanelState } from "./web_panel_state.mjs";

const PATH = "second-sidebar-data/web-panels-state.json";
const LEGACY_PREF = "second-sidebar.web-panels-state";

export class WebPanelsState {
  /**
   *
   * @param {Array<WebPanelState>} webPanelsState
   */
  constructor(webPanelsState) {
    this.webPanelsState = webPanelsState;
  }

  /**
   *
   * @returns {Promise<WebPanelsState>}
   */
  static async load() {
    const data = (await FileSettings.load(PATH, LEGACY_PREF)) ?? [];

    return new WebPanelsState(
      data.map((webPanelStateData) =>
        WebPanelState.fromObject(webPanelStateData),
      ),
    );
  }

  save() {
    return FileSettings.save(
      PATH,
      this.webPanelsState.map((webPanelState) => webPanelState.toObject()),
    );
  }
}
