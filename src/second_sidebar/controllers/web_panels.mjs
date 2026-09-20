import {
  SidebarEvents,
  WebPanelEvents,
  listenEvent,
  sendEvents,
} from "./events.mjs";

import { NetUtilWrapper } from "../wrappers/net_utils.mjs";
import { ChromeUtilsWrapper } from "../wrappers/chrome_utils.mjs";
import { SidebarControllers } from "../sidebar_controllers.mjs";
import { SidebarElements } from "../sidebar_elements.mjs";
import { WebPanelController } from "./web_panel.mjs";
import { WebPanelSettings } from "../settings/web_panel_settings.mjs";
import { WebPanelState } from "../settings/web_panel_state.mjs";
import { WebPanelsSettings } from "../settings/web_panels_settings.mjs";
import { WebPanelsState } from "../settings/web_panels_state.mjs";
import { WindowWrapper } from "../wrappers/window.mjs";
import { extractHostname } from "../utils/url.mjs";
import { gCustomizeModeWrapper } from "../wrappers/g_customize_mode.mjs";

const SAVE_DEBOUNCE_MS = 300;

export class WebPanelsController {
  /**@type {string?} */
  #lastMainBrowserHostname = null;
  /**@type {number?} */
  #saveSettingsTimer = null;
  /**@type {number?} */
  #saveStateTimer = null;

  constructor() {
    /**@type {Map<string, WebPanelController>} */
    this.webPanelControllers = new Map();
    /**@type {string?} */
    this.lastOpenedWebPanelUUID = null;
    this.#setupListeners();
    this.#setupMainBrowserListener();
  }

  #setupListeners() {
    SidebarElements.webPanelMenuPopup.listenUnloadItemClick(
      (webPanelController) => {
        if (webPanelController.isActive()) {
          SidebarControllers.sidebarController.close();
        }
        webPanelController.unload();
      },
    );

    SidebarElements.webPanelMenuPopup.listenMuteItemClick(
      (webPanelController) => {
        webPanelController.toggleMuteAudio();
      },
    );

    SidebarElements.webPanelMenuPopup.listenResetPositionItemClick(
      (webPanelController) => {
        sendEvents(SidebarEvents.RESET_SIDEBAR_FLOATING_POSITION, {
          uuid: webPanelController.getUUID(),
        });
      },
    );

    SidebarElements.webPanelMenuPopup.listenResetWidthItemClick(
      (webPanelController) => {
        sendEvents(SidebarEvents.RESET_SIDEBAR_FLOATING_WIDTH, {
          uuid: webPanelController.getUUID(),
        });
      },
    );

    SidebarElements.webPanelMenuPopup.listenResetHeightItemClick(
      (webPanelController) => {
        sendEvents(SidebarEvents.RESET_SIDEBAR_FLOATING_HEIGHT, {
          uuid: webPanelController.getUUID(),
        });
      },
    );

    SidebarElements.webPanelMenuPopup.listenResetAllItemClick(
      (webPanelController) => {
        sendEvents(SidebarEvents.RESET_SIDEBAR_FLOATING_ALL, {
          uuid: webPanelController.getUUID(),
        });
      },
    );

    SidebarElements.webPanelMenuPopup.listenEditItemClick(
      (webPanelController) => {
        webPanelController.switchWebPanel({ forceOpen: true });
        SidebarControllers.webPanelEditController.openPopup(webPanelController);
      },
    );

    SidebarElements.webPanelMenuPopup.listenDeleteItemClick(
      (webPanelController) => {
        SidebarControllers.webPanelDeleteController.openPopup(
          webPanelController,
        );
      },
    );

    SidebarElements.webPanelMenuPopup.listenCustomizeItemClick(() => {
      gCustomizeModeWrapper.enter();
    });

