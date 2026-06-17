export const COMMON_CSS = `
  @import url("chrome://global/content/elements/moz-toggle.css");

  :root {
    --sb2-main-padding: var(--space-small);
    --sb2-main-web-panel-buttons-position: start;
    --sb2-zen-radius: var(--zen-native-inner-radius, var(--border-radius-medium));
    --sb2-zen-surface: var(--zen-toolbar-element-bg, color-mix(in srgb, currentColor 15%, transparent));
    --sb2-zen-toolbar-surface: transparent;
    --sb2-zen-surface-hover: var(--zen-toolbar-element-bg-hover, color-mix(in srgb, currentColor 10%, transparent));
    --sb2-zen-surface-active: var(--toolbarbutton-active-background, color-mix(in srgb, currentColor 14%, transparent));
    --sb2-zen-border: var(--zen-appcontent-border, 0.5px solid var(--sidebar-border-color));
    --sb2-zen-shadow: var(--zen-big-shadow, var(--content-area-shadow));
  }

  #browser,
  #zen-tabbox-wrapper {
    position: relative;
  }
`;
