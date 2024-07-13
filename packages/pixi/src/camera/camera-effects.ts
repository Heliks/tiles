import { getType, Type, World } from '@heliks/tiles-engine';
import { Camera } from './camera';


/** An effect that modifies {@link Camera} values over a period of time. */
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
  public readonly active = new Set<CameraEffect>();

  /** Removes any active effect that matches the given class `type`. */
  public removeType(type: Type<CameraEffect>): void {
    for (const effect of this.active) {
      if (effect instanceof type) {
        this.active.delete(effect);

        return;
      }
    }
  }

  /** Removes the given camera `effect`. */
  public remove(effect: CameraEffect): this {
    this.active.delete(effect);

    return this;
  }

  /**
   * Adds the given `effect`. If an effect of the same type is already active, it
   * will be canceled and replaced with the new effect.
   */
  public add(effect: CameraEffect): this {
    this.removeType(getType(effect));
    this.active.add(effect);

    return this;
  }

}
