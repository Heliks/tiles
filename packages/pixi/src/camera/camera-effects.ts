import { Type, World } from '@heliks/tiles-engine';
import { Camera } from './camera';


/**
 * An effect that modifies {@link Camera camera} values over a period of time.
 *
 * @see CameraEffects
 */
export interface CameraEffect {

  /**
   * Implementation for startup logic.
   *
   * Called once when the camera effect first becomes active.
   */
  start?(world: World, camera: Camera): void;

  /**
   * Implementation of the effect logic.
   *
   * As long as this effect is active, this function will be called once per frame. It
   * runs until it returns `true`, at which point the effect is considered to be complete
   * and will be removed from the camera automatically.
   */
  update(world: World, camera: Camera): boolean;

}

/**
 * Resources that manages active camera {@link CameraEffect effects}.
 *
 * Only one effect per type can be active at the same time. Which means the {@link ZoomTo}
 * and {@link MoveTo} effects can be used simultaneously, but two {@link MoveTo} can't.
 */
export class CameraEffects {

  /** Contains all active {@link CameraEffect effects}. */
  public readonly active: CameraEffect[] = [];

  /** Removes the active camera effect of the given `type`. */
  public remove(type: Type<CameraEffect>): boolean {
    const index = this.active.findIndex(item => item instanceof type);

    if (~index) {
      this.active.splice(index, 1);

      return true;
    }

    return false;
  }

  /**
   * Adds the given `effect`. If an effect of the same type is already active, it
   * will be canceled and replaced with the new effect.
   */
  public add(effect: CameraEffect): this {
    // Make sure the same effect doesn't run twice.
    this.remove(effect.constructor as Type)

    this.active.push(effect);

    return this;
  }

}
