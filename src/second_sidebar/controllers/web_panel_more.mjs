import { WebPanelEvents, sendEvents } from "./events.mjs";

import { ClipboardHelperWrapper } from "../wrappers/clipboard_helper.mjs";
import { ScriptSecurityManagerWrapper } from "../wrappers/script_security_manager.mjs";
import { SidebarControllers } from "../sidebar_controllers.mjs";
import { SidebarElements } from "../sidebar_elements.mjs";
import { WindowWrapper } from "../wrappers/window.mjs";

export class WebPanelMoreController {
  constructor() {
    this.#setupListeners();
  }

  #setupListeners() {
    SidebarElements.webPanelPopupMore.listenPopupShowing(() => {
      const webPanelController =
        SidebarControllers.webPanelsController.getActive();
      SidebarElements.webPanelPopupMore.setDefaults(
        webPanelController.dumpSettings(),
      );
    });

    SidebarElements.webPanelPopupMore.listenOpenInNewTabButtonClick(
      (event, uuid) => {
        const webPanelController =
          SidebarControllers.webPanelsController.get(uuid);
        const browserWindow = new WindowWrapper();
        const tab = browserWindow.gBrowser.addTab(
          webPanelController.getTabUrl() ?? webPanelController.getURL(),
          {
            triggeringPrincipal:
              ScriptSecurityManagerWrapper.getSystemPrincipal(),
            userContextId: webPanelController.getUserContextId(),
            inBackground: event.ctrlKey,
          },
        );
        if (!event.ctrlKey) {
          browserWindow.gBrowser.selectedTab = tab;
        }
      },
    );

    SidebarElements.webPanelPopupMore.listenCopyPageUrlButtonClick((uuid) => {
      const webPanelController =
        SidebarControllers.webPanelsController.get(uuid);
      ClipboardHelperWrapper.copyString(webPanelController.getTabUrl());
    });

    SidebarElements.webPanelPopupMore.listenMobileButtonClick(
      (uuid, mobile) => {
        sendEvents(WebPanelEvents.EDIT_WEB_PANEL_MOBILE, {
          uuid,
          mobile,
        });
        SidebarControllers.webPanelsController.saveSettings();
      },
    );

    SidebarElements.webPanelPopupMore.listenTemporaryButtonClick(
      (uuid, temporary) => {
        const webPanelController =
          SidebarControllers.webPanelsController.get(uuid);
        webPanelController.setTemporary(temporary);
        SidebarControllers.webPanelsController.saveSettings();
      },
    );

    SidebarElements.webPanelPopupMore.listenAlwaysOnTopButtonClick(
      (uuid, alwaysOnTop) => {
        sendEvents(WebPanelEvents.EDIT_WEB_PANEL_ALWAYS_ON_TOP, {
          uuid,
          alwaysOnTop,
        });
        SidebarControllers.webPanelsController.saveSettings();
      },
    );

    SidebarElements.webPanelPopupMore.listenZoomOutButtonClick((uuid) => {
      sendEvents(WebPanelEvents.EDIT_WEB_PANEL_ZOOM_OUT, {
        uuid,
      });
      SidebarControllers.webPanelsController.saveSettings();

      const webPanelController =
        SidebarControllers.webPanelsController.get(uuid);
      return webPanelController.getZoom();
    });

    SidebarElements.webPanelPopupMore.listenZoomInButtonClick((uuid) => {
      sendEvents(WebPanelEvents.EDIT_WEB_PANEL_ZOOM_IN, {
        uuid,
      });
      SidebarControllers.webPanelsController.saveSettings();

      const webPanelController =
        SidebarControllers.webPanelsController.get(uuid);
      return webPanelController.getZoom();
    });

    SidebarElements.webPanelPopupMore.listenResetZoomButtonClick((uuid) => {
      sendEvents(WebPanelEvents.EDIT_WEB_PANEL_ZOOM, {
        uuid,
        value: 1,
      });
      SidebarControllers.webPanelsController.saveSettings();

      const webPanelController =
        SidebarControllers.webPanelsController.get(uuid);
      return webPanelController.getZoom();
    });
  }
}
