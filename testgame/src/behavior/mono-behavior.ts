import { Entity, World } from '@heliks/tiles-engine';
import { Behavior } from './behavior';

/**
 * Base for scripted entity behaviors.
 *
 * Note: Entities that share the same behavior will use the same instance of a
 * `MonoBehavior`, so it is not recommended to add any state specific data here.
 */
export interface MonoBehavior {

  /**
   * Used to implement the script logic. Called once on each frame for every `entity`
   * that implements this behavior.
   */
  update(entity: Entity, behavior: Behavior, world: World): unknown;

}
