import { Size } from './size';
import { Rect } from './rect';


/**
 * Possible axis directions. The axis defines in which direction items are placed inside
 * a {@link Node flex container}. In each flex layout, there are two axes. The main axis
 * and the cross axis. The main axis can be user defined while the cross axis always
 * runs perpendicular to it.
 *
 * ### Flexbox with main axis "Row":
 *
 * ```
 *  I-----I-----I-----I   ^
 *  |  A  |  B  |  C  |   | < -- Cross Axis
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
 * Alignment modes.
 */
export enum AlignContent {
  /** Pack items around the start. */
  Start,
  /** Pack items around the center. */
  Center,
  /** Pack items around the end. */
  End
}

export interface Style {
  /** Defines how content items are aligned along the cross axis. */
  align: AlignContent;
  /** Use column or row layout. */
  direction: FlexDirection;
  /** Defines how content items are aligned along the main axis. */
  justify: AlignContent;
  /** Sets the node size. */
  size: Rect<Size>;
  /** If `true`, elements will wrap if they would overflow their parent container. */
  wrap: boolean;
}

/** @internal */
export function getStyle(style: Partial<Style>): Style {
  return {
    align: AlignContent.Start,
    direction: FlexDirection.Row,
    justify: AlignContent.Start,
    size: new Rect(
      Size.auto(),
      Size.auto()
    ),
    wrap: false,
    ...style
  };
}

export function calculateAlignOffset(space: number, align: AlignContent): number {
  switch (align) {
    case AlignContent.Start:
      return 0;
    case AlignContent.Center:
      return space / 2;
    case AlignContent.End:
      return space;
  }
}

export function isRow(direction: FlexDirection): boolean {
  return direction === FlexDirection.Row;
}
