import { SidebarEvents, sendEvents } from "./events.mjs";

import { FilePickerWrapper } from "../wrappers/file_picker.mjs";
import { IOUtilsWrapper } from "../wrappers/io_utils.mjs";
import { PromptServiceWrapper } from "../wrappers/prompt.mjs";
import { SidebarControllers } from "../sidebar_controllers.mjs";
import { SidebarElements } from "../sidebar_elements.mjs";
import { SidebarSettings } from "../settings/sidebar_settings.mjs";
import { WebPanelSettings } from "../settings/web_panel_settings.mjs";
import { WebPanelsSettings } from "../settings/web_panels_settings.mjs";
import { WindowWrapper } from "../wrappers/window.mjs";

// Bump when the exported shape changes in a way old exports can't just be
// read as (a field renamed or repurposed, not just a new optional field -
// those already default fine via the settings classes' own constructors).
const EXPORT_VERSION = 1;

export class SidebarMainSettingsController {
  constructor() {
    this.#setupListeners();
  }

  #setupListeners() {
    SidebarElements.sidebarMainPopupSettings.listenChanges({
      position: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_POSITION, { value }),
      padding: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_PADDING, { value }),
      allowWindowDragging: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_ALLOW_WINDOW_DRAGGING, { value }),
      newWebPanelPosition: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_NEW_WEB_PANEL_POSITION, {
          value,
        }),
      defaultFloatingOffset: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_DEFAULT_FLOATING_OFFSET, {
          value,
        }),
      autoHideBackButton: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_AUTO_HIDE_BACK_BUTTON, { value }),
      autoHideForwardButton: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_AUTO_HIDE_FORWARD_BUTTON, {
          value,
        }),
      enableSidebarBoxHint: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_ENABLE_BOX_HINT, { value }),
      containerBorder: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_CONTAINER_BORDER, { value }),
      tooltip: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_TOOLTIP, { value }),
      tooltipFullUrl: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_TOOLTIP_FULL_URL, { value }),
      visibility: (
        autoHideSidebar,
        autoHideSidebarBehavior,
        sidebarWidgetHideWebPanel,
        sidebarWidgetShortcut,
      ) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_VISIBILITY, {
          autoHideSidebar,
          autoHideSidebarBehavior,
          sidebarWidgetHideWebPanel,
          sidebarWidgetShortcut,
        }),
      lastWebPanelShortcut: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_LAST_WEB_PANEL_SHORTCUT, {
          value,
        }),
      hideSidebarAnimated: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_AUTO_HIDE_ANIMATED, { value }),
      hideToolbarAnimated: (value) =>
        sendEvents(SidebarEvents.EDIT_SIDEBAR_TOOLBAR_AUTO_HIDE_ANIMATED, {
          value,
        }),
    });

    SidebarElements.sidebarMainPopupSettings.listenCancelButtonClick(() =>
      SidebarElements.sidebarMainPopupSettings.hidePopup(),
    );

    SidebarElements.sidebarMainPopupSettings.listenSaveButtonClick(() => {
      SidebarControllers.sidebarController.saveSettings();
      SidebarElements.sidebarMainPopupSettings.hidePopup();
    });

    SidebarElements.sidebarMainPopupSettings.listenExportSettingsButtonClick(
      () => this.#exportSettings(),
    );
    SidebarElements.sidebarMainPopupSettings.listenImportSettingsButtonClick(
      () => this.#importSettings(),
    );
  }

  /**
   *
   */
  openPopup() {
    const popupPosition =
      SidebarElements.sidebarWrapper.getPosition() === "right"
        ? "start_before"
        : "end_before";
    SidebarElements.sidebarMainPopupSettings.openPopup(
      SidebarElements.sidebarMain,
      popupPosition,
      SidebarControllers.sidebarController.dumpSettings(),
    );
  }

  /**
   * Writes the sidebar settings and every web panel's settings (not their
   * per-panel state, e.g. lastUrl - see AGENTS.md on keeping those
   * distinct) to a single JSON file the user picks.
   */
  async #exportSettings() {
    const window = new WindowWrapper().raw;
    const path = await FilePickerWrapper.pickSaveFile(
      window,
      "Export Second Sidebar Settings",
      "second-sidebar-settings.json",
    );
    if (!path) return;

    try {
      const data = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        sidebarSettings: SidebarControllers.sidebarController
          .dumpSettings()
          .toObject(),
        webPanels: SidebarControllers.webPanelsController
          .dumpSettings()
          .webPanels.map((webPanel) => webPanel.toObject()),
      };
      await IOUtilsWrapper.writeUTF8(path, JSON.stringify(data, null, 2));
      PromptServiceWrapper.alert(
        window,
        "Export Second Sidebar Settings",
        "Settings exported successfully.",
      );
    } catch (error) {
      console.error("Second Sidebar: failed to export settings", error);
      PromptServiceWrapper.alert(
        window,
        "Export Second Sidebar Settings",
        "Failed to export settings. See the Browser Console for details.",
      );
    }
  }

  /**
   * Writes the imported settings straight to the same storage the addon
   * reads at startup (SidebarSettings/WebPanelsSettings.save) instead of
   * hot-applying them live: a wholesale settings replacement can add,
   * remove, or re-key entire panels and containers at once, which the live
   * per-field event system (see #setupListeners here and in
   * WebPanelsController) isn't built to do safely in a single shot. A
   * restart picks the new settings up the same way any fresh window does.
   */
  async #importSettings() {
    const window = new WindowWrapper().raw;
    const path = await FilePickerWrapper.pickOpenFile(
      window,
      "Import Second Sidebar Settings",
    );
    if (!path) return;

    try {
      const data = JSON.parse(await IOUtilsWrapper.readUTF8(path));
      if (!data.sidebarSettings || !Array.isArray(data.webPanels)) {
        throw new Error(
          "file does not look like a Second Sidebar settings export",
        );
      }

      const sidebarSettings = new SidebarSettings(data.sidebarSettings);
      const defaultFloatingOffsetCSS = `var(--space-${sidebarSettings.defaultFloatingOffset})`;
      const webPanelsSettings = new WebPanelsSettings(
        data.webPanels.map((webPanel) =>
          WebPanelSettings.fromObject(
            sidebarSettings.position,
            defaultFloatingOffsetCSS,
            webPanel,
          ),
        ),
      );

      sidebarSettings.save();
      await webPanelsSettings.save();

      PromptServiceWrapper.alert(
        window,
        "Import Second Sidebar Settings",
        "Settings imported. Restart the browser for the change to fully take effect.",
      );
    } catch (error) {
      console.error("Second Sidebar: failed to import settings", error);
      PromptServiceWrapper.alert(
        window,
        "Import Second Sidebar Settings",
        "Failed to import settings: the file may be invalid or corrupted. See the Browser Console for details.",
      );
    }
  }
}
