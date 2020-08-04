import { Entity, token, Transform, Vec2, World } from '@heliks/tiles-engine';
import { RigidBody } from './rigid-body';
import { Renderer } from '@heliks/tiles-pixi';

/** Adapter for a physics system (box2d, p2 etc.) to be used with the physics module. */
export interface PhysicsAdapter {

  /**
   * Called once when the adapter is initialized. This can be used for example to set-up
   * additional services.
   */
  setup(world: World): void;

  /**
   * Moves the physics world forwards in time based on the given `delta` time
   * (in seconds).
   */
  update(delta: number): void;

  /**
   * Creates a body for `entity` in the physics world based on a rigid `body`
   * at `position`.
   */
  createBody(entity: Entity, body: RigidBody, position: Vec2): void;

  /** Destroys the body of `entity` in the physics world. */
  destroyBody(entity: Entity): void;

  /**
   * Updates the values of the rigid `body` of `entity` with its counterpart in the
   * physics world. The current position of the physics body will be applied to `trans`.
   */
  updateBody(entity: Entity, body: RigidBody, trans: Transform): void;

  /**
   * Called when the `DebugDraw` plugin is set up by the renderer module. Can be used
   * to initialize the adapters debug draw system.
   */
  setupDebugDraw(world: Renderer): void;

  /** Draws the adapters debug information to the renderers debug draw. */
  drawDebugData(): void;

}

/** Token that can be used to inject the active physics `Adapter` into a service. */
export const ADAPTER_TK = token<PhysicsAdapter>();
