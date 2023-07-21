import { Injectable, Screen, Vec2, XY } from '@heliks/tiles-engine';
import { RendererConfig } from '../config';


@Injectable()
export class Camera {

  /**
   * Enables or disables the camera. The position of the camera can still be updated
   * while it is disabled, but it will not update the screen until it is enabled again.
   */
  public enabled = true;

  /**
   * Cameras world position. Do not modify this directly.
   * @see transform
   */
  public readonly world = new Vec2(0, 0);

  public get unitSize(): number {
    return this.config.unitSize;
  }

  constructor(
    private readonly config: RendererConfig,
    private readonly screen: Screen
  ) {}

  /** Transforms the camera position using the given `x` and `y` local position. */
  public transform(x: number, y: number): this {
    this.world.x = x;
    this.world.y = y;

    return this;
  }

  /**
   * Converts a screen position (in px) to a position in the world space.
   */
  public screenToWorld(x: number, y: number): Vec2;

  /**
   * Converts a screen position (in px) to a position in the world space. The result is
   * is written to `out`.
   */
  public screenToWorld<T extends XY>(x: number, y: number, out: T): T;

  /** @internal */
  public screenToWorld(x: number, y: number, result: XY = new Vec2()): XY {
    const sx = (x - ((this.screen.size.x) >> 1)) / this.config.unitSize / this.screen.scale.x;
    const sy = (y - ((this.screen.size.y) >> 1)) / this.config.unitSize / this.screen.scale.y;

    result.x = sx + this.world.x;
    result.y = sy + this.world.y;

    return result;
  }

}
