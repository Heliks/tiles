import { Entity, World } from '@heliks/tiles-engine';
import { UiEvent } from './ui-event';


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

/**
 * A lifecycle hook that is called when a UI resource is being interacted with. This only
 * works on nodes that are `interactive`. Implement this to react to user interactions.
 */
export interface OnEvent {

  /**
   * Callback that is invoked after an interaction has been triggered. The invocation
   * does not happen immediately, but rather, on the next frame before the element is
   * updated. Therefore, implementations of this callback are in sync with the system
   * dispatcher and can safely interact with the entity `world`.
   *
   * @param world Entity world.
   * @param event UI event that has been triggered.
   */
  onEvent(world: World, event: UiEvent): void;

}

/** Returns `true` if the given `target` has an {@link OnInit} lifecycle event. */
export function canInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit)?.onInit);
}

/** Returns `true` if the given `target` has an {@link OnDestroy} lifecycle event. */
export function canDestroy(target: unknown): target is OnDestroy {
  return Boolean((target as OnDestroy)?.onDestroy);
}

/** Returns `true` if the given `target` has an {@link OnEvent} lifecycle event. */
export function canReceiveEvents(target: unknown): target is OnEvent {
  return Boolean((target as OnEvent)?.onEvent);
}
