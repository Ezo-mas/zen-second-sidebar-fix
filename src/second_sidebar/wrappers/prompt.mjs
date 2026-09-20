export class PromptServiceWrapper {
  /**
   *
   * @param {Window} window
   * @param {string} title
   * @param {string} text
   */
  static alert(window, title, text) {
    Services.prompt.alert(window, title, text);
  }
}
