# Repository guidance

## Project and runtime

Second Sidebar is a privileged Firefox and Zen Browser userChrome.js script loaded
through fx-autoconfig, [Sine](https://github.com/CosmoCreeper/Sine) (via the
`theme.json` manifest at the repo root), or a compatible script loader. It adds
a second sidebar and web panels to the browser UI. This repository is adapted
for **Zen Browser** while maintaining compatibility with standard Firefox. It
is not a WebExtension or a Node.js/web application: there is no bundler,
development server, or build step. Deploy the contents of `src/` as-is (for
Sine, `theme.json` does this automatically - see "Loader portability" below).

Read `README.md` for features and installation, and the relevant implementation
before changing behavior. Follow applicable user-level agent instructions;
keep machine-specific subagent configuration outside this repository.

## Code map

All paths below are relative to `src/second_sidebar/`, except the entry point.

| Location                                       | Responsibility                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/second_sidebar.uc.mjs`                    | Waits for Firefox/Zen startup, skips nested panel windows, injects and decorates sidebar. |
| `sidebar_injector.mjs`                         | Loads settings/state, creates elements and controllers, then applies settings/state.      |
| `sidebar_elements.mjs`, `browser_elements.mjs` | Sidebar element registry and access to existing browser chrome elements.                  |
| `sidebar_controllers.mjs`                      | Creates and connects controllers in dependency order.                                     |
| `controllers/`                                 | Sidebar/panel behavior, geometry, shortcuts, popup actions, and cross-window events.      |
| `xul/`, `xul/base/`                            | UI components and shared fluent wrappers around XUL/HTML elements.                        |
| `css/`, `sidebar_decorator.mjs`                | CSS template-string exports, combined and injected into the chrome document.              |
| `settings/`                                    | Defaults, serialization, persisted settings, and panel state.                             |
| `wrappers/`                                    | Adapters for privileged Firefox/Gecko globals and services.                               |
| `patchers/`                                    | Compatibility patches for Firefox/Zen UI implementation.                                  |
| `utils/browser_layout.mjs`                     | Browser container resolution (`#zen-tabbox-wrapper` for Zen, `#browser` for Firefox).     |
| `utils/`, `icons/`                             | Shared helpers and SVG assets.                                                            |

## Implementation conventions

- Use ES modules with explicit relative `.mjs` imports. Follow the existing
  two-space indentation, double quotes, semicolons, and Prettier formatting.
  Files use `snake_case`; classes use `PascalCase`; methods use `camelCase`.
- Keep JSDoc consistent with nearby code. Some imports exist only for JSDoc and
  use a targeted `no-unused-vars` suppression; do not remove their type context
  just to silence lint.
- Put behavior in controllers, UI construction in `xul/`, and Firefox API access
  in the corresponding wrapper. Reuse `XULElement` and `utils/xul.mjs` helpers.
  Preserve the XUL/HTML element distinction.
- Support both Zen Browser and standard Firefox layout hierarchies. Avoid hardcoding
  `#browser` when attaching or sizing wrappers; use `requireBrowserContainerElement()`
  or selectors targeting `#zen-tabbox-wrapper, #browser`.
- Use existing `sb2-` IDs/classes and `--sb2-` CSS variables for new sidebar
  styles. In Zen Browser, adhere to `--sb2-zen-*` theme variables, `--zen-border-radius`,
  `--zen-element-separation`, and `--zen-colors-*`. Preserve `:root:has(#zen-tabbox-wrapper)`
  and `[zen-right-side="true"]` rules. Add new CSS exports to `sidebar_decorator.mjs`
  when they need to be injected.
- Match native theme tokens and controls. Keep keyboard focus, shortcuts, tooltips,
  and both sidebar positions working across both browsers.
- When uncollapsing the sidebar in controllers, remove inline margin properties
  (`removeProperty("margin-right")` / `removeProperty("margin-left")`) rather than
  forcing `0px`, allowing Zen's flex/grid layout engine to position adjacent content correctly.
- `MozButton` and `Toggle` wrap HTML custom elements with `isXUL: false`;
  popup/menu wrappers use XUL. Reuse their factories when adding controls.
- Before changing layout CSS, trace the controller that sets the element's
  attributes and geometry. Keep calculated dimensions/offsets in the geometry
  flow; physical panel anchors are not interchangeable with logical CSS spacing.
  Preserve theme-token fallbacks and affected `browser.nova.enabled` rules.
