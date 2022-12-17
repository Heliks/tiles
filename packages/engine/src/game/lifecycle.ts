import { World } from '../ecs';


/**
 * Lifecycle event that is called after the game runtime has been successfully created
 * by the `GameBuilder`, but before the game has been started.
 */
export interface OnInit {
  onInit(world: World): void;
}

/**
 * Types that extend this one support lifecycle hooks.
 *
 * @see OnInit
 */
export type HasLifecycleEvents = Partial<OnInit>;

/** @internal */
export function hasOnInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit).onInit);
}
