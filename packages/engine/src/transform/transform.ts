import { Subscriber, World } from '@heliks/tiles-entity-system';
import { Entity, EntityGroup, Storage } from '@heliks/tiles-entity-system';
import { EntityQuery, ProcessingSystem } from '../entity-system';
import { Vec2 } from '../math';
import { Hierarchy, Parent } from './hierarchy';

export class Transform {

  public readonly local: Vec2 = [0, 0];
  public readonly world: Vec2 = [0, 0];

  public isLocalDirty = true;

  /** @deprecated */
  public get x(): number {
    return this.world[0];
  }

  /** @deprecated */
  public get y(): number {
    return this.world[1];
  }

  /**
   * @param x Position on the x axis. This can be any unit depending on the renderer
   *  or physics engine, but in most cases it will be meters.q
   * @param y Position on the y axis. Like [[x]] this can be any unit.
   * @param rotation The rotation of the entity in radians.
   */
  constructor(x = 0, y = 0, public rotation = 0) {
    this.local[0] = x;
    this.local[1] = y;

    // For most entities the world position is also the local position. Entities that are
    // a child of another component will have this updated by the transform system.
    this.world[0] = x;
    this.world[1] = y;
  }

  public setPosition(x: number, y: number): this {
    this.local[0] = x;
    this.local[1] = y;

    this.isLocalDirty = true;

    return this;
  }

  public clone(): Transform {
    return new Transform(
      this.local[0],
      this.local[0],
      this.rotation
    );
  }

  public transform(x: number, y: number, rotation: number): this {
    this.rotation = rotation;

    this.local[0] = x;
    this.local[1] = y;

    return this;
  }

}


export class TransformSystem extends ProcessingSystem {

  /** @internal */
  private subscriber!: Subscriber;
  private hierarchy!: Hierarchy;

  private parentless!: EntityGroup;

  public getQuery(): EntityQuery {
    return {
      contains: [ Transform ]
    }
  }

  public boot(world: World): void {
    super.boot(world);

    this.hierarchy = new Hierarchy(world.storage(Parent));

    // Query all entities
    this.parentless = world.query({
      contains: [ Transform ],
      excludes: [ Parent ]
    });

    // this.subscriber = world
    //  .storage(Transform)
    //  .events()
    //  .subscribe();
  }

  public tt(transforms: Storage<Transform>, parents: Storage<Parent>, entities: Entity[]): void {
    const hierarchy = this.hierarchy;

    for (const entity of entities) {
      const children = this.hierarchy.getChildren(entity);

      if (children) {
        for (const child of children) {
          const cTransform = transforms.get(child);
          const pTransform = transforms.get(parents.get(child).entity);

          cTransform.world[0] = cTransform.local[0] + pTransform.world[0];
          cTransform.world[1] = cTransform.local[1] + pTransform.world[1];

          cTransform.isLocalDirty = false;

          // Get the children of the child and traverse them also.
          const _children = this.hierarchy.getChildren(child);

          if (_children) {
            this.tt(transforms, parents, _children);
          }
        }
      }
    }
  }

  public update(world: World) {
    const transforms = world.storage(Transform);
    const parents = world.storage(Parent);

    // Maintain the entity hierarchy.
    this.hierarchy.update();

    const foo = this.hierarchy.children;

    for (const entity of this.parentless.entities) {
      const transform = transforms.get(entity);

      // Entities without a parent have the same local position as world. Synchronize them
      // if their locals have changed.
      if (transform.isLocalDirty) {
        transform.world[0] = transform.local[0];
        transform.world[1] = transform.local[1];

        transform.isLocalDirty = false;
      }
    }

    this.tt(transforms, parents, this.parentless.entities);
  }

}
