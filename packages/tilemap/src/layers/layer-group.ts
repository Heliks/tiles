import { Layer } from './layer';
import { Struct, World } from '@tiles/engine';
import { Tilemap } from '../tilemap';

/**
 * A group that contains other layers as children. The group itself is counted as a
 * layer as well.
 *
 * @typeparam T The kind of layer that is allowed to be a child of this group.
 */
export class LayerGroup<T extends Layer<Tilemap>> implements Layer<Tilemap> {

  constructor(
    public readonly children: T[],
    public readonly properties: Struct
  ) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap): void {
    for (const child of this.children) {
      child.spawn(world, tilemap);
    }
  }
}
