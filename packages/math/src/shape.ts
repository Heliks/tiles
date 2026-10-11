export interface Shape {

  /** Creates a new shape with the exact same properties as this one. */
  clone(): Shape;

  /** Scales the shape by the given `factor`. */
  scale(factor: number): this;

  /** Scales the shape down by the given `factor`. */
  shrink(factor: number): this;

}