- Update the README when user-visible features or installation steps change.
  Keep edits focused; avoid unrelated formatting or framework/toolchain changes.
- Use `Logger.debug` (`utils/logger.mjs`) for verbose, per-action logging
  (tab lifecycle, per-setting change events, timer state) - it's gated
  behind the `second-sidebar.debug-logging` pref so normal use doesn't spam
  the Browser Console. Reserve plain `console.log` for one-time
  startup/lifecycle announcements (e.g. "X was patched", "Loading Y..."),
  and always use `console.error`/`console.warn` directly for real problems -
  never gate those behind the debug pref.
- Use `safeCall` (`utils/errors.mjs`) to isolate a call into a Firefox/Gecko
  internal that's known (or suspected) to throw unpredictably, so the throw
  can't corrupt this addon's own state or interrupt an event handler
  partway through. See `WebPanelController#removeTab` for the reference
  usage; the underlying issue is documented in `urlbar_input_patcher.mjs`.
- For a new "call one setter, maybe with a small fixed follow-up" web panel
  setting, wire it in `web_panels.mjs` via `#bindSimpleSetting` (or
  `#bindGeometrySetting` for floating-geometry fields, `#bindSimpleAction`
  for no-argument actions) rather than a bespoke `listenEvent` block.
  Settings with real branching logic (different values calling different
  methods, debounced timeouts, reload-if-changed checks) stay hand-written
  alongside the bound ones in `#setupListeners`.
- Settings classes that are a flat bag of primitive fields (`SidebarSettings`,
  `WebPanelState`, `FloatingWebPanelGeometrySettings`) implement
  `fromObject`/`toObject` by spreading the source object/instance rather
  than listing every field three times; only override the fields that need
  special handling (nested settings objects, computed defaults). Classes
  with those - `WebPanelSettings` (nested `floatingGeometry`/
  `pinnedGeometry`) and the collection wrappers (`WebPanelsSettings`,
  `WebPanelsState`) - use spread for their flat fields too but keep the
  nested/collection parts explicit; don't force a fully generic schema over
  them.

## Changing settings

Follow an existing setting through these files under `src/second_sidebar/`:

- Sidebar: `xul/sidebar_main_popup_settings.mjs` →
  `controllers/sidebar_main_settings.mjs` → `controllers/events.mjs` → the
  receiving controller → `settings/sidebar_settings.mjs`.
- Panel editing: `xul/web_panel_popup_edit.mjs` →
  `controllers/web_panel_edit.mjs` → `controllers/events.mjs` →
  `controllers/web_panels.mjs` (bind it with `#bindSimpleSetting` /
  `#bindGeometrySetting` / `#bindSimpleAction` unless it needs real branching
  logic) / `controllers/web_panel.mjs` → `settings/web_panel_settings.mjs`.
  Also check the new-panel popup/controller when the setting should be
  available during creation.

Both settings dialogs apply changes live. Their Cancel handlers only close the
popup; Save persists the current settings. Do not assume Cancel restores the
previous values when extending these flows.

Settings export/import (sidebar settings popup → `sidebar_main_settings.mjs`)
writes a single JSON file: `{ version, exportedAt, sidebarSettings, webPanels }`
(state such as `lastUrl` is deliberately excluded - see above). Import writes
straight to the same storage `SidebarSettings`/`WebPanelsSettings.save()`
already use rather than hot-applying live, since a wholesale replacement can
add/remove entire panels and containers at once; a restart picks it up like
any fresh window. Bump `EXPORT_VERSION` in that file only for a breaking
shape change (a field renamed/repurposed) - a new optional field doesn't need
it, since the settings classes' own constructor defaults already backfill it
for older exports.

## Invariants and sensitive areas

- **Loader portability (fx-autoconfig vs Sine)**: this addon's own files are
  served from different chrome:// origins depending on the loader
  (`chrome://userscripts/content/...` under fx-autoconfig,
  `chrome://sine/content/<mod-id>/...` under Sine). Never hardcode one
  loader's origin when referencing this addon's own assets:
  - Module-to-module imports already use relative `./`/`../` paths - keep it
    that way; never import a sibling module via an absolute `chrome://` URL.
  - To reference a sibling asset (an icon, etc.) from CSS or elsewhere,
    resolve it from the current module's own URL with
    `new URL("../relative/path", import.meta.url).href` (see
    `css/sidebar_main.mjs`), not a hardcoded `chrome://` prefix.
  - To resolve a filesystem path (e.g. for `IOUtils`), use
    `DirectoryServiceWrapper.profileChromeDir` (`wrappers/directory_service.mjs`,
    backed by Gecko's "UChrm" directory-service key) instead of resolving a
    loader-registered chrome:// alias - it works under any loader.
  - `utils/files.mjs`'s `writeFile()` still has to return a URL its three
    `patchers/*.mjs` callers can `import()` (they write a patched copy of a
    Firefox internal module, then dynamically import it back in). It tries
    fx-autoconfig's `chrome://userchrome/content/` alias first (verified via
    `ChromeRegistry.convertChromeURL`, not just assumed), and falls back to a
    plain `file://` URL via `DirectoryServiceWrapper.fileURIFromPath()` when
    that alias isn't registered. Keep that fallback if you touch this file -
    it's the difference between those three patchers working under Sine or not.
