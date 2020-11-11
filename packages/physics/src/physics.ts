import { Entity, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Injectable } from '@heliks/tiles-injector';
import { RigidBody } from './rigid-body';
import { Renderer } from '@heliks/tiles-pixi';
import { Material, MaterialId } from './material';

@Injectable()
export abstract class Physics {

  /** @internal */
  private readonly materials = new Map<MaterialId, Material>();

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

  /**
   * Called when the `DebugDraw` plugin is set up by the renderer module. Can be used
   * to initialize the adapters debug draw system.
   */
  abstract setupDebugDraw(world: Renderer): void;

  /** Draws the adapters debug information to the renderers debug draw. */
  abstract drawDebugData(): void;

  /** Applies a linear impulse at the center of an `entity` using `force`. */
  abstract impulse(entity: Entity, force: Vec2): void;

  /** Sets a material. */
  public setMaterial(name: MaterialId, material: Material): this {
    this.materials.set(name, material);

    return this;
  }

  /** Returns an existing material with name `name`. */
  public getMaterial(name: MaterialId): Material {
    const material = this.materials.get(name);

    if (!material) {
      throw new Error(`No material with name ${name} found.`);
    }

    return material;
  }

}
