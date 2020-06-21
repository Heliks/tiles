import { Injectable } from "@tiles/injector";
import { ScreenDimensions } from "./screen-dimensions";

@Injectable()
export class Camera {

  /** Position on x axis. */
  public x = 0;

  /** Position on y axis. */
  public y = 0;

  /** Contains the cameras screen position on the x axis. */
  public get sx(): number {
    return this.x + (this.dimensions.resolution[ 0 ] / 2);
  }

  /** Contains the cameras screen position on the y axis. */
  public get sy(): number {
    return this.y + (this.dimensions.resolution[ 0 ] / 2);
  }

  constructor(public readonly dimensions: ScreenDimensions) {}

  /**
   * Transforms the camera position using the given `x` and `y` world positions and
   * translates them to a pixel position.
   */
  public transform(x: number, y: number): this {
    this.x = x * this.dimensions.unitSize;
    this.y = y * this.dimensions.unitSize;

    return this;
  }

}
