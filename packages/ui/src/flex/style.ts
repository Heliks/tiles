import { Size } from './size';


/**
 * Possible axis directions. The axis defines in which direction items are placed inside
 * a {@link FlexContainer flex container}. In each flex layout, there are two axes. The
 * main axis and the cross axis. The main axis can be user defined while the cross axis
 * always runs perpendicular to it.
 *
 * ### Flexbox with main axis "Row":
 *
 * ```
 *  I-----I-----I-----I   ^
 *  I  A  I  B  I  C  I   | < -- Cross Axis
 *  I-----I-----I-----I   v
 *
 *  <----------------->     < -- Main Axis
 * ```
 *
 * ### Flexbox with main axis "Column":
 *
 * ```
 *  I-----I    ^
 *  I  A  I    |
 *  I-----I    |
 *  I  B  I    | -- Main Axis
 *  I-----I    |
 *  I  C  I    |
 *  I-----I    v
 *
 *  <----->    <--- Cross Axis
 * ```
 *
 * @see FlexContainer
 */
export enum FlexDirection {
  Column,
  Row
}

/**
 * Defines alignment of direct children along the cross {@link FlexDirection axis}
 * of a flexbox.
 */
export enum AlignItems {
  Start,
  Center,
  End
}

/**
 * Defines how space is distributed between and around direct children alongside the
 * main {@link FlexDirection axis} of a flexbox.
 */
export enum JustifyContent {

  /** Pack items around the start. */
  Start,

  /** Pack items around the center. */
  Center,

  /** Pack items around the end. */
  End

}

export interface Style {

  /** Defines how content items are aligned along the cross axis. */
  align: AlignItems;

  /** Use column or row layout. */
  direction: FlexDirection;

  /** Defines how content items are aligned along the main axis. */
  justify: JustifyContent;

  /** Width of the node. */
  height: Size;

  /** Height of the node. */
  width: Size;

}

/** @internal */
function getDefaults(style: Partial<Style>): Style {
  return {
    align: AlignItems.Start,
    direction: FlexDirection.Row,
    justify: JustifyContent.Start,
    width: Size.percent(1),
    height: Size.percent(1),
    ...style
  };
}

/**
 * Component that applies a flexbox style to adjacent {@link UiNode} components.
 *
 * Flexbox is designed to arrange direct children (content items) in one dimension, or
 * in other words, in columns or rows. Item placement or alignment can be directly
 * controlled, which makes it very easy to create responsive interfaces.
 */
export class Style {

  constructor(style: Partial<Style> = {}) {
    Object.assign(this, getDefaults(style));
  }

  /** Creates a {@link Style} with a {@link FlexDirection column flex direction}. */
  public static column(style: Partial<Style>): Style {
    return new Style({ direction: FlexDirection.Column, ...style });
  }

  /** Creates a {@link Style} with a {@link FlexDirection row flex direction}. */
  public static row(style: Partial<Style>): Style {
    return new Style({ direction: FlexDirection.Row, ...style });
  }

}
