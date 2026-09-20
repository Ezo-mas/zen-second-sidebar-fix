import { ChromeRegistry } from "../wrappers/chrome_registry.mjs";
import { DirectoryServiceWrapper } from "../wrappers/directory_service.mjs";
import { IOUtilsWrapper } from "../wrappers/io_utils.mjs";
import { PathUtilsWrapper } from "../wrappers/path_utils.mjs";

// fx-autoconfig (and compatible loaders) register this alias for the
// profile's chrome/ directory, making chrome://userchrome/content/<path>
// directly importable. Loaders that don't register it (e.g. Sine) fall
// back to a plain file:// URL for the same file - see makeImportableURL.
const CONTENT_URL = "chrome://userchrome/content/";

/**
 *
 * @param {string} relativePath
 * @param {string} data
 * @returns {Promise<string>} a URL the written file can be dynamically imported from
 */
export async function writeFile(relativePath, data) {
  const path = makePath(relativePath);
  await IOUtilsWrapper.writeUTF8(path, data);
  return makeImportableURL(relativePath, path);
}

/**
 *
 * @param {string} relativePath
 * @returns {Promise<string>}
 */
export async function readFile(relativePath) {
  const path = makePath(relativePath);
  return await IOUtilsWrapper.readUTF8(path);
}

/**
 *
 * @param {string} relativePath
 * @returns {Promise<boolean>}
 */
export async function fileExists(relativePath) {
  const path = makePath(relativePath);
  return await IOUtilsWrapper.exists(path);
}

/**
 *
 * @param {string} relativePath
 */
export async function removeFile(relativePath) {
  const path = makePath(relativePath);
  await IOUtilsWrapper.remove(path);
}

/**
 * Resolves a path under the profile's chrome/ directory directly (see
 * DirectoryServiceWrapper), independent of any userChrome loader's own
 * chrome:// alias registration.
 *
 * @param {string} relativePath
 * @returns {string}
 */
function makePath(relativePath) {
  const resourcePathParts = PathUtilsWrapper.split(
    DirectoryServiceWrapper.profileChromeDir,
  );
  const relativePathParts = relativePath.split("/");
  return PathUtilsWrapper.join(resourcePathParts.concat(relativePathParts));
}

/**
 * Builds a URL the file at `path` can be dynamically imported from.
 *
 * @param {string} relativePath
 * @param {string} path
 * @returns {string}
 */
function makeImportableURL(relativePath, path) {
  try {
    // Verify the alias actually resolves rather than just assuming it -
    // some loaders (e.g. Sine) don't register it.
    ChromeRegistry.convertChromeURL(CONTENT_URL);
    return CONTENT_URL + relativePath;
  } catch {
    return DirectoryServiceWrapper.fileURIFromPath(path);
  }
}
