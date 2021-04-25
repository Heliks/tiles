/** @internal */
export type BehaviorId = string | number;

/**
 * Component to attach a script behavior to an entity. The specified behavior will be
 * executed once on each frame.
 */
export class Behavior<T = unknown> {

  /**
   * @param id Id of the behavior that should be used for this entity.
   * @param data
   */
  constructor(public id: BehaviorId, public data: T) {}

}
