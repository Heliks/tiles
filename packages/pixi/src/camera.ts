import { Injectable } from '@heliks/tiles-engine';
import { ScreenDimensions } from './screen-dimensions';
import { vec2 } from '@heliks/tiles-math';

@Injectable()
export class Camera {

  /** Local position in the world. */
  public readonly local = vec2(0, 0);

  /** Screen position in px. */
  public readonly screen = vec2(0, 0);

  constructor(public readonly dimensions: ScreenDimensions) {}

  /** Transforms the camera position using the given `x` and `y` local position. */
  public transform(x: number, y: number): this {
    this.local.x = x;
    this.local.y = y;

    this.screen.x = (x * this.dimensions.unitSize) + (this.dimensions.resolution.x / 2);
    this.screen.y = (y * this.dimensions.unitSize) + (this.dimensions.resolution.y / 2);

    return this;
  }

}
