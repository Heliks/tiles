import { EntityBuilder } from './entity-builder';
import { ClassType, Entity } from './types';
import { StorageManager } from './storage';

export interface ComponentBlueprint<T = unknown> {
  component: ClassType<T>;
  data?: Partial<T>;
}

/**
 * An entity builder that can be used to produce multiple entities (An entity archetype).
 */
export class Archetype {

  /** Holds information on how to assign components to an entity. */
  protected components: ComponentBlueprint[] = [];

  /**
   * @param storages Storage manager.
   */
  constructor(protected storages: StorageManager) {}

  /**
   * Adds a component to the builder.
   *
   * @param component The component type.
   * @param data (optional) Data that should initially be assigned to the component.
   * @returns this
   */
  public add<T>(component: ClassType<T>, data?: Partial<T>): this {
    this.components.push({
      component,
      data
    });

    return this;
  }

  /** Builds and returns the final entity. */
  public build(): Entity {
    const entity = Symbol();

    for (const item of this.components) {
      this.storages.storage(item.component).add(entity, item.data);
    }

    return entity;
  }

  /**
   * Returns an entity builder based on this archetype.
   *
   * ```typescript
   * const archetype = world.archetype().add(Health, { max: 100, val: 100 });
   *
   * // Will be created with "Health" and "Transform".
   * const entity1 = archetype.toBuilder().add(Transform, { x: 10, y: 10 }).build();
   * const entity2 = archetype.toBuilder().add(Transform, { x: 20, y: 20 }).build();
   * ```
   */
  public toBuilder(): EntityBuilder {
    const builder = new EntityBuilder(this.storages);

    for (const item of this.components) {
      builder.add(item.component, item.data);
    }

    return builder;
  }

}
