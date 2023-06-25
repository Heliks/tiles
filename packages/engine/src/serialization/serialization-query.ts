import { ComponentType, QueryBuilder } from '@heliks/ecs';
import { World } from '../ecs';
import { EntitySerializer } from './entity-serializer';
import { EntityData } from './types';


/**
 * Queries entities with a specific set of components to serialize them all at once.
 *
 * This uses a normal {@link QueryBuilder entity query} internally and is therefore
 * functionally similar.
 */
export class SerializationQuery {

  /** @internal */
  private query: QueryBuilder;

  /**
   * @param world Entity world from which entities are queried & serialized.
   * @param serializer Serializer to serialize entities with.
   */
  constructor(
    private readonly world: World,
    private readonly serializer: EntitySerializer
  ) {
    this.query = world.query();
  }

  /** @see QueryBuilder.contains */
  public contains(type: ComponentType): this {
    this.query.contains(type);

    return this;
  }

  /** @see QueryBuilder.excludes */
  public excludes(type: ComponentType): this {
    this.query.excludes(type);

    return this;
  }

  /**
   * Serializes all entities that match the query and returns their serialized entity
   * data as an array.
   */
  public serialize(): EntityData[] {
    return this.query.build().entities.map(
      entity => this.serializer.serialize(this.world, entity)
    );
  }

}