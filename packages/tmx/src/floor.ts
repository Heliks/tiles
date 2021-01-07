import { Entity } from '@heliks/tiles-engine';

/**
 * Todo
 */
export class Floor {

  /**
   * @param layer1 Layer root entity. Used for backgrounds a.E. ground textures.
   * @param layer2 Layer root entity. Used for moving entities. This layer has a
   *  sortable `RenderNode` component attached.
   * @param layer3 Layer root entity. Used for foregrounds and everything that should
   *  occlude the pawn or other movable entities.
   */
  constructor(
    public layer1: Entity,
    public layer2: Entity,
    public layer3: Entity
  ) {}

}
