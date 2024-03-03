/** Contains values for each size in a rectangle. */
export class Sides {

  /**
   * @param top Side width in px.
   * @param right Side height in px.
   * @param bottom
   * @param left
   */
  constructor(public top = 0, public right = 0, public bottom = 0, public left = 0) {}

  /** Returns the sum of the left and right side. */
  public horizontal(): number {
    return this.left + this.right;
  }

  /** Returns the sum of the top and bottom side. */
  public vertical(): number {
    return this.top + this.bottom;
  }

  public main(row: boolean): number {
    return row ? this.horizontal() : this.vertical();
  }

  public cross(row: boolean): number {
    return row ? this.vertical() : this.horizontal();
  }

  /** Copies the values of the given sides. */
  public copy(sides: Sides): this {
    this.top = sides.top;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.left = sides.left;

    return this;
  }

}
