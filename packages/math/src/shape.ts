export interface Shape {

  /** Creates a new shape with the exact same properties as this one. */
  copy(): Shape;

  /**
   * Scales the shape along the `x` and `y` axis.
   *
   * Note: Not all shapes necessarily can be scaled on both x and y. How this is treated
   * depends on the shape. For example, circles will be scaled along the larger of the
   * two axis's.
   */
  scale(x: number, y?: number): this;


}
