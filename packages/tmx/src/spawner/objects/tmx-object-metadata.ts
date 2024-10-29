import { HasProperties } from '../../parser';


/** Carries metadata about the TMX object from which this entity was spawned. */
export class TmxObjectMetadata<P = unknown> implements HasProperties<P> {

  /**
   * @param id Tiled internal object ID.
   * @param properties Custom properties.
   * @param name Custom name.
   */
  constructor(public readonly id: number, public readonly properties: P, public readonly name?: string) {}

}
