/** A basic rectangle shape. */
export class Rect<T = number> {

  /**
   * @param width Width of the rectangle.
   * @param height Height of the rectangle.
   */
  constructor(public width: T, public height: T) {}

  /** Returns the rectangle size on the main axis. */
  public main(row: boolean): T {
    return row ? this.width : this.height;
  }

  /** Returns the rectangle size on the cross axis. */
  public cross(row: boolean): T {
    return row ? this.height : this.width;
  }

  public setMain(row: boolean, value: T): void {
    if (row) {
      this.width = value;
    }
    else {
      this.height = value;
    }
  }

  public setCross(row: boolean, value: T): void {
    if (row) {
      this.height = value;
    }
    else {
      this.width = value;
    }
  }

  public set(width: T, height: T): this {
    this.width = width;
    this.height = height;

    return this;
  }

}
