import { Injectable } from '@heliks/tiles-engine';
import { Screen } from './screen';
import { Vec2, vec2 } from '@heliks/tiles-math';


@Injectable()
export class Camera {

  /** Local position in the world. */
  public readonly world = vec2(0, 0);

  private _zoom = 1;

  public get zoom() {
    return this._zoom;
  }

  public set zoom(value: number) {
    const d = value - this._zoom;
    const p = d / this.zoom;

    // this.world.x += this.world.x * p;
    // this.world.y += this.world.y * p;

    this._zoom = value;
  }


  /**
   * Enables or disables the camera. The position of the camera can still be updated
   * while it is disabled, but it will not move the screen until it is enabled again.
   */
  public enabled = true;

  constructor(private readonly screen: Screen) {}

  /** Transforms the camera position using the given `x` and `y` local position. */
  public transform(x: number, y: number): this {
    this.world.x = x;
    this.world.y = y;

    return this;
  }

  /** Converts a `position` on the screen to a position in the game world. */
  public toWorld(position: Vec2, out = vec2(0, 0)): Vec2 {
    out.x = ((position.x / this.screen.scale.x) - (this.world.x) ) / this.screen.unitSize;
    out.y = ((position.y / this.screen.scale.y) - (this.world.y) ) / this.screen.unitSize;

    return out;
  }

  /** Converts a `position` in the world space to a position on the screen. */
  public toScreen(position: Vec2, out = vec2(0, 0)): Vec2 {
    out.x = (-position.x * this.screen.unitSize) + (this.screen.resolution.x / 2);
    out.y = (-position.y * this.screen.unitSize) + (this.screen.resolution.y / 2);

    return out;
  }

}
