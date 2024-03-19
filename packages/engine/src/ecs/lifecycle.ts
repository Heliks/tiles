import { World } from '@heliks/ecs';

/**
 * Lifecycle event that occurs after a resource or system has been added to the world.
 *
 * Resources can be added or removed from the world during runtime, which means that
 * they can have their onInit lifecycle triggered multiple times.
 */
export interface OnInit {

  /** Called when this resource is added to the entity world. */
  onInit(world: World): void;

}

/** Returns `true` if the given `target` has an {@link OnInit} lifecycle event. */
export function hasOnInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit).onInit);
}
