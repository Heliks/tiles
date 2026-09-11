import { Entity, World } from '@heliks/tiles-engine';
import { Layer } from './layers';
import { Chunk, Level } from './level';
import { LevelObject } from './objects';


/**
 * Defines a factory that transforms {@link LevelObject} into full entities.
 *
 * - `D`: Entity data that can be transformed into entities.
 */
export interface ObjectsFactory<D extends LevelObject = LevelObject> {

  /**
   * Composes an entity from a {@link LevelObject}.
   *
   * @param world Entity world.
   * @param level Level where the entity is spawned.
   * @param chunk Level chunk where the entity spawned.
   * @param layer Chunk layer from where the object is spawned.
   * @param data Entity data to spawn entity from.
   */
  create(world: World, level: Level, chunk: Chunk, layer: Layer, data: D): Entity | Promise<Entity>;

}
