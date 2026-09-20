export class WebPanelState {
  /**
   *
   * @param {string} uuid
   * @param {object} params
   * @param {string?} params.lastUrl
   */
  constructor(uuid, { lastUrl = null } = {}) {
    this.uuid = uuid;
    this.lastUrl = lastUrl;
  }

  /**
   *
   * @param {object} object
   * @returns {WebPanelState}
   */
  static fromObject(object) {
    return new WebPanelState(object.uuid, object);
  }

  /**
   *
   * @returns {object}
   */
  toObject() {
    return { ...this };
  }
}
