import { Vec2, XY } from '../vec2';


export class Pivot {

  /**
   * @param x Position along the x-axis in percent (0-1).
   * @param y Position along the y-axis in percent (0-1).
   */
  constructor(public readonly x: number, public readonly y: number) {}

  /** Returns the pivot position on an arbitrary rectangle. */
  public getPosition(width: number, height: number): Vec2;

  /** Returns the pivot position on an arbitrary rectangle. Writes the result to `out`. */
  public getPosition<T extends XY>(width: number, height: number, out: T): T;

  /** @internal */
  public getPosition<T extends XY>(width: number, height: number, out: XY = new Vec2()): T {
    out.x = width * this.x;
    out.y = height * this.y;

    return out as T;
  }

}
