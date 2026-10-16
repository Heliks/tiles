import { TypeId, uuid } from '@heliks/tiles-engine';


/** Stable identity for an entity that opts into world saving. */
@TypeId('tiles_persistent')
export class Persistent {

  /** Generate once for a new runtime entity; retain the ID when recreating it. */
  constructor(public readonly id = uuid()) {}

}
