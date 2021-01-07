import { Entity } from '@heliks/tiles-engine';

/**
 *
 */
export class GameMapLayer {

  /**
   * @param root The root entity of which the entities on this layer are children of.
   * @param entities All entities that are contained on this layer.
   * @param isFloor (optional) If set to `true` this layer is considered a floor, which
   *  means that entities such as the player character should be spawned here.
   */
  constructor(
    public readonly root: Entity,
    public readonly entities: Entity[],
    public readonly isFloor = false
  ) {}

}

/** An active game map. */
export class GameMap {

  constructor(public readonly layers: GameMapLayer[]) {}

}
