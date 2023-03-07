/** Unit by which a {@link Size size} is measured. */
export enum SizeUnit {
  Percent,
  Px
}

/** A value measured with a specific {@link SizeUnit unit}. */
export class Size {

  /**
   * @param value Size value.
   * @param unit Size unit.
   */
  constructor(public value: number, public unit: SizeUnit) {}

  /** Creates a {@link SizeUnit.Percent percent} {@link Size size} in a range from 0-1. */
  public static percent(value: number): Size {
    return new Size(value, SizeUnit.Percent);
  }

  /** Creates a {@link SizeUnit.Px pixel} {@link Size size}. */
  public static px(value: number): Size {
    return new Size(value, SizeUnit.Px);
  }

  /**
   * Converts a {@link SizeUnit.Percent percentage} size to a pixel value based on
   * an arbitrary `total` size.
   */
  public toPx(total = 0): number {
    return this.unit === SizeUnit.Px ? this.value : total * this.value;
  }

}
