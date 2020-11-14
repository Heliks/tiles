import { Entity } from '@heliks/tiles-engine';

/**
 *
 */
export class GameMapLayer {

  /**
   * @param entities All entities that belong to this layer.
   * @param isPawnLayer (optional) Indicates if pawns (e.g. player controlled
   *  characters) are allowed to be spawned on the same stage [[node]] as this layer.
   * @param entity (optional) The "parent" entity to which this layer is attached. In
   *  all cases this will be an entity with a `RenderNode` component.
   */
  constructor(
    public readonly entities: Entity[],
    public readonly isPawnLayer = false,
    public readonly entity?: Entity
  ) {}

}

/** A game map that is currently spawned in the world. */
export class GameMap {

  constructor(public readonly layers: GameMapLayer[]) {}

  /**
   * Returns all layers where pawns (e.g. player controlled characters) are
   * allowed to be spawned.
   */
  public getPawnLayers(): GameMapLayer[] {
    return this.layers.filter(item => item.isPawnLayer);
  }

}
