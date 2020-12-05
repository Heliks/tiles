/** @internal */
export type BehaviorId = string | number;

/**
 * Component to attach a script behavior to an entity. The specified behavior will be
 * executed once on each frame.
 */
export class Behavior {

  /**
   * @param id Id of the behavior that should be used for this entity.
   */
  constructor(public id: BehaviorId) {}

}
