import { World } from '../ecs';

/**
 * Lifecycle event that is called after the engine has successfully been booted, but
 * before the engine has been started.
 */
export interface OnInit {
  onInit(world: World): void;
}

/** @internal */
export function hasOnInit(target: unknown): target is OnInit {
  return Boolean((target as OnInit).onInit);
}
