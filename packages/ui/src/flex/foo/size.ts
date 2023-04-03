export enum SizeUnit {
  Pixels,
  Percentage,
  Auto
}

/** Size is measured in absolute pixels. */
interface PixelsMeasurement {
  value: number;
  unit: SizeUnit.Pixels;
}

/** Size is a percentage relative to its parent. */
interface PercentMeasurement {
  value: number;
  unit: SizeUnit.Percentage;
}

/** Size should be computed automatically. */
interface AutoMeasurement {
  unit: SizeUnit.Auto;
}

/**
 * Describes a size.
 *
 * Sizes can be measured with different units. Depending on this, the size may be fixed
 * or computed automatically entirely.
 */
export type Size = PixelsMeasurement | PercentMeasurement | AutoMeasurement;

export function auto(): AutoMeasurement {
  return { unit: SizeUnit.Auto };
}

export function percent(value: number): PercentMeasurement {
  return { value, unit: SizeUnit.Percentage };
}

export function pixels(value: number): PixelsMeasurement {
  return { value, unit: SizeUnit.Pixels };
}

export function toPixels(size: Size, space: number): number {
  switch (size.unit) {
    case SizeUnit.Pixels:
      return size.value;
    case SizeUnit.Percentage:
      return space * size.value;
    default:
      return space;
  }
}

export enum SpaceType {

  /** Space is defined by a fixed amount of pixels. */
  Definite,

  /**
   * Space is indefinite and node should take its "ideal" size, which usually is the
   * cross axis of the parent space.
   */
  MaxContent,

  /**
   * Space is indefinite and node should take the smallest size it could take that
   * does not lead to overflow.
   */
  MinContent

}

export interface DefiniteSpace {
  value: number;
  type: SpaceType.Definite;
}

export interface MaxContentSpace {
  type: SpaceType.MaxContent;
}

export interface MinContentSpace {
  type: SpaceType.MinContent;
}

/**
 * A size representing the available space into which a node is laid out. Usually this
 * is either a fixed amount of pixels measured from the containing block (definite size),
 * or an infinite (indefinite size) which correlates to the available main axis size.
 *
 * @see https://www.w3.org/TR/css-sizing-3/#available
 */
export type AvailableSpace = DefiniteSpace | MaxContentSpace | MinContentSpace;

