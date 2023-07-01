import { TmxLayer } from '../parser';


/**
 * Entities with this component are root entities for spawned TMX layers. Contains
 * information about which layer they spawned.
 */
export class TmxLayerRoot {

  /**
   * @param source The {@link TmxLayer TMX layer} that was spawned on this entity.
   */
  constructor(public readonly source: TmxLayer) {}

}