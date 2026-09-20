/**
 * Runs `fn`, logging and swallowing any exception instead of letting it
 * propagate. Useful for isolating calls into Firefox/Gecko internals that
 * can throw for reasons outside our control (see WebPanelController#removeTab
 * and urlbar_input_patcher.mjs for a concrete example: closing a web panel
 * tab can trigger a Gecko-internal urlbar reformat that throws) so one bad
 * internal call can't corrupt our own state or interrupt an event handler
 * partway through.
 *
 * @param {function():void} fn
 * @param {string} errorMessage
 * @returns {boolean} true if `fn` ran without throwing
 */
export function safeCall(fn, errorMessage) {
  try {
    fn();
    return true;
  } catch (error) {
    console.error(errorMessage, error);
    return false;
  }
}
