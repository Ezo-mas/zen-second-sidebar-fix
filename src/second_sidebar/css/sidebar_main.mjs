export const SIDEBAR_MAIN_CSS = `
  #sb2-main {
    display: flex;
    flex-direction: column;
    justify-content: var(--sb2-main-web-panel-buttons-position);
    gap: var(--space-small);
    top: 0;
    height: 100%;
    padding: 0 var(--sb2-main-padding) var(--space-small) var(--sb2-main-padding);
    overflow-y: scroll;
    scrollbar-width: none;

    &[overlay="true"] {
      position: absolute;
      z-index: 9999;
      background-color: var(--toolbox-bgcolor);
      box-shadow: var(--content-area-shadow);

      @media (-moz-windows-mica) {
        backdrop-filter: blur(32px);
        background-color: light-dark(rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0.6));
      }
    }

    toolbarpaletteitem[place="panel"][id^="wrapper-customizableui-special-spring"], toolbarspring {
      flex: 1;
      min-height: 10px;
      max-height: 112px;
      min-width: unset;
      max-width: unset;
    }

    .toolbaritem-combined-buttons {
      justify-content: center;
      margin-inline: 0;
    }

    .toolbarbutton-1 {
      padding: 0 !important;
    }
  }

  :root:has(#zen-tabbox-wrapper) {
    &:has(#sb2-wrapper[position="right"]):not([zen-right-side="true"]) #zen-tabbox-wrapper {
      margin-right: 0;
    }

    &:has(#sb2-wrapper[position="left"])[zen-right-side="true"] #zen-tabbox-wrapper {
      margin-left: 0;
    }

    #sb2-main {
      height: 100%;
      margin-block: 0;
      min-width: calc(var(--zen-toolbar-button-size, 16px) + var(--toolbarbutton-padding-outer, 4px) * 2 + var(--zen-toolbar-button-inner-padding, 6px) * 2);
      background: var(--sb2-zen-surface);
      color: var(--toolbox-textcolor, var(--sidebar-text-color));
      border: var(--sb2-zen-border);
      box-shadow: none;
      box-sizing: border-box;
      scrollbar-width: none;
      backdrop-filter: blur(24px);
    }

    #sb2-wrapper[position="right"] #sb2-main {
      margin-inline-start: var(--zen-element-separation, 6px);
      margin-inline-end: 0;
      border-radius: var(--sb2-zen-radius) 0 0 var(--sb2-zen-radius);
      border-inline-end: none;
      box-shadow: -2px 0 8px color-mix(in srgb, black 12%, transparent);
    }

    #sb2-wrapper[position="left"] #sb2-main {
      margin-inline-start: 0;
      margin-inline-end: var(--zen-element-separation, 6px);
      border-radius: 0 var(--sb2-zen-radius) var(--sb2-zen-radius) 0;
      border-inline-start: none;
      box-shadow: 2px 0 8px color-mix(in srgb, black 12%, transparent);
    }

    #sb2-main[overlay="true"] {
      background: var(--sb2-zen-overlay-surface);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--toolbox-textcolor, currentColor) 12%, transparent),
        var(--sb2-zen-shadow);
    }

    .sb2-main-button {
      border-radius: var(--toolbarbutton-border-radius, 6px);
    }

    .sb2-main-button > stack.toolbarbutton-badge-stack {
      border-radius: var(--toolbarbutton-border-radius, 6px);
    }

    .sb2-main-button:hover > stack.toolbarbutton-badge-stack {
      background: var(--sb2-zen-surface-hover) !important;
    }

    .sb2-main-button[open] > stack.toolbarbutton-badge-stack,
    .sb2-main-button[checked] > stack.toolbarbutton-badge-stack {
      background: var(--sb2-zen-surface-active) !important;
    }
  }

  #sb2-main[fullscreenShouldAnimate] {
    transition: 0.8s margin-right ease-out, 0.8s margin-left ease-out;
  }

  #sb2-main[shouldAnimate] {
    transition: 0.2s margin-right ease-out, 0.2s margin-left ease-out;
  }

  :root[customizing] {
    #sb2-main {
      min-width: unset !important;
      margin-left: 0px !important;
      margin-right: 0px !important;
    }
  }

  .sb2-main-button {
    position: relative;
    padding: 0;

    .sb2-sound-icon {
      position: relative;
      display: none;
      height: 16px;
      width: 16px;
      top: calc(var(--toolbarbutton-inner-padding, var(--toolbarbutton-padding-inner)) + 2px);
      right: calc(-1 * var(--toolbarbutton-inner-padding, var(--toolbarbutton-padding-inner)) - 2px);
      padding: 2px;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: var(--border-radius-circle);
      background-color: color-mix(in srgb, var(--toolbar-bgcolor, var(--toolbar-background-color)) 50%, transparent);
      fill: var(--toolbar-color, var(--toolbar-text-color));

      &[soundplaying] {
        display: flex;
        background-image: url("chrome://browser/skin/tabbrowser/tab-audio-playing-small.svg");
      }

      &[muted] {
        display: flex;
        background-image: url("chrome://browser/skin/tabbrowser/tab-audio-muted-small.svg");
      }

      &[hidden] {
        display: none;
      }
    }

    .sb2-notification-badge {
      display: none;
      position: relative;
      justify-content: center;
      align-items: center;
      width: 16px;
      height: 16px;
      top: calc(-1 * var(--toolbarbutton-inner-padding, var(--toolbarbutton-padding-inner)) - 2px);
      right: calc(-1 * var(--toolbarbutton-inner-padding, var(--toolbarbutton-padding-inner)) - 2px);
      border-radius: var(--border-radius-circle);
      background-color: color-mix(in srgb, var(--toolbar-bgcolor, var(--toolbar-background-color)) 50%, transparent);

      &[value] {
        display: flex;
      }

      &[hidden] {
        display: none;
      }

      span {
        color: var(--toolbar-color, var(--toolbar-text-color));
      }
    }
  }

  .sb2-main-button[temporary="true"] > stack.toolbarbutton-badge-stack {
    background-color: var(--attention-dot-color) !important;
  }

  .sb2-main-button:not([image]):not([loading]) .toolbarbutton-icon {
    list-style-image: url("chrome://global/skin/icons/security.svg");
  }

  .sb2-main-button[loading] .toolbarbutton-icon {
    list-style-image: url("chrome://global/skin/icons/loading.svg");
  }

  .sb2-main-button[unloaded="true"] {
    .toolbarbutton-icon {
      opacity: var(--toolbarbutton-disabled-opacity, var(--toolbarbutton-opacity-disabled));
    }
  }

  #widget-overflow-fixed-list .sb2-main-button {
    padding: var(--arrowpanel-menuitem-padding);
  }

  :root:has(#sb2-wrapper[position="left"]) {
    #sb2-main {
      left: 0;
    }

    #sb2-collapse-button {
      list-style-image: url("chrome://userscripts/content/second_sidebar/icons/sidebar-left.svg");
    }
  }

  :root:has(#sb2-wrapper[position="right"]) {
    #sb2-main {
      right: 0;
    }

    #sb2-collapse-button {
      list-style-image: url("chrome://userscripts/content/second_sidebar/icons/sidebar-right.svg");
    }
  }

  @media -moz-pref("browser.nova.enabled") {
    #sb2-main {
      background-color: var(--toolbar-background-color);
    }
  }
`;
