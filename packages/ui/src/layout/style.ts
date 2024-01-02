import { Rect } from './rect';
import { Sides } from './sides';
import { Size } from './size';


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
  End,

  /**
   * Each flex item will have remaining free space distributed equally to both of their
   * edges. I.e., the gap between the edge of the first & last item and the start / end
   * edge of the flex container, is exactly half of the gap between each item.
   */
  SpaceAround,

  /**
   * The first and last items are aligned with the edges of the container. The remaining
   * free space is distributed evenly. If the leftover space is negative, or there is
   * only a single item on the line, this value is treated as {@link AlignContent.Start}.
   */
  SpaceBetween,

  /**
   * Each flex item will have the same amount of space distributed to them on both of
   * their edges. I.e., the gap between the container edge and the first & last item
   * is exactly the same as the gap between each item.
   */
  SpaceEvenly

}

/** Available styling options. */
export interface Style {

  /**
   * Aligns flex items along the cross axis of the current line of the flex container.
   *
   * @see justify
   */
  align: AlignContent;

  /**
   * The direction property specifies how flex items are placed in the flex container,
   * by setting the direction of the flex container’s main axis. This determines the
   * direction in which flex items are laid out.
   */
  direction: FlexDirection;

  /**
   * Aligns flex items along the main axis of the current line of the flex container.
   *
   * @see align
   */
  justify: AlignContent;

  /**
   * Sets the margin thickness for all four sides of the node. The margin is the space
   * that surrounds a node.
   */
  margin: Sides;

  /**
   * Sets the padding area for all four sides of the node. The padding is the space
   * between the node border and its content.
   */
  padding: Sides;

  /**
   * Defines the size of the node.
   *
   * This size is calculated as if the node had the CSS property `box-sizing` set
   * to "border-box".
   */
  size: Rect<Size>;

  /**
   * Controls weither the flex-container is single-line or multi-line.
   *
   * A single-line flex container lays out all of its children in a single line, even if
   * that would cause its contents to overflow.
   *
   * A multi-line container breaks its flex items across multiple lines. When additional
   * lines are created, they are stacked along the cross axis. Every line contains at
   * least one flex item, unless the flex container itself is completely empty.
   */
  wrap: boolean;

}

/** @internal */
export function computeStyleSheet(style: Partial<Style> = {}): Style {
  return {
    align: AlignContent.Start,
    direction: FlexDirection.Row,
    justify: AlignContent.Start,
    margin: new Sides(0, 0, 0, 0),
    padding: new Sides(0, 0, 0, 0),
    size: new Rect(
      Size.auto(),
      Size.auto()
    ),
    wrap: false,
    ...style
  };
}

export function calculateAlignOffset(space: number, items: number, first: boolean, align: AlignContent): number {
  switch (align) {
    case AlignContent.Start:
      return 0;
    case AlignContent.Center:
      return space / 2;
    case AlignContent.End:
      return space;
    case AlignContent.SpaceAround:
      return first ? (space / items) / 2 : space / items;
    case AlignContent.SpaceBetween:
      return first ? 0 : space / (items - 1);
    case AlignContent.SpaceEvenly:
      return space / (items + 1);
  }
}

export function isRow(direction: FlexDirection): boolean {
  return direction === FlexDirection.Row;
}
