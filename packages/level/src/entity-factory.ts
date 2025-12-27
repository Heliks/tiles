import { Entity, World } from '@heliks/tiles-engine';
import { LevelEntity } from './entities';
import { Chunk, ChunkEntityLayer, Level } from './level';


/**
 * Defines a factory that transforms {@link LevelEntity} into full entities.
 *
 * - `D`: Entity data that can be transformed into entities.
 */
export interface EntityFactory<D extends LevelEntity = LevelEntity> {

  /**
   * Callback that is invoked before an entity is being created. If this returns `true`,
   * this entity will be skipped by the level system.
   *
   * @param level Level for which the entity is being created.
   * @param chunk Level chunk for which the entity is being created.
   * @param layer Chunk layer from where the object is spawned.
   * @param data Entity data to spawn entity from.
   */
  ignore(level: Level, chunk: Chunk, layer: ChunkEntityLayer, data: D): boolean;

  /**
   * Composes an entity from a {@link LevelEntity}.
   *
   * @param world Entity world.
   * @param level Level where the entity is spawned.
   * @param chunk Level chunk where the entity spawned.
   * @param layer Chunk layer from where the object is spawned.
   * @param data Entity data to spawn entity from.
   */
  create(world: World, level: Level, chunk: Chunk, layer: ChunkEntityLayer, data: D): Entity | Promise<Entity>;

}