- **`theme.json`** (repo root) is this fork's Sine mod manifest. Its `scripts`
  field deliberately points at `src/second_sidebar.uc.mjs`'s real, nested
  path rather than assuming a flattened repo - see "Why `src/` stays" below.
  Only the entry point needs listing there; everything it imports is resolved
  by the JS module loader itself, not by Sine's own script registry. Its
  `include` pattern scopes loading to `browser.xhtml` (matching what
  fx-autoconfig already restricts `.uc.mjs` loading to); dropping it would
  make Sine dynamically import this script into every chrome window,
  including ones lacking `gBrowser`/the sidebar's expected DOM.
- **Sine's `sine.allow-unsafe-js` gate**: this is not something this repo
  controls, but it's the single most likely reason "installed via Sine but
  the sidebar never appears" gets reported (common Sine loader triage).
  In `core/utils.sys.mjs`'s `getScripts()`, a mod's scripts are only ever
  added to Sine's load list when `this.allowUnsafeJS || mod.origin ===
  "store"`. A mod installed by pasting a repository (as opposed to Sine's
  own reviewed marketplace) has `origin` unset, so unless the user has set
  `sine.allow-unsafe-js` to `true` in `about:config`, the script is never
  even attempted - no `include`/`exclude` check, no import, no console
  output, nothing. If a Sine install "does nothing" with an otherwise-clean
  console, check this pref before suspecting `theme.json` or the script
  itself.
- **fx-autoconfig and Sine share one `config.js` per browser installation,
  not per profile.** Both work by pointing Firefox's
  `general.config.filename` at a single bootstrap file inside the browser's
  install directory - there can only be one active at a time. Installing
  Sine's bootloader for any one profile replaces that shared file, silently
  disabling fx-autoconfig's own `chrome/JS/`-scanning bootstrap on **every
  other profile on the same installation**, not just the one Sine was set
  up on. Sine's own mod registry (`mods.json`) is per-profile, so a profile
  that only had this addon copied into `chrome/JS/` the old way ends up
  with _no_ loader running it at all once this happens - not a caching
  issue, not a code regression, just no active bootstrap left that knows
  about it. This was the actual root cause behind multi-profile loader
  conflict reports once traced fully: it isn't "doesn't detect Sine's startup"
  (that part is the `browser-delayed-startup-finished` fallback above), it's
  "a sibling profile's Sine install silently retired the loader this profile
  depended on." Don't assume a report of "stopped working after installing
  Sine" is about the same profile Sine was added to - ask about sibling profiles
  on the same installation before chasing a code-level cause.
- **Why `src/` stays**: flattening `src/second_sidebar.uc.mjs` and
  `src/second_sidebar/` to the repo root would look tidier and match how
  small single-file Sine mods are usually laid out, but this fork's `src/`
  layout mirrors upstream's, which is what keeps `git merge upstream/master`
  (see the sync playbook below) tractable across ~150 files. `theme.json` can
  point into a nested path just fine, so don't flatten the repo "for
  cleanliness" - that trades a cosmetic win for permanent merge friction.
- **Double-injection guard**: `run()` in `second_sidebar.uc.mjs` sets a
  `sb2-injected` class on `BrowserElements.root` before doing anything else,
  and bails out if it's already set. This exists to protect against double
  loader setups: a profile with this addon set up both the old way (copied
  into fx-autoconfig's `chrome/JS/`) and the new way (installed as a Sine mod)
  could otherwise have both loaders inject into the same window, producing
  duplicate `#sb2-*` elements with colliding ids. Keep the class set
  synchronously, before the first `await`, so two near-simultaneous
  invocations can't both pass the check.
