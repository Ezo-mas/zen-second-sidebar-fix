export const BROWSER_CONTAINER_SELECTORS = ["#zen-tabbox-wrapper", "#browser"];
export const BROWSER_CONTAINER_SELECTOR =
  BROWSER_CONTAINER_SELECTORS.join(", ");

/**
 * @param {ParentNode} root
 * @returns {Element?}
 */
export function findBrowserContainerElement(root = document) {
  for (const selector of BROWSER_CONTAINER_SELECTORS) {
    const element = root.querySelector(selector);
    if (element) return element;
  }
  return null;
}

/**
 * @param {ParentNode} root
 * @returns {Element}
 */
export function requireBrowserContainerElement(root = document) {
  const element = findBrowserContainerElement(root);
  if (!element) {
    throw new Error(
      `Second Sidebar could not find a browser container (${BROWSER_CONTAINER_SELECTOR})`,
    );
  }
  return element;
}
