import { Vec2, World } from '@heliks/tiles-engine';
import { Camera } from './camera';
import { CameraEffect } from './camera-effects';


/** @internal */
const MAX_DISTANCE = 5;

/** Smoothly moves the {@link Camera camera} to a certain point in the world. */
export class MoveTo implements CameraEffect {

  /** Target position that the camera should move to. */
  public readonly target: Vec2;

  /** @internal */
  private readonly dest = new Vec2();

  /** @internal */
  private readonly _fixed: {
    x: string;
    y: string;
  };

  /**
   * @param x Target world position along x-axis.
   * @param y Target world position along y-axis.
   * @param speed Speed in which the camera moves. Lower values mean slower camera movement.
   * @param tolerance Tolerance by which this camera effect will determine if the camera
   *  successfully arrived at its target.
   */
  constructor(x: number, y: number, public readonly speed = 1, public readonly tolerance = 2) {
    this.target = new Vec2(x, y)
    this._fixed = {
      x: x.toFixed(tolerance),
      y: y.toFixed(tolerance)
    };
  }

  /** @internal */
  private isArrived(camera: Camera): boolean {
    return camera.world.x.toFixed(this.tolerance) === this._fixed.x
        && camera.world.y.toFixed(this.tolerance) === this._fixed.y;
  }

  /** @inheritDoc */
  public update(world: World, camera: Camera): boolean {
    this.dest
      .copy(this.target)
      .sub(camera.world)
      .normalize()
      .scale(this.speed);

    const distance = camera.world.distance(this.target);

    // Move slower the closer we get to the target.
    if (distance < MAX_DISTANCE) {
      this.dest.scale(distance / MAX_DISTANCE);
    }

    camera.world.x += this.dest.x;
    camera.world.y += this.dest.y;

    return this.isArrived(camera);
  }

}