- Preserve startup ordering: wait for `UC_API.Runtime.startupFinished()` or
  `delayedStartupPromise` (fx-autoconfig) or the `browser-delayed-startup-finished`
  observer fallback in `second_sidebar.uc.mjs` (Sine, which defines neither
  global); skip `sb2-webpanels-window` and popup windows; load settings/state
  before creating elements, controllers, and applying values.
- Keep popup detection compatible with extension-created windows. A popup may
  expose `window.toolbar.visible === false` without listing `extrachrome` in its
  `chromehidden` attribute. Never inject `#sb2-wrapper` into these windows.
- `xul/web_panels_browser.mjs` hosts a nested chrome window whose tabs back the
  panels. Its startup observers, SessionStore handling, close commands, popup
  notifications, and URL-bar patches are part of the implementation.
  Validate changes to this code in a real browser instance.
- Every web panel tab is created with `tab.setUndiscardable(true)`
  (`xul/base/tab.mjs`) so Firefox's automatic memory-pressure tab unloader
  can't silently discard one out from under `WebPanelController`'s own
  `#tab` state - being playing-audio or selected only deprioritizes a tab
  for that unloader, it doesn't exempt it, and that hidden window isn't
  reliably recognized as "foreground" either. If a future Firefox/Zen build
  drops or renames this property, `addWebPanelTab` logs a `console.warn`
  (not gated behind `Logger.debug`) - don't silence that without addressing
  the underlying exposure. Panels are only meant to unload through
  `WebPanelController#unload`/`close()` (including its own
  `unloadAfterInactivity` timer), never through Firefox's own unloader.
- `WebPanelController#unload`/`#removeTab` wrap the actual
  `gBrowser.removeTab()` call in `safeCall` because a Gecko-internal urlbar
  reformat inside `permitUnload` can throw there (see the long comment in
  `urlbar_input_patcher.mjs`); losing that wrapper reintroduces a bug where
  a "closed" panel's tab silently stays alive in the background.
- **Zen Browser chrome containment**: Zen wraps its tabbox and content inside
  `#zen-tabbox-wrapper`. `SidebarBoxArea` (`xul/sidebar_box_area.mjs`) calculates
  dimensions relative to `#zen-tabbox-wrapper` and reserves spacing using
  `--zen-element-separation` (defaulting to 6px) and wrapper side positioning.
- **Nested panel isolation in Zen**: The embedded chrome window hosting web panels
  must be flagged with `win._zenStartupSyncFlag = "unsynced"` and
  `zen-unsynced-window="true"` during creation and startup observers. This stops
  Zen from treating the panel's internal window as a syncable workspace or tabbox.
  Also ensure `#zen-appcontent-navbar-wrapper` remains hidden inside panel chrome.
- **GPU compositing on Windows (Zen)**: Switching or showing web panels on Windows
  under Zen can occasionally leave a blank frame. `WebPanelsBrowser.forceRepaint()`
  briefly toggles `opacity: 0.9999` to force the compositor to paint content.
- Reuse widget readiness helpers such as `doWhenButtonReady`; CustomizableUI
  instances are not always available synchronously in every window.
- Use `controllers/events.mjs` for cross-window actions. Preserve event names,
  UUIDs, payload fields, and `isActiveWindow` behavior. Permanent panels are
  shared across windows; temporary creation is limited to the active window.
- Settings are JSON string preferences: `second-sidebar.settings`,
  `second-sidebar.web-panels`, and `second-sidebar.web-panels-state`. Preserve
  saved user data and defaults for missing fields. When adding a setting, update
  its model, load/save or `fromObject`/`toObject` paths, UI, and event handling
  together. Keep panel settings distinct from state such as `lastUrl`.
- Preserve container identity and the existing loading/security context when
  creating or navigating panel tabs. Account for temporary panels, unload on
  close, reload timers, listeners, and observers when changing panel lifecycle.
- Browser internals are version-sensitive. For patcher changes, inspect the
  actual target browser source and verify the text/regex replacement still matches.
  Preserve temporary-module cleanup in `utils/files.mjs`. Keep these patches
  isolated rather than spreading source rewriting through controllers.

## Static checks

There is no tracked package manifest, lockfile, npm script, or automated test
suite. `.gitignore` excludes `package.json`, `package-lock.json`, and
`node_modules`; these may exist locally but are not the project contract.
The tracked check definitions are `eslint.config.mjs`, `.prettierrc`, and
`.github/workflows/`.

For a checkout without local tooling, install the lint/format tools from the
repository root (this is development setup, not a runtime dependency):

