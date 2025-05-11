/**
 * Error linked to filesystem operations.
 *
 * @class FileSystemError
 * @extends Error
 */
export default class FileSystemError extends Error {
  /**
   * @param {string} code
   * @param {string} reason
   * @param {Object|undefined} [context]
   */
  constructor(code, reason) {
    super(`${code}: ${reason}`);
    // @see https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    Object.setPrototypeOf(this, FileSystemError.prototype);

    this.name = "FileSystemError";
    this.code = code;
  }
}
