import { Entity, World } from '@heliks/tiles-engine';


/**
 * Implementation of a {@link Script} logic.
 *
 * To enable serialization, the script requires a type ID. If no serialization is used
 * or if this particular script is never serialized, this can be skipped.
 *
 * ```ts
 *  @TypeId('script_foo')
 *  class Foo implements ScriptBehavior {
 *
 *    public update(): void {
 *      console.log('Hello World');
 *    }
 *
 *  }
 * ```
 *
 * @see Script
 */
export interface ScriptBehavior {

  /**
   * If defined, this callback will be invoked when the script starts executing.
   *
   * @param world World to which the script was added.
   * @param entity Entity to which the script is attached to.
   */
  start?(world: World, entity: Entity): void;

  /**
   * If defined, this callback will be invoked when the script stops executing.
   *
   * @param world World to which the script was added.
   * @param entity Entity to which the script is attached to.
   */
  stop?(world: World, entity: Entity): void;

  /**
   * Implementation of the script's logic.
   *
   * Invoked once per frame as long as the entity that executes this script is alive.
   *
   * @param world World to which the script was added.
   * @param entity Entity to which the script is attached to.
   */
  update(world: World, entity: Entity): void;

}
