import { ChromeRegistry } from "../wrappers/chrome_registry.mjs";
import { DirectoryServiceWrapper } from "../wrappers/directory_service.mjs";
import { IOUtilsWrapper } from "../wrappers/io_utils.mjs";
import { PathUtilsWrapper } from "../wrappers/path_utils.mjs";

// Persistent data (settings, state) lives directly under the profile's
// chrome/ directory (Gecko's own "UChrm" key - see DirectoryServiceWrapper),
// never inside a loader- or mod-manager-owned folder, so it survives addon
// updates/reinstalls under any loader (Sine deletes and re-extracts its
// entire mod folder - including anything written inside it - on every
// update).

/**
 *
 * @param {string} relativePath
 * @param {string} data
 */
export async function writeFile(relativePath, data) {
  const path = makeDataPath(relativePath);
  await IOUtilsWrapper.writeUTF8(path, data);
}

/**
 *
 * @param {string} relativePath
 * @returns {Promise<string>}
 */
export async function readFile(relativePath) {
  const path = makeDataPath(relativePath);
  return await IOUtilsWrapper.readUTF8(path);
}

/**
 *
 * @param {string} relativePath
 * @returns {Promise<boolean>}
 */
export async function fileExists(relativePath) {
  const path = makeDataPath(relativePath);
  return await IOUtilsWrapper.exists(path);
}

/**
 *
 * @param {string} relativePath
 */
export async function removeFile(relativePath) {
  const path = makeDataPath(relativePath);
  await IOUtilsWrapper.remove(path);
}

/**
 *
 * @param {string} relativePath
 * @returns {string}
 */
function makeDataPath(relativePath) {
  const rootParts = PathUtilsWrapper.split(
    DirectoryServiceWrapper.profileChromeDir,
  );
  return PathUtilsWrapper.join(rootParts.concat(relativePath.split("/")));
}

// A patched-module file (see patchers/*.mjs) is transient: written, then
// immediately dynamically imported back in, then deleted - every browser
// startup regenerates it, so unlike the persistent data above it doesn't
// need to survive a mod-folder wipe. Writing and importing it from
// alongside this addon's own already-loading files (resolved from this
// module's own URL, whatever chrome:// origin actually served it) keeps it
// on an origin dynamic import() is guaranteed to accept: a separate,
// loader-specific alias (fx-autoconfig's chrome://userchrome/content/) may
// not be registered under every loader, and a file:// fallback is blocked
// outright by the CSP some loaders (Sine) apply to dynamically imported
// scripts ("script-src chrome: resource: moz-src:" - no file:).
const SECOND_SIDEBAR_ROOT_URL = new URL("../", import.meta.url).href;

/**
 *
 * @param {string} relativePath
 * @param {string} data
 * @returns {Promise<string>} a URL the written file can be dynamically imported from
 */
export async function writePatchedModule(relativePath, data) {
  const path = makeSelfPath(relativePath);
  await IOUtilsWrapper.writeUTF8(path, data);
  return new URL(relativePath, SECOND_SIDEBAR_ROOT_URL).href;
}

/**
 *
 * @param {string} relativePath
 */
export async function removePatchedModule(relativePath) {
  const path = makeSelfPath(relativePath);
  await IOUtilsWrapper.remove(path);
}

/**
 *
 * @param {string} relativePath
 * @returns {string}
 */
function makeSelfPath(relativePath) {
  const rootFile = ChromeRegistry.convertChromeURL(
    SECOND_SIDEBAR_ROOT_URL,
  ).QueryInterface(Ci.nsIFileURL).file;
  const rootParts = PathUtilsWrapper.split(rootFile.path);
  return PathUtilsWrapper.join(rootParts.concat(relativePath.split("/")));
}
