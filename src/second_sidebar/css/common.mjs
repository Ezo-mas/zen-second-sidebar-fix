export const COMMON_CSS = `
  @import url("chrome://global/content/elements/moz-toggle.css");

  :root {
    --sb2-main-padding: var(--space-small);
    --sb2-main-web-panel-buttons-position: start;
    --sb2-zen-radius: var(--zen-border-radius, var(--border-radius-medium));
    --sb2-zen-toolbar-surface: var(--zen-colors-tertiary, var(--toolbar-bgcolor));
    --sb2-zen-surface-hover: var(--zen-colors-secondary, color-mix(in srgb, currentColor 10%, transparent));
    --sb2-zen-surface-active: var(--toolbarbutton-active-background, color-mix(in srgb, currentColor 14%, transparent));
    --sb2-zen-border: none;
    --sb2-zen-shadow: var(--content-area-shadow);
  }

  #browser,
  #zen-tabbox-wrapper {
    position: relative;
  }
`;
