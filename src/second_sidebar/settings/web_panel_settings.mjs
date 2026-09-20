import { FloatingWebPanelGeometrySettings } from "./floating_web_panel_geometry_settings.mjs";
import { PinnedWebPanelGeometrySettings } from "./pinned_web_panel_geometry_settings.mjs";
import { ScriptSecurityManagerWrapper } from "../wrappers/script_security_manager.mjs";

export class WebPanelSettings {
  /**
   *
   * @param {string} sidebarPosition
   * @param {string} defaultFloatingOffsetCSS
   * @param {string} uuid
   * @param {string} url
   * @param {object} params
   * @param {boolean} params.dynamicTitle
   * @param {string} params.title
   * @param {boolean} params.dynamicFavicon
   * @param {string} params.faviconURL
   * @param {boolean} params.pinned
   * @param {boolean} params.alwaysOnTop
   * @param {boolean} params.mobile
   * @param {number} params.zoom
   * @param {boolean} params.loadLastUrl
   * @param {boolean} params.loadOnStartup
   * @param {boolean} params.unloadOnClose
   * @param {number} params.unloadAfterInactivity
   * @param {boolean} params.hideToolbar
   * @param {string} params.userContextId
   * @param {number} params.periodicReload
   * @param {boolean} params.reloadOnUrlChange
   * @param {boolean} params.hideSoundIcon
   * @param {boolean} params.hideNotificationBadge
   * @param {boolean} params.selectorEnabled
   * @param {string} params.selector
   * @param {FloatingWebPanelGeometrySettings} params.floatingGeometry
   * @param {PinnedWebPanelGeometrySettings} params.pinnedGeometry
   * @param {boolean} params.temporary
   * @param {string} params.shortcut
   */
  constructor(
    sidebarPosition,
    defaultFloatingOffsetCSS,
    uuid,
    url,
    {
      dynamicTitle = true,
      title = "",
      dynamicFavicon = true,
      faviconURL = "",
      pinned = false,
      alwaysOnTop = false,
      mobile = false,
      zoom = 1,
      loadOnStartup = true,
      loadLastUrl = false,
      unloadOnClose = false,
      unloadAfterInactivity = 0,
      hideToolbar = false,
      userContextId = ScriptSecurityManagerWrapper.DEFAULT_USER_CONTEXT_ID,
      periodicReload = 0,
      reloadOnUrlChange = false,
      hideSoundIcon = false,
      hideNotificationBadge = false,
      selectorEnabled = false,
      selector = "",
      floatingGeometry = new FloatingWebPanelGeometrySettings(
        sidebarPosition,
        defaultFloatingOffsetCSS,
      ),
      pinnedGeometry = new PinnedWebPanelGeometrySettings(),
      temporary = false,
      shortcut = "",
    } = {},
  ) {
    this.uuid = uuid;
    this.url = url;
    this.dynamicTitle = dynamicTitle;
    this.title = title;
    this.dynamicFavicon = dynamicFavicon;
    this.faviconURL = faviconURL;
    this.pinned = pinned;
    this.alwaysOnTop = alwaysOnTop;
    this.mobile = mobile;
    this.zoom = zoom;
    this.loadOnStartup = loadOnStartup;
    this.loadLastUrl = loadLastUrl;
    this.unloadOnClose = unloadOnClose;
    this.unloadAfterInactivity = unloadAfterInactivity;
    this.hideToolbar = hideToolbar;
    this.userContextId = userContextId;
    this.periodicReload = periodicReload;
    this.reloadOnUrlChange = reloadOnUrlChange;
    this.hideSoundIcon = hideSoundIcon;
    this.hideNotificationBadge = hideNotificationBadge;
    this.selectorEnabled = selectorEnabled;
    this.selector = selector;
    this.floatingGeometry = floatingGeometry;
    this.pinnedGeometry = pinnedGeometry;
    this.temporary = temporary;
    this.shortcut = shortcut;
  }

  /**
   *
   * @param {string} sidebarPosition
   * @param {string} defaultFloatingOffsetCSS
   * @param {object} object
   * @returns {WebPanelSettings}
   */
  static fromObject(sidebarPosition, defaultFloatingOffsetCSS, object) {
    return new WebPanelSettings(
      sidebarPosition,
      defaultFloatingOffsetCSS,
      object.uuid,
      object.url,
      {
        // Spreading `object` covers every plain field (and quietly defaults
        // any the object is missing, e.g. from an older save, via the
        // constructor's own destructuring defaults above). Only the nested
        // geometry settings need special handling, since they must become
        // real instances rather than the plain objects stored on disk.
        ...object,
        floatingGeometry: FloatingWebPanelGeometrySettings.fromObject(
          sidebarPosition,
          defaultFloatingOffsetCSS,
          object.floatingGeometry,
        ),
        pinnedGeometry: PinnedWebPanelGeometrySettings.fromObject(
          object.pinnedGeometry,
        ),
      },
    );
  }

  /**
   *
   * @returns {object}
   */
  toObject() {
    return {
      // See fromObject: every plain field round-trips via the spread, only
      // the nested geometry settings need converting to plain objects.
      ...this,
      floatingGeometry: this.floatingGeometry.toObject(),
      pinnedGeometry: this.pinnedGeometry.toObject(),
    };
  }
}
