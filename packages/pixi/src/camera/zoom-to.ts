import { Ticker, World } from '@heliks/tiles-engine';
import { Camera } from './camera';
import { CameraEffect } from './camera-effects';


/** Zooms the camera over time. */
export class ZoomTo implements CameraEffect {

  /**
   * @param zoom Target zoom level
   * @param speed Speed in which the camera moves. Lower values mean slower camera movement.
   * @param tolerance Floating point tolerance by which the effect recognizes that the target zoom factor has been reached.
   */
  constructor(public readonly zoom: number, public readonly speed = 1, public readonly tolerance = 0.01) {}

  /** @inheritDoc */
  public update(world: World, camera: Camera): boolean {
    const ticker = world.get(Ticker);

    camera.zoom -= ((camera.zoom - this.zoom) / (this.speed * ticker.delta));

    // If difference to target zoom factor is below tolerenace we are done.
    return Math.abs(this.zoom - camera.zoom) < this.tolerance;
  }

}
