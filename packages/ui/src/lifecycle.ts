import { Entity, World } from '@heliks/tiles-engine';


/**
 * A lifecycle hook that is invoked after a UI resource has been initialized. Implement
 * this interface to handle additional initialization tasks.
 */
export interface OnInit {

  /**
   * Callback that is invoked after the resource has been fully initialized.
   *
   * @param world Entity world.
   * @param entity Entity that owns the initialized resource.
   */
  onInit(world: World, entity: Entity): void;

}

/**
 * A lifecycle hook that is called when a UI resource is being destroyed. Implement this
 * interface to handle additional cleanup tasks.
 */
export interface OnDestroy {

  /**
   * Callback that is invoked after the instance of the resource has been destroyed.
   *
   * @param world Entity world.
   * @param entity Entity that owns the resource that is being destroyed.
   */
  onDestroy(world: World, entity: Entity): void;

}

/** Returns `true` if the given `target` has an {@link OnInit} lifecycle event. */
export function canInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit)?.onInit);
}

/** Returns `true` if the given `target` has an {@link OnDestroy} lifecycle event. */
export function canDestroy(target: unknown): target is OnDestroy {
  return Boolean((target as OnDestroy)?.onDestroy);
}