```sh
npm install --no-save --package-lock=false eslint@9.7.0 @eslint/js@9 globals@15 prettier@3
```

Run the checks relevant to changed files:

```sh
npx eslint .
npx prettier --check "src/**/*.mjs" "*.mjs" "*.md" "*.json" ".github/workflows/*.yml"
git diff --check
```

For documentation-only edits, check formatting on the edited Markdown files.
For targeted formatting fixes, use `npx prettier --write <changed-files>`.
Do not reformat unrelated files to clear an existing repository-wide failure.
On PowerShell, `npm.cmd`/`npx.cmd` can be used if `.ps1` launchers are blocked.

CI installs ESLint 9.7.0 and uploads SARIF using
`@microsoft/eslint-formatter-sarif@3.1.0`. The lint step no longer uses
`continue-on-error` (removed once the repo reached a clean baseline) - a
lint error now fails the workflow, so don't reintroduce that flag as a way
to land something that doesn't pass. The Prettier workflow uses a dry run
via `creyD/prettier_action@v4.3`, which may pin a different Prettier minor
version than what `npm install prettier@3` gives you locally; a newer local
Prettier can flag large swaths of untouched, previously-clean files that
CI's pinned version wouldn't. Treat a `prettier --check` failure spanning
files you didn't touch as this version drift, not a real regression - per
above, only reformat files this change actually edited. Add legitimate
Firefox/Zen globals to the existing ESLint globals list when needed, rather
than broadly disabling rules; note that VS Code's built-in JS language
service checks JSDoc `@param`/global references independently of ESLint's
globals list (it has its own, separate set of gaps - e.g. it doesn't know
about `BrowsingContext` even though ESLint does), so a stray IDE hint isn't
necessarily an ESLint config gap. Node syntax checks and lint cannot
validate privileged browser APIs or XUL UI.

A **Sync upstream** workflow (`.github/workflows/sync-upstream.yml`) runs every
Monday at 09:00 UTC and opens a Pull Request whenever `aminought/firefox-second-sidebar`
has new commits. It can also be triggered manually via **Actions → Sync upstream →
Run workflow**. A `SYNC_PAT` repository secret is required for full PR functionality;
see the workflow file header for setup instructions.

## Firefox and Zen Browser validation

