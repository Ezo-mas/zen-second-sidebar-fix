import { Settings } from "./settings.mjs";

const PREF = "second-sidebar.settings";

export class SidebarSettings {
  /**
   *
   * @param {object} params
   * @param {string} params.position
   * @param {string} params.padding
   * @param {boolean} params.allowWindowDragging
   * @param {string} params.newWebPanelPosition
   * @param {string} params.defaultFloatingOffset
   * @param {boolean} params.autoHideBackButton
   * @param {boolean} params.autoHideForwardButton
   * @param {string} params.containerBorder
   * @param {string} params.tooltip
   * @param {boolean} params.tooltipFullUrl
   * @param {boolean} params.autoHideSidebar
   * @param {string} params.autoHideSidebarBehavior
   * @param {boolean} params.sidebarWidgetHideWebPanel
   * @param {string} params.sidebarWidgetShortcut
   * @param {string} params.lastWebPanelShortcut
   * @param {boolean} params.hideSidebarAnimated
   * @param {boolean} params.hideToolbarAnimated
   * @param {boolean} params.enableSidebarBoxHint
   */
  constructor({
    position = "right",
    padding = "small",
    allowWindowDragging = true,
    newWebPanelPosition = "before",
    defaultFloatingOffset = "small",
    autoHideBackButton = false,
    autoHideForwardButton = false,
    containerBorder = "left",
    tooltip = "titleandurl",
    tooltipFullUrl = false,
    autoHideSidebar = false,
    autoHideSidebarBehavior = "inline",
    sidebarWidgetHideWebPanel = false,
    sidebarWidgetShortcut = "",
    lastWebPanelShortcut = "",
    hideSidebarAnimated = true,
    hideToolbarAnimated = true,
    enableSidebarBoxHint = false,
  }) {
    this.position = position;
    this.padding = padding;
    this.allowWindowDragging = allowWindowDragging;
    this.newWebPanelPosition = newWebPanelPosition;
    this.defaultFloatingOffset = defaultFloatingOffset;
    this.autoHideBackButton = autoHideBackButton;
    this.autoHideForwardButton = autoHideForwardButton;
    this.containerBorder = containerBorder;
    this.autoHideSidebar = autoHideSidebar;
    this.autoHideSidebarBehavior = autoHideSidebarBehavior;
    this.sidebarWidgetHideWebPanel = sidebarWidgetHideWebPanel;
    this.sidebarWidgetShortcut = sidebarWidgetShortcut;
    this.lastWebPanelShortcut = lastWebPanelShortcut;
    this.tooltip = tooltip;
    this.tooltipFullUrl = tooltipFullUrl;
    this.hideSidebarAnimated = hideSidebarAnimated;
    this.hideToolbarAnimated = hideToolbarAnimated;
    this.enableSidebarBoxHint = enableSidebarBoxHint;
  }

  /**
   * Every field above has a default in the constructor's destructuring, so
   * loading is just replaying whatever was saved (or nothing, for a field
   * an older version never wrote) over those defaults.
   *
   * @returns {SidebarSettings}
   */
  static load() {
    return new SidebarSettings(Settings.load(PREF) ?? {});
  }

  /**
   *
   * @returns {object}
   */
  toObject() {
    return { ...this };
  }

  save() {
    Settings.save(PREF, this.toObject());
  }
}
