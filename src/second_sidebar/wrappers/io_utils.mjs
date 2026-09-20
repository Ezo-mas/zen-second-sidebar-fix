export class IOUtilsWrapper {
  /**
   *
   * @param {string} path
   * @param {string} data
   */
  static async writeUTF8(path, data) {
    const options = { tmpPath: path + ".tmp" };
    await IOUtils.writeUTF8(path, data, options);
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<string>}
   */
  static async readUTF8(path) {
    return await IOUtils.readUTF8(path);
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<boolean>}
   */
  static async exists(path) {
    return await IOUtils.exists(path);
  }

  /**
   *
   * @param {string} path
   */
  static async remove(path) {
    await IOUtils.remove(path);
  }
}
