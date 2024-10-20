/**
 * Component that carries Tiled meta-information.
 *
 * This component is attached to all entities that are created from objects that are
 * placed on object layers.
 */
export class TmxObjectMetadata {

  /**
   * @param id Unique Id.
   * @param name Custom name assigned to the object.
   */
  constructor(public readonly id: number, public readonly name?: string) {}

}
