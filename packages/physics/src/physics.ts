import { Entity, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Injectable } from '@heliks/tiles-injector';
import { XY } from '@heliks/tiles-math';
import { Collider } from './collider';
import { RigidBody } from './rigid-body';

/**
 * An obstacle encountered by a raycast.
 * @see Physics.raycast
 */
export interface RaycastObstacle {
  /** The collider with which the ray collided. */
  collider: Collider;
  /** Entity that owns the rigid body to which `collider` is attached to. */
  entity: Entity;
}

@Injectable()
export abstract class Physics {

  /**
   * Called once when the adapter is initialized. This can be used for example to set-up
   * additional services.
   */
  abstract setup(world: World): void;

  /**
   * Moves the physics world forwards in time based on the given `delta` time
   * (in seconds).
   */
  abstract update(delta: number): void;

  /**
   * Creates a body for `entity` in the physics world based on a rigid `body`
   * at `position`.
   */
  abstract createBody(entity: Entity, body: RigidBody, transform: Transform): void;

  /** Destroys the body of `entity` in the physics world. */
  abstract destroyBody(entity: Entity): void;

  /**
   * Updates the values of the rigid `body` of `entity` with its counterpart in the
   * physics world. The current position of the physics body will be applied to `trans`.
   */
  abstract updateEntityBody(entity: Entity, body: RigidBody, trans: Transform): void;

  /** Draws the adapters debug information to the renderers debug draw. */
  abstract drawDebugData(): void;

  /** Applies a linear impulse at the center of an `entity` using `force`. */
  abstract impulse(entity: Entity, force: Vec2): void;

  /**
   * Performs a raycast from the given `start` to `end` point. Obstacles that collided
   * with the ray are returned. If an `obstacles` array is provided, the obstacles
   * that the ray encounters are added to that array instead.
   */
  abstract raycast(start: XY, end: XY, obstacles?: RaycastObstacle[]): RaycastObstacle[];

}
