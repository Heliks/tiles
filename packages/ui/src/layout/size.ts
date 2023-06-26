export enum Unit {
  Pixels,
  Percentage,
  Auto
}

/** A {@link Size} measured by a {@link Unit}. */
export class Size<U extends Unit = Unit> {

  /**
   * @param unit Unit in which the size is measured.
   * @param value Size value.
   */
  constructor(public unit: U, public value = 0) {}

  /** Returns a new {@link Size} with a {@link Unit.Auto auto} unit. */
  public static auto(value?: number): Size<Unit.Auto> {
    return new Size(Unit.Auto, value);
  }

  /** Returns a new {@link Size} with a {@link Unit.Pixels pixel} unit. */
  public static px(value?: number): Size<Unit.Pixels> {
    return new Size(Unit.Pixels, value);
  }

  /** Returns a new {@link Size} with a {@link Unit.Percentage percentage} unit. */
  public static percent(value?: number): Size<Unit.Percentage> {
    return new Size(Unit.Percentage, value);
  }

  /**
   * Resolves the size to an absolute pixel value.
   */
  public resolve(space: number): number | undefined;

  /**
   * Resolves the size to an absolute pixel value.
   *
   * If the {@link unit} of this size is {@link Unit.Auto auto}, the `auto` property is
   * returned as fallback.
   */
  public resolve(space: number, auto: number): number;

  /** @internal */
  public resolve(space: number, auto?: number): number | undefined {
    switch (this.unit) {
      case Unit.Pixels:
        return this.value;
      case Unit.Percentage:
        return space * this.value;
      case Unit.Auto:
        return auto;
    }
  }

}
