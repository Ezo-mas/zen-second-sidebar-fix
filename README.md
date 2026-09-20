> [!NOTE]
> This is a fork of [aminought/firefox-second-sidebar](https://github.com/aminought/firefox-second-sidebar), adapted for **Zen Browser** on top of Zen compatibility work from [Ezo-mas/zen-second-sidebar-fix](https://github.com/Ezo-mas/zen-second-sidebar-fix). Compared to upstream, this fork additionally provides:
>
> - Full Zen Browser layout support (vertical tabs, split view, workspaces, compact mode, and both sidebar sides) alongside standard Firefox.
> - Web panel setting: `Reload when address changes` — reloads a web panel when the main browser's active tab is switched or navigated to a different site.
> - Web panel setting: `Unload after inactivity` — automatically unloads a panel that's been in the background for a set time, without relying on Firefox's own background tab unloader (which isn't reliable for panels living in the hidden window that hosts them).
> - Sidebar setting: `Export settings` / `Import settings` — back up or restore the sidebar and all web panel settings as a single JSON file.
> - [Sine](https://github.com/CosmoCreeper/Sine) mod support (`theme.json`) alongside fx-autoconfig, so the script can be installed without manually copying files.
> - Windows GPU compositing fix so web panels don't render as a blank frame when switching.

A Firefox userChrome.js script that brings a second sidebar with web panels like in Vivaldi/Edge/Floorp but better.

<img width="2200" height="2131" alt="promo-rounded" src="https://github.com/user-attachments/assets/020ee8cf-1f3d-4184-98fe-889be89d6145" />

## Motivation

I've tried various browsers, such as Vivaldi, Edge, Floorp, and Zen, and they all have one thing in common that I can't imagine using a browser without — the sidebar. Unfortunately, Firefox, which I feel most closely aligns with my needs in terms of spirit and functionality, has a rather unsatisfactory sidebar. Therefore, I decided to create another one myself, with blackjack and hookers!

## Demo

https://github.com/user-attachments/assets/cd79d644-ca2c-4a30-ae8e-c265f41768b6

## Features

### Sidebar

- Actions: `Show` • `Hide`
- Customize via [Customize Toolbar...](https://support.mozilla.org/en-US/kb/customize-firefox-controls-buttons-and-toolbars)
- Settings:
  - General: `Position (Left / Right)` • `Width` • `Allow window dragging`
  - Visibility: `Auto-hide sidebar` • `Auto-hide behaiour (Inline / Overlay)` • `Hide web panel when sidebar is hidden` • `Set layout-independent shortcut to hide/show sidebar`
  - Web panel: `Default floating panel offset` • `New panel position (Before plus button / After plus button)` • `Show geometry hint` • `Set layout-independent shortcut to open/close the last active panel`
  - Web panel button: `Container indicator (Off / Left / Right / Top / Bottom / Around)` • `Tooltip (Off / Title / URL / Title and URL)` • `Show full URL in tooltip`
  - Web panel toolbar: `Auto-hide forward button` • `Auto-hide back button`
  - Animations: `Animate sidebar` • `Animate web panel toolbar`
  - Backup: `Export settings` • `Import settings`

### Web panels

- Actions: `Create` • `Delete` • `Edit` • `Change position and size` • `Reset position and size` • `Unload` • `Mute` • `Unmute` • `Pin` • `Unpin` • `Change zoom` • `Go back` • `Go forward` • `Reload` • `Go home`
- Extensions support
- Link context menu: `Open Link in Second Sidebar` • `Preview Link in Second Sidebar` (shown only for links that Firefox can open in a tab)
- Popup notifications support (permissions to use microphone/camera/location, etc.)
- Settings:
  - General: `URL` • `Multi-Account Container` • `Temporary` • `Mobile view` • `Zoom`
  - Title: `Dynamic` • `Set static title`
  - Favicon: `Dynamic` • `Set static favicon`
  - Position and size: `Mode (Floating / Pinned)` • `Always on top` • `Position anchor` • `Horizontal offset` • `Vertical offset` • `Width` • `Height`
  - Loading: `Load into memory at startup` • `Restore last opened page` • `Unload from memory after closing` • `Unload after inactivity` • `Periodic reload` • `Reload when address changes`
  - Keyboard shortcut: `Set layout-independent shortcut to hide/show web panel`
  - CSS selector: `Enable` • `Set CSS selector`
  - Hide elements: `Hide toolbar` • `Hide sound icon` • `Hide notification badge`

### Widgets

- `Second Sidebar` to show / hide sidebar

## Installation

Pick whichever loader you already use (or prefer) — both install the exact same script.

> [!IMPORTANT]
> Already have Second Sidebar working via fx-autoconfig and now adding Sine on top? Sine only loads scripts it knows about (added through its own mod manager) — it won't pick up files that were manually copied into fx-autoconfig's `chrome/JS/`, and if Sine's bootstrap ends up superseding fx-autoconfig's, that old copy can stop running entirely (this is what [#4](https://github.com/sinazadeh/zen-second-sidebar/issues/4) reports). Add it as a Sine mod using the instructions below, then remove `second_sidebar.uc.mjs` and `second_sidebar/` from `chrome/JS/` so it isn't set up two different ways at once.

### Sine (no manual file copying)

1. Install [Sine](https://github.com/CosmoCreeper/Sine) if you haven't already.
2. In Sine's mod manager, add a mod from a repository and enter:
   ```
   sinazadeh/zen-second-sidebar/tree/master
   ```
   The explicit `/tree/master` is required — this repo's default branch is `master`, and Sine assumes `main` when it's left off.
3. In `about:config`, set `sine.allow-unsafe-js` to `true`. This isn't specific to Second Sidebar: Sine only runs JavaScript automatically for mods installed from its own reviewed marketplace; anything added directly from a repository (like this, until/unless it's published there) needs this explicitly enabled, or its script is silently never loaded at all.
4. Enable `toolkit.legacyUserProfileCustomizations.stylesheets` and `dom.allow_scripts_to_close_windows` in `about:config` if not already enabled.
5. Restart the browser.

### fx-autoconfig (manual)

1. Install [fx-autoconfig](https://github.com/MrOtherGuy/fx-autoconfig).
2. Copy the contents of the `src/` directory (`second_sidebar/` and `second_sidebar.uc.mjs`) into `chrome/JS/`.
3. Enable `toolkit.legacyUserProfileCustomizations.stylesheets` and `dom.allow_scripts_to_close_windows` in `about:config`.
4. [Clear](https://github.com/MrOtherGuy/fx-autoconfig?tab=readme-ov-file#deleting-startup-cache) startup-cache.
5. Have fun!

## Backup

Use **Export settings** / **Import settings** (sidebar settings popup) to save or restore the sidebar and every web panel's settings as one JSON file. This covers configuration only, not per-panel state like the last-opened URL. Importing writes the file's settings to disk immediately; restart the browser afterward for the change to fully take effect.

## Troubleshooting

The Browser Console (`Ctrl+Shift+J` / `Cmd+Shift+J`) logs the sidebar's startup sequence and any errors by default. For more detail when reporting a bug (web panel lifecycle, per-setting change events, etc.), set `second-sidebar.debug-logging` to `true` in `about:config` and reproduce the issue again.
