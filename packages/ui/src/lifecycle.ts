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
 * A lifecycle hook that is invoked before a resource is initialized. Implement this
 * interface to handle additional setup tasks before the initialization of the resource.
 */
export interface OnBeforeInit {

  /**
   * Callback that is invoked before the resource is initialized.
   *
   * @param world Entity world.
   * @param entity Entity that owns the initialized resource.
   */
  onBeforeInit(world: World, entity: Entity): void;

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
   * @param entity Owner of the UI resource.
   */
  onEvent(world: World, event: UiEvent, entity: Entity): void;

}

/**
 * A simple change from a previous value to a new one on a UI resource.
 *
 * @see ValueChanges
 */
export interface ValueChange {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  current: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previous: any;
}

/**
 * A map of {@link ValueChange changes} on a UI resource, stored at the property they
 * changed on the resource. This is passed in the {@link OnChanges} lifecycle.
 * 
 * - `T`: The context on which values were changed.
 */
export type ValueChanges<C = unknown> = {
  [K in keyof C]?: ValueChange;
}

/**
 * A lifecycle hook that is called after any data-bound property on a UI resource has
 * been changed. Implement this to react to changes in inputs.
 */
export interface OnChanges {

  /**
   * Callback that is invoked after a data-bound property on a UI resource has
   * been changed.
   *
   * @param world Entity world.
   * @param entity Owner of the UI resource in which the lifecycle occurred.
   * @param changes A map of all changes that occurred.
   */
  onChanges(world: World, entity: Entity, changes: ValueChanges): void;

}

/** Returns `true` if the given `target` has an {@link OnInit} lifecycle event. */
export function canInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit)?.onInit);
}

export function canSetupBeforeInit(target: unknown): target is OnBeforeInit {
  return Boolean((target as OnBeforeInit)?.onBeforeInit);
}

/** Returns `true` if the given `target` has an {@link OnDestroy} lifecycle event. */
export function canDestroy(target: unknown): target is OnDestroy {
  return Boolean((target as OnDestroy)?.onDestroy);
}

/** Returns `true` if the given `target` has an {@link OnEvent} lifecycle event. */
export function canReceiveEvents(target: unknown): target is OnEvent {
  return Boolean((target as OnEvent)?.onEvent);
}

/** Returns `true` if the given `target` has an {@link OnChanges} lifecycle event. */
export function canListenToChanges(target: object): target is OnChanges {
  return Boolean((target as OnChanges).onChanges);
}
