/** A basic rectangle shape. */
export interface ImmutableRect<T> {

  /** Width of the rectangle. */
  readonly width: T;

  /** Height of the rectangle. */
  readonly height: T;

  /** Returns the rectangle size on the main axis. */
  main(row: boolean): T;

  /** Returns the rectangle size on the cross axis. */
  cross(row: boolean): T;

}

/** A basic rectangle shape. */
export class Rect<T = number> implements ImmutableRect<T> {

  /**
   * @param width Width of the rectangle.
   * @param height Height of the rectangle.
   */
  constructor(public width: T, public height: T) {}

  public static option<T>(width?: T, height?: T): Rect<T | undefined> {
    return new Rect(width, height);
  }

  /** @inheritDoc */
  public main(row: boolean): T {
    return row ? this.width : this.height;
  }

  /** @inheritDoc */
  public cross(row: boolean): T {
    return row ? this.height : this.width;
  }

  public set(row: boolean, main: T, cross: T): this {
    if (row) {
      this.width = main;
      this.height = cross;
    }
    else {
      this.width = cross;
      this.height = main;
    }

    return this;
  }

  public setMain(row: boolean, value: T): this {
    if (row) {
      this.width = value;
    }
    else {
      this.height = value;
    }

    return this;
  }

  public setCross(row: boolean, value: T): this {
    if (row) {
      this.height = value;
    }
    else {
      this.width = value;
    }

    return this;
  }

  public copy(rect: Rect<T>): this {
    this.width = rect.width;
    this.height = rect.height;

    return this;
  }

  public clone(): Rect<T> {
    return new Rect<T>(this.width, this.height);
  }

  public setSides(width: T, height: T): this {
    this.width = width;
    this.height = height;

    return this;
  }

}
