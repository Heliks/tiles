/** Component that contains additional metadata for entities that are spawned by the level system. */
export class EntityMetadata {

  /**
   * @param layerId ID of the level layer that spawned this entity.
   */
  constructor(public readonly layerId: number) {}

}
