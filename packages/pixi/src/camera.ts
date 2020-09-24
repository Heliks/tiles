import { Injectable } from '@heliks/tiles-engine';
import { ScreenDimensions } from './screen-dimensions';
import { Vec2 } from '@heliks/tiles-math';

@Injectable()
export class Camera {

  /** Local position in the world. */
  public readonly local: Vec2 = [0, 0];

  /** Screen position in px. */
  public readonly screen: Vec2 = [0, 0];

  constructor(public readonly dimensions: ScreenDimensions) {}

  /** Transforms the camera position using the given `x` and `y` local position. */
  public transform(x: number, y: number): this {
    this.local[0] = x;
    this.local[1] = y;

    this.screen[0] = (x * this.dimensions.unitSize) + (this.dimensions.resolution[0] / 2);
    this.screen[1] = (y * this.dimensions.unitSize) + (this.dimensions.resolution[1] / 2);

    return this;
  }

}
