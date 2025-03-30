import { TypeId } from '@heliks/tiles-engine';
import { HasProperties } from '../parser';


/** Component that contains metadata for entities that were created from a {@link TmxObject}. */
@TypeId('tiles_tmx_object')
export class TmxObjectMetadata<P = unknown> implements HasProperties<P> {

  /**
   * @param id Tiled internal object ID.
   * @param properties Custom properties.
   * @param name Custom name.
   */
  constructor(
    public readonly id: number,
    public readonly properties: P,
    public readonly name?: string
  ) {}

}
