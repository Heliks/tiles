import { World } from '../ecs';

/**
 * Lifecycle event that is called after the game runtime has been successfully created
 * by the `GameBuilder`, but before the game has been started.
 */
export interface OnInit {
  onInit(world: World): void;
}

/** @internal */
export function hasOnInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit).onInit);
}
