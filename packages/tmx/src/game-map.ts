import { NodeHandle } from '@heliks/tiles-pixi';
import { Entity } from '@heliks/tiles-engine';

/**
 *
 */
export class GameMapLayer {

  /**
   * @param node The handle referencing the `StageNode` where this layer is
   *  rendered. Can be used to render other stuff on the same level as this layer.
   * @param entities All entities that belong to this layer.
   * @param isPawnLayer Indicates if pawns (e.g. player controlled characters) are
   *  allowed to be spawned on the same stage [[node]] as this layer.
   */
  constructor(
    public readonly node: NodeHandle,
    public readonly entities: Entity[],
    public isPawnLayer = false
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
