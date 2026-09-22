# Zen Second Sidebar Enhanced

> [!NOTE]
> This is a fork of [aminought/firefox-second-sidebar](https://github.com/aminought/firefox-second-sidebar), adapted for **Zen Browser** on top of Zen compatibility work from [Ezo-mas/zen-second-sidebar-fix](https://github.com/Ezo-mas/zen-second-sidebar-fix). Compared to upstream, this fork additionally provides:
>
> - Full Zen Browser layout support (vertical tabs, split view, workspaces, compact mode, and both sidebar sides) alongside standard Firefox.
> - Web panel setting: `Reload when address changes` — reloads a web panel when the main browser's active tab is switched or navigated to a different site. For example, with a Bitwarden panel this reloads its vault view as you switch tabs, so it's always showing logins for whichever site you're currently on.
> - Web panel setting: `Unload after inactivity` — automatically unloads a panel that's been in the background for a set time, without relying on Firefox's own background tab unloader (which isn't reliable for panels living in the hidden window that hosts them).
> - Sidebar setting: `Export settings` / `Import settings` — back up or restore the sidebar and all web panel settings as a single JSON file.
> - [Sine](https://github.com/CosmoCreeper/Sine) mod support (`theme.json`) alongside fx-autoconfig, so the script can be installed without manually copying files.
> - Windows GPU compositing fix so web panels don't render as a blank frame when switching.

A Zen userChrome.js script that brings a second sidebar with web panels like in Vivaldi/Edge/Floorp but better.

<img width="2200" height="2131" alt="promo-rounded" src="https://github.com/user-attachments/assets/020ee8cf-1f3d-4184-98fe-889be89d6145" />

## Installation

Pick whichever loader you already use (or prefer) — both install the exact same script.

### Sine

1. Install [Sine](https://github.com/CosmoCreeper/Sine) if you haven't already.
2. In Sine's mod manager, add a mod from a repository and enter:
   ```
   sinazadeh/zen-second-sidebar-enhanced/tree/master
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

## Demo

https://github.com/user-attachments/assets/cd79d644-ca2c-4a30-ae8e-c265f41768b6

## Troubleshooting

The Browser Console (`Ctrl+Shift+J` / `Cmd+Shift+J`) logs the sidebar's startup sequence and any errors by default. For more detail when reporting a bug (web panel lifecycle, per-setting change events, etc.), set `second-sidebar.debug-logging` to `true` in `about:config` and reproduce the issue again.