Use a dedicated test profile with fx-autoconfig (or Zen's script loader):

1. Locate the test profile folder (in Firefox or Zen, navigate to `about:support`
   and click **Open Folder** / **Show in Finder** next to _Profile Folder_).
2. Copy `src/second_sidebar.uc.mjs` and `src/second_sidebar/` into the profile's
   `chrome/JS/` folder.
3. Ensure `toolkit.legacyUserProfileCustomizations.stylesheets` and
   `dom.allow_scripts_to_close_windows` are set to `true` in `about:config`.
4. Clear the startup cache (via `about:support` → **Clear startup cache...** or
   by deleting the `startupCache` directory inside the profile folder) and restart.

For changes to `theme.json`, the startup fallback in `second_sidebar.uc.mjs`,
or anything under "Loader portability" above, also install via Sine on a
separate test profile (add the repo as `<owner>/<repo>/tree/master` - the
explicit branch matters, see README) rather than assuming the fx-autoconfig
path alone covers it; the two loaders serve this addon's files from different
chrome:// origins.

Select manual scenarios according to the change:

- **General**: Startup, sidebar show/hide, left/right placement, toolbar customization.
- **Zen-specific scenarios**:
  - Zen vertical tabs / sidebar on left vs right (`[zen-right-side="true"]`).
  - Second sidebar positioned on the same side as Zen's tab bar vs opposite side.
  - Zen compact mode (collapsing Zen's sidebar) and auto-hide overlay behavior.
  - Zen split views and workspace switching while web panels are active.
  - Floating panel placement inside `#zen-tabbox-wrapper` and margin spacing.
  - Windows GPU rendering (ensuring web panels do not open as blank frames).
- **Panels**: Panel create/edit/delete, navigation, close/reopen, and temporary panels.
  Disable "Unload from memory after closing" for panel A, switch from panel A to
  panel B, then close panel B by clicking a browser tab. Confirm panel A does not
  reopen, and reopening panel A preserves its page and session state.
- **Geometry & Lifecycle**: Floating/pinned geometry, resizing, auto-hide, and shortcuts.
- **Multi-window**: A second browser window, propagation of edits, and persistence.
- **Tabs & Media**: Containers, zoom, mute, unload/reload, and permission popups.
- **Extension popups & passkeys**: With a panel open, start and cancel or complete
  a Bitwarden passkey prompt. Confirm the Bitwarden window has no `#sb2-wrapper`,
  its credential list is visible without unloading the panel, and the panel is
  still usable afterward. Open a normal browser window as a control and confirm
  the sidebar still loads there.
- **Theming**: Light/dark themes, Zen accent surfaces, and conditional theme tokens.

Check the Browser Console (`Ctrl+Shift+J` or `Cmd+Shift+J`) for errors. Record the
browser version (Firefox or Zen), operating system, and scenarios actually exercised.
If the browser cannot be run, state which runtime checks remain unverified.

## Upstream synchronization playbook

This fork tracks `aminought/firefox-second-sidebar` (upstream) while preserving
Zen Browser patches contributed by `Ezo-mas/zen-second-sidebar-fix`.

### Remote hierarchy

| Remote     | URL                                     | Purpose                         |
| ---------- | --------------------------------------- | ------------------------------- |
| `origin`   | `Ezo-mas/zen-second-sidebar-fix`        | Your fork (push target)         |
| `upstream` | `aminought/firefox-second-sidebar`      | Original source of truth        |

Always sync from `upstream` via the terminal or the **Sync upstream** workflow.

### Sync procedure

```sh
# 1. Fetch the latest upstream commits
git fetch upstream

# 2. Check how many new commits exist
git log HEAD..upstream/master --oneline

# 3. Merge into master
git checkout master
git merge upstream/master

# 4. Resolve conflicts (see hotspots below), then:
git add <resolved-files>
git commit
git push origin master
```

### Known conflict hotspots

These two files are the most likely to conflict because upstream changes their
code paths that were also modified by the Zen port:

1. **`src/second_sidebar/controllers/sidebar_main.mjs`** — `uncollapse()` method:
   - **Keep** `removeProperty("margin-right")` / `removeProperty("margin-left")`
     (Zen patch — allows Zen's flex engine to manage spacing).
   - **Accept** any new upstream additions to `#clearCollapseTransitionEndListener()`
     or other new methods alongside, rather than discarding them.

2. **`src/second_sidebar/css/common.mjs`** — `:root` CSS variable block:
   - **Keep** all `--sb2-zen-*` variable definitions (Zen patch).
   - **Accept** any new upstream `@media -moz-pref("browser.nova.enabled")` blocks.
   - **Keep** both `#browser,` and `#zen-tabbox-wrapper {` in the `position: relative`
     rule at the bottom of the file.

`theme.json`, `wrappers/directory_service.mjs`, and the loader-portability
fixes described above are fork-only additions upstream doesn't have, so
merges won't touch or conflict with them - but they also won't gain any
upstream improvements automatically. If upstream ever changes how
`css/sidebar_main.mjs` or `utils/files.mjs` resolve their own assets/paths,
re-apply the loader-portability treatment on top of upstream's version
rather than taking upstream's as-is.

### Zen compatibility checklist

Before committing any change to source files, verify:

- [ ] Container attachment uses `requireBrowserContainerElement()` (not bare `#browser`).
- [ ] New CSS selectors target `#zen-tabbox-wrapper` alongside `#browser` where needed.
- [ ] Sidebar uncollapse uses `removeProperty("margin-right")` / `removeProperty("margin-left")`
      rather than setting `0px` inline.
- [ ] Nested panel windows are marked with `_zenStartupSyncFlag = "unsynced"` and
      `zen-unsynced-window="true"`.
- [ ] New `--sb2-*` CSS variables have Zen-aware fallbacks using `--sb2-zen-*` tokens.
- [ ] Both `[zen-right-side="true"]` sidebar positions work correctly.
- [ ] `WebPanelsBrowser.forceRepaint()` is called after tab switches on Windows.
- [ ] `npx prettier --write` and `npx eslint` both pass on changed files.

## Upstream references

- [fx-autoconfig installation and startup cache](https://github.com/MrOtherGuy/fx-autoconfig)
- [Zen Browser Desktop Repository](https://github.com/zen-browser/desktop)
- [Zen Second Sidebar Fix Fork](https://github.com/Ezo-mas/zen-second-sidebar-fix)
- [Upstream Firefox Second Sidebar Repository](https://github.com/aminought/firefox-second-sidebar)
- [Searchfox: Firefox source and internal APIs](https://searchfox.org/firefox-main/source/)
- [Firefox desktop components](https://firefoxux.github.io/firefox-desktop-components/)