    listenEvent(WebPanelEvents.CREATE_WEB_PANEL, async (event) => {
      const {
        uuid,
        url,
        userContextId,
        temporary,
        newWebPanelPosition,
        isActiveWindow,
      } = event.detail;

      const create = async () => {
        return await this.createWebPanelController(
          uuid,
          url,
          userContextId,
          temporary,
          newWebPanelPosition,
          isActiveWindow,
        );
      };

      if (temporary) {
        if (isActiveWindow) {
          const webPanelController = await create();
          webPanelController.switchWebPanel();
          setTimeout(() => this.#unwrapButtons(), 100);
        }
      } else {
        const webPanelController = await create();
        if (isActiveWindow) {
          webPanelController.switchWebPanel();
        }
        setTimeout(() => this.#unwrapButtons(), 100);
      }
    });

    listenEvent(WebPanelEvents.EDIT_WEB_PANEL_URL, (event) => {
      const uuid = event.detail.uuid;
      const url = event.detail.url;
      const timeout = event.detail.timeout;

      const webPanelController = this.get(uuid);
      const oldUrl = webPanelController.getURL();
      webPanelController.setURL(url);

      clearTimeout(this.urlTimeout);
      this.urlTimeout = setTimeout(() => {
        if (!webPanelController.isUnloaded() && oldUrl !== url) {
          webPanelController.go(url);
        }
      }, timeout);
    });

    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_TITLE,
      ["dynamicTitle", "title"],
      "setTitle",
      { onChanged: (webPanelController) => webPanelController.updateTitle() },
    );

    listenEvent(WebPanelEvents.EDIT_WEB_PANEL_FAVICON_URL, (event) => {
      const { uuid, dynamicFavicon, faviconURL, timeout } = event.detail;

      const webPanelController = this.get(uuid);
      webPanelController.setFaviconURL(dynamicFavicon, faviconURL);

      clearTimeout(this.faviconURLTimeout);
      this.faviconURLTimeout = setTimeout(() => {
        webPanelController.updateFavicon();
      }, timeout);
    });

    listenEvent(WebPanelEvents.EDIT_WEB_PANEL_SELECTOR_ENABLED, (event) => {
      const uuid = event.detail.uuid;
      const selectorEnabled = event.detail.selectorEnabled;

      const webPanelController = this.get(uuid);
      const oldSelectorEnabled = webPanelController.getSelectorEnabled();
      webPanelController.setSelectorEnabled(selectorEnabled);

      if (
        !webPanelController.isUnloaded() &&
        oldSelectorEnabled !== selectorEnabled
      ) {
        webPanelController.reload();
      }
    });

    listenEvent(WebPanelEvents.EDIT_WEB_PANEL_SELECTOR, (event) => {
      const uuid = event.detail.uuid;
      const selector = event.detail.selector;
      const timeout = event.detail.timeout;

      const webPanelController = this.get(uuid);
      const oldSelector = webPanelController.getSelector();
      webPanelController.setSelector(selector);

      clearTimeout(this.urlTimeout);
      this.urlTimeout = setTimeout(() => {
        if (!webPanelController.isUnloaded() && oldSelector !== selector) {
          webPanelController.reload();
        }
      }, timeout);
    });

    listenEvent(WebPanelEvents.EDIT_WEB_PANEL_PINNED, (event) => {
      const uuid = event.detail.uuid;
      const pinned = event.detail.pinned;

      const webPanelController = this.get(uuid);
      pinned ? webPanelController.pin() : webPanelController.unpin();

      if (webPanelController.isActive()) {
        SidebarControllers.sidebarController.updatePinState(webPanelController);
        SidebarControllers.sidebarController.updateToolbar(webPanelController);
      }
    });

    // The five floating-geometry settings below all follow the same shape:
    // apply the setter, then recalculate on-screen geometry if the panel is
    // currently visible.
    this.#bindGeometrySetting(
      WebPanelEvents.EDIT_WEB_PANEL_ANCHOR,
      "anchor",
      "setAnchor",
    );
    this.#bindGeometrySetting(
      WebPanelEvents.EDIT_WEB_PANEL_OFFSET_X_TYPE,
      "offsetXType",
      "setOffsetXType",
    );
    this.#bindGeometrySetting(
      WebPanelEvents.EDIT_WEB_PANEL_OFFSET_Y_TYPE,
      "offsetYType",
      "setOffsetYType",
    );
    this.#bindGeometrySetting(
      WebPanelEvents.EDIT_WEB_PANEL_WIDTH_TYPE,
      "widthType",
      "setWidthType",
    );
    this.#bindGeometrySetting(
      WebPanelEvents.EDIT_WEB_PANEL_HEIGHT_TYPE,
      "heightType",
      "setHeightType",
    );

    // The settings below are each just "apply this one setter", optionally
    // followed by a small fixed side effect (onChanged).
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_USER_CONTEXT_ID,
      "userContextId",
      "setUserContextId",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_ALWAYS_ON_TOP,
      "alwaysOnTop",
      "setAlwaysOnTop",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_MOBILE,
      "mobile",
      "setMobile",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_LOAD_ON_STARTUP,
      "loadOnStartup",
      "setLoadOnStartup",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_LOAD_LAST_URL,
      "loadLastUrl",
      "setLoadLastUrl",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_UNLOAD_ON_CLOSE,
      "unloadOnClose",
      "setUnloadOnClose",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_UNLOAD_AFTER_INACTIVITY,
      "unloadAfterInactivity",
      "setUnloadAfterInactivity",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_SHORTCUT,
      "shortcut",
      "setShortcut",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_HIDE_TOOLBAR,
      "hideToolbar",
      "setHideToolbar",
      {
        onChanged: (_webPanelController, { hideToolbar }) =>
          hideToolbar
            ? SidebarControllers.sidebarController.collapseToolbar()
            : SidebarControllers.sidebarController.uncollapseToolbar(),
      },
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_HIDE_SOUND_ICON,
      "hideSoundIcon",
      "setHideSoundIcon",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_HIDE_NOTIFICATION_BADGE,
      "hideNotificationBadge",
      "setHideNotificationBadge",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_PERIODIC_RELOAD,
      "periodicReload",
      "setPeriodicReload",
    );
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_RELOAD_ON_URL_CHANGE,
      "reloadOnUrlChange",
      "setReloadOnUrlChange",
    );
    this.#bindSimpleAction(WebPanelEvents.EDIT_WEB_PANEL_ZOOM_OUT, "zoomOut");
    this.#bindSimpleAction(WebPanelEvents.EDIT_WEB_PANEL_ZOOM_IN, "zoomIn");
    this.#bindSimpleSetting(
      WebPanelEvents.EDIT_WEB_PANEL_ZOOM,
      "value",
      "setZoom",
    );

    listenEvent(WebPanelEvents.DELETE_WEB_PANEL, async (event) => {
      const uuid = event.detail.uuid;

      const webPanelController = this.get(uuid);
      if (webPanelController.isActive()) {
        SidebarControllers.sidebarController.close();
      }
      webPanelController.remove();
      this.delete(uuid);
    });
  }

  /**
   * Binds a WebPanelController setter to an edit event: apply the setter
   * with the event's value(s), then run an optional follow-up. Covers the
   * many settings that are just "call one setter", optionally followed by a
   * small fixed side effect, so those don't each need a bespoke handler.
   * Settings with real branching logic (different values triggering
   * different methods, debounced timeouts, etc.) stay hand-written above.
   *
   * @param {string} event
   * @param {string|Array<string>} valueKeys - event.detail key(s) passed to the setter, in order
   * @param {string} setterName
   * @param {object} params
   * @param {function(WebPanelController, object):void} params.onChanged
   */
  #bindSimpleSetting(event, valueKeys, setterName, { onChanged } = {}) {
    const keys = Array.isArray(valueKeys) ? valueKeys : [valueKeys];
    listenEvent(event, (e) => {
      const webPanelController = this.get(e.detail.uuid);
      webPanelController[setterName](...keys.map((key) => e.detail[key]));
      onChanged?.(webPanelController, e.detail);
    });
  }

  /**
   * Same shape as #bindSimpleSetting, for the floating-geometry settings
   * that all also need the panel's on-screen geometry recalculated when
   * it's currently visible.
   *
   * @param {string} event
   * @param {string} valueKey
   * @param {string} setterName
   */
  #bindGeometrySetting(event, valueKey, setterName) {
    this.#bindSimpleSetting(event, valueKey, setterName, {
      onChanged: (webPanelController) => {
        if (webPanelController.isActive()) {
          SidebarControllers.sidebarGeometry.calculateAndSetFloatingGeometry(
            webPanelController,
            { forceUpdate: true },
          );
        }
      },
    });
  }

  /**
   * Binds a no-argument WebPanelController action (e.g. zoomIn/zoomOut) to
   * an edit event that only carries the target uuid.
   *
   * @param {string} event
   * @param {string} methodName
   */
  #bindSimpleAction(event, methodName) {
    listenEvent(event, (e) => {
      this.get(e.detail.uuid)[methodName]();
    });
  }

  // Reload panels with "reload on address change" enabled whenever the main
  // browser's active tab is switched or navigated to a different hostname.
  #setupMainBrowserListener() {
    const gBrowser = new WindowWrapper().gBrowser;
    const checkHostnameChange = () => {
      try {
        const url = gBrowser.raw?.selectedBrowser?.currentURI?.spec;
        if (!url) return;
        const hostname = extractHostname(url);
        if (
          this.#lastMainBrowserHostname !== null &&
          hostname !== this.#lastMainBrowserHostname
        ) {
          this.#reloadPanelsOnUrlChange();
        }
        this.#lastMainBrowserHostname = hostname;
      } catch (error) {
        console.error(
          "Second Sidebar: failed to check main browser hostname change",
          error,
        );
      }
    };

    gBrowser.addEventListener("TabSelect", checkHostnameChange);
    gBrowser.addProgressListener({
      QueryInterface: ChromeUtilsWrapper.generateQI([
        "nsIWebProgressListener",
        "nsISupportsWeakReference",
      ]),
      onLocationChange: (webProgress) => {
        if (webProgress.isTopLevel) checkHostnameChange();
      },
    });
  }

  #reloadPanelsOnUrlChange() {
    for (const webPanelController of this.getAll()) {
      if (
        webPanelController.getReloadOnUrlChange() &&
        !webPanelController.isUnloaded()
      ) {
        webPanelController.reload();
      }
    }
  }

  #setupWebPanelsBrowserListeners() {
    // Open/close corresponding web panel when tab is selected
    SidebarElements.webPanelsBrowser.addTabSelectListener(() => {
      const activeWebPanelTab =
        SidebarElements.webPanelsBrowser.getActiveWebPanelTab();
      if (activeWebPanelTab.isEmpty()) {
        if (!SidebarControllers.sidebarController.closed()) {
          SidebarControllers.sidebarController.close();
        }
      } else {
        this.lastOpenedWebPanelUUID = activeWebPanelTab.uuid;
      }
      for (const [uuid, webPanelController] of this.webPanelControllers) {
        if (uuid === activeWebPanelTab.uuid) {
          webPanelController.open();
        }
      }
      // Defer closing other panels: closing an unload-on-close panel removes
      // its tab, and Gecko reassigns the selected tab mid-removal, which
      // would reenter this handler synchronously and corrupt tabbrowser state.
      setTimeout(() => {
        for (const [uuid, webPanelController] of this.webPanelControllers) {
          if (uuid !== activeWebPanelTab.uuid) {
            webPanelController.close();
          }
        }
      }, 0);
    });
    // Revert zoom to default when it's changed
    SidebarElements.webPanelsBrowser.addZoomChangeListener((tab) => {
      const webPanelController = this.get(tab.uuid);
      const zoom = webPanelController.getZoom();
      if (tab.linkedBrowser.getZoom() != zoom) {
        webPanelController.setZoom(zoom);
      }
    });
  }

  /**
   * @param {function(KeyboardEvent):void} callback
   */
  addKeypressListener(callback) {
    SidebarElements.webPanelsBrowser.waitInitialization(() => {
      SidebarElements.webPanelsBrowser.addKeypressListener(callback);
    });
  }

  #unwrapButtons() {
    const buttons = [
      SidebarElements.webPanelNewButton,
      ...[...this.webPanelControllers.values()].map(
        (webPanelController) => webPanelController.button,
      ),
    ];
    for (const button of buttons) {
      if (button.isWrapped) {
        gCustomizeModeWrapper.unwrapToolbarItem(button.parentElement.getXUL());
      }
    }
  }

  /**
   *
   * @param {string} uuid
   * @param {string} url
   * @param {string} userContextId
   * @param {boolean} temporary
   * @param {string} newWebPanelPosition
   * @param {boolean} isActiveWindow
   * @returns {Promise<WebPanelController>}
   */
  async createWebPanelController(
    uuid,
    url,
    userContextId,
    temporary,
    newWebPanelPosition,
    isActiveWindow,
  ) {
    try {
      NetUtilWrapper.newURI(url);
    } catch (error) {
      console.log("Invalid url:", error);
      return;
    }

    const webPanelSettings = new WebPanelSettings(
      SidebarElements.sidebarWrapper.getPosition(),
      SidebarControllers.sidebarGeometry.getDefaultFloatingOffsetCSS(),
      uuid,
      url,
      {
        userContextId,
        temporary,
      },
    );
    const webPanelState = new WebPanelState(uuid);

    const webPanelController = new WebPanelController(
      webPanelSettings,
      webPanelState,
      {
        loaded: isActiveWindow,
        position: newWebPanelPosition,
      },
    );
    this.add(webPanelController);

    if (isActiveWindow) {
      this.saveSettings();
    }

    return webPanelController;
  }

  /**
   *
   * @param {WebPanelController} webPanelController
   */
  add(webPanelController) {
    this.webPanelControllers.set(
      webPanelController.getUUID(),
      webPanelController,
    );
  }

  /**
   *
   * @param {string} uuid
   * @returns {WebPanelController?}
   */
  get(uuid) {
    return this.webPanelControllers.get(uuid) ?? null;
  }

  /**
   *
   * @returns {WebPanelController?}
   */
  getActive() {
    const tab = SidebarElements.webPanelsBrowser.getActiveWebPanelTab();
    return tab && !tab.isEmpty() ? this.get(tab.uuid) : null;
  }

  /**
   *
   * @returns {WebPanelController[]}
   */
  getAll() {
    return [...this.webPanelControllers.values()];
  }

  /**
   *
   * @param {string} uuid
   */
  delete(uuid) {
    this.webPanelControllers.delete(uuid);
    if (this.lastOpenedWebPanelUUID === uuid) {
      this.lastOpenedWebPanelUUID = null;
    }
  }

  close() {
    SidebarElements.webPanelsBrowser.deselectWebPanelTab();
  }

  switchLastWebPanel() {
    if (!this.lastOpenedWebPanelUUID) return;
    const webPanelController = this.get(this.lastOpenedWebPanelUUID);
    webPanelController?.switchWebPanel();
  }

  /**
   *
   * @param {WebPanelsSettings} webPanelsSettings
   * @param {WebPanelsState} webPanelsState
   */
  loadSettingsAndState(webPanelsSettings, webPanelsState) {
    console.log("Loading web panels...");

    // We need to display web panels window for a while to initialize it and
    // load startup web panels
    SidebarElements.sidebarBox.show();
    SidebarElements.webPanelsBrowser.init();

    SidebarElements.webPanelsBrowser.waitInitialization(() => {
      // Relink docShell.treeOwner to the current window to fix status panel
      new WindowWrapper().relinkTreeOwner();
      // Setup web panels window listeners
      this.#setupWebPanelsBrowserListeners();
      // Load startup web panels
      const webPanelsStateMap = new Map();
      for (const webPanelState of webPanelsState.webPanelsState) {
        webPanelsStateMap.set(webPanelState.uuid, webPanelState);
      }
      for (const webPanelSettings of webPanelsSettings.webPanels) {
        const uuid = webPanelSettings.uuid;
        const webPanelState =
          webPanelsStateMap.get(uuid) ?? new WebPanelState(uuid);
        const webPanelController = new WebPanelController(
          webPanelSettings,
          webPanelState,
          {
            loaded: webPanelSettings.loadOnStartup,
          },
        );
        this.add(webPanelController);
      }
      // Hide web panels window after initialization
      SidebarElements.sidebarBox.hide();
    });
  }

  /**
   *
   * @returns {WebPanelsSettings}
   */
  dumpSettings() {
    return new WebPanelsSettings(
      Array.from(this.webPanelControllers.values(), (webPanelController) =>
        webPanelController.dumpSettings(),
      ),
    );
  }

  saveSettings() {
    // Coalesce bursts of settings changes (drag/resize end, multiple edits) into one write.
    clearTimeout(this.#saveSettingsTimer);
    this.#saveSettingsTimer = setTimeout(() => {
      this.dumpSettings()
        .save()
        .catch((error) => console.error("Failed to save web panels:", error));
    }, SAVE_DEBOUNCE_MS);
  }

  dumpState() {
    return new WebPanelsState(
      Array.from(this.webPanelControllers.values(), (webPanelController) =>
        webPanelController.dumpState(),
      ),
    );
  }

  saveState() {
    // Coalesce state saves so multiple panels finishing navigation close together only write once.
    clearTimeout(this.#saveStateTimer);
    this.#saveStateTimer = setTimeout(() => {
      this.dumpState()
        .save()
        .catch((error) =>
          console.error("Failed to save web panels state:", error),
        );
    }, SAVE_DEBOUNCE_MS);
  }
}
