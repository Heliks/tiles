/**
 * Describes the dimensions of a flex container.
 *
 * This is essentially a normal rectangle, but we don't know which side of the rectangle
 * is on which axis. Instead, in each flexbox, one axis is the "main" axis, and the other
 * is the "cross" axis. The main axis can be user defined, while the cross axis always
 * runs perpendicular to it.
 *
 * @see FlexDirection
 */
export class FlexContainer {

  /**
   * @param main Size of flexbox on main {@link FlexDirection axis} in px.
   * @param cross Size of flexbox on cross {@link FlexDirection axis} in px.
   */
  constructor(public main: number, public cross: number) {}

  /** Sets both the {@link main} axis and the {@link cross} axis to `0`. */
  public reset(): this {
    this.main = 0;
    this.cross = 0;

    return this;
  }

}
