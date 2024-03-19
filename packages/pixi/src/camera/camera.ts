import { Injectable, Screen, Vec2, XY } from '@heliks/tiles-engine';
import { RendererConfig } from '../config';


@Injectable()
export class Camera {

  /** If the camera is disabled, it will not move until it is enabled again. */
  public enabled = true;

  /** Current world position. */
  public readonly world = new Vec2(0, 0);

  /**
   * Factor by which the scene is zoomed in.
   *
   * For example, a factor of `2` would scale the scene by 200%. A factor of `0.5` would
   * scale everything down by 50%.
   */
  public zoom = 1;

  /** @deprecated */
  public get unitSize(): number {
    return this.config.unitSize;
  }

  /**
   * @param config {@see RendererConfig}
   * @param screen {@see Screen}
   */
  constructor(public readonly config: RendererConfig, public readonly screen: Screen) {}

  /** Converts a screen position to a world position. */
  public screenToWorld(x: number, y: number): Vec2;

  /**
   * Converts a screen position (in px) to a position in the world space. The result is
   * is written to `out`.
   */
  public screenToWorld<T extends XY>(x: number, y: number, out: T): T;

  /** @internal */
  public screenToWorld(x: number, y: number, result: XY = new Vec2()): XY {
    // Convert screen to world position.
    const wx = (x - (this.screen.size.x >> 1)) / this.config.unitSize;
    const wy = (y - (this.screen.size.y >> 1)) / this.config.unitSize;

    // Adjust to camera position.
    result.x = (wx / (this.screen.scale.x * this.zoom)) + this.world.x;
    result.y = (wy / (this.screen.scale.y * this.zoom)) + this.world.y;

    return result;
  }

}
