// ==UserScript==
// @name            Second Sidebar for Firefox
// @description     A Firefox userChrome.js script that brings a second sidebar with web panels like in Vivaldi/Edge/Floorp but better
// @author          aminought
// @homepageURL     https://github.com/aminought/firefox-second-sidebar
// ==/UserScript==

import { BrowserElements } from "./second_sidebar/browser_elements.mjs";
import { ContextualIdentityServiceWrapper } from "./second_sidebar/wrappers/contextual_identity_service.mjs";
import { CustomizeModePatcher } from "./second_sidebar/patchers/customize_mode_patcher.mjs";
import { SidebarDecorator } from "./second_sidebar/sidebar_decorator.mjs";
import { SidebarInjector } from "./second_sidebar/sidebar_injector.mjs";

const run = () => {
  if (BrowserElements.root.hasClass("sb2-webpanels-window")) return;
  // Guard against double-injection into the same window - e.g. this script
  // set up both the old way (copied into fx-autoconfig's chrome/JS/) and
  // the new way (installed as a Sine mod). Whichever loader gets here
  // first wins; a second injection would create duplicate #sb2-* elements
  // with colliding ids instead of just being a harmless no-op. Set this
  // synchronously, before the first await, so two near-simultaneous callers
  // can't both pass the check.
  if (BrowserElements.root.hasClass("sb2-injected")) return;
  BrowserElements.root.addClass("sb2-injected");

  ContextualIdentityServiceWrapper.ensureDataReady();
  SidebarInjector.inject().then((injected) => {
    if (injected) {
      SidebarDecorator.decorate();
      CustomizeModePatcher.patch();
    }
  });
};

const runAfterStartup = () => {
  if (window.gBrowserInit?.delayedStartupFinished) {
    run();
  } else if (typeof delayedStartupPromise !== "undefined") {
    delayedStartupPromise.then(run);
  } else if (typeof UC_API !== "undefined") {
    UC_API.Runtime.startupFinished().then(run);
  } else if (typeof Services !== "undefined") {
    // Loaders that dynamically import() this script (e.g. Sine) don't
    // define either fx-autoconfig global above. Fall back to Firefox's own
    // delayed-startup notification directly.
    const TOPIC = "browser-delayed-startup-finished";
    const onDelayedStartup = (subject, topic) => {
      if (topic === TOPIC && subject === window) {
        Services.obs.removeObserver(onDelayedStartup, TOPIC);
        run();
      }
    };
    Services.obs.addObserver(onDelayedStartup, TOPIC);
  } else {
    Promise.resolve().then(run);
  }
};

if (
  document.readyState === "loading" &&
  typeof delayedStartupPromise === "undefined"
) {
  window.addEventListener("DOMContentLoaded", runAfterStartup, { once: true });
} else {
  runAfterStartup();
}
