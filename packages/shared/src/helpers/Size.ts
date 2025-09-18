export class Size {
  private _bytes: number;
  constructor(bytes: number) {
    this._bytes = bytes;
  }

  get bytes() {
    return this._bytes;
  }

  get gigabytes() {
    return this._bytes / (1024 * 1024 * 1024);
  }

  static fromBytes(bytes: number) {
    return new Size(bytes);
  }

  static fromGigabytes(gigabytes: number) {
    return new Size(gigabytes * 1024 * 1024 * 1024);
  }
}
