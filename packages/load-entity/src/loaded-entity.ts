import { Entity, EntityData, EntitySerializer, World } from '@heliks/tiles-engine';


/** Contains {@link EntityData} loaded from a file. */
export class LoadedEntity {

  /**
   * @param serializer Serializer used to deserialize {@link data}.
   * @param data Entity data to deserialize.
   */
  constructor(public readonly serializer: EntitySerializer, public readonly data: EntityData) {}

  /** Creates an {@link Entity} from the loaded {@link EntityData}. */
  public insert(world: World): Entity {
    return this.serializer.deserialize(world, this.data);
  }

}
