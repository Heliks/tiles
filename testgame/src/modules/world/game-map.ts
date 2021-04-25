import { Entity } from '@heliks/tiles-engine';

/**
 * Container for entities that belong to a loaded game map.
 */
export class GameMap {

  /**
   * @param entities All entities that belong to this game map.
   */
  constructor(public readonly entities: Entity[] = []) {}

}

