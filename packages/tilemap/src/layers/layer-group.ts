import { Layer, LayerProperties } from './layer';
import { World } from '@tiles/engine';
import { Tilemap } from '../tilemap';

/**
 * A layer group.
 *
 * @typeparam T The kind of layer that is allowed to be a child of this group.
 */
export class LayerGroup<T extends Layer<Tilemap, unknown>> implements Layer<Tilemap> {

  constructor(
    public readonly children: T[],
    public readonly properties: LayerProperties
  ) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    for (const child of this.children) {
      child.spawn(world, tilemap, index);
    }
  }
}
