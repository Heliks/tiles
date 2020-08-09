import { World } from '@heliks/tiles-engine';
import { Tilemap } from './tilemap';
import { Layer } from './layer';
import { WorldObject } from './world-object';

/** A layer that contains world objects. */
export class ObjectLayer implements Layer<Tilemap> {

  constructor(
    public readonly data: WorldObject<Tilemap>[],
    public readonly isFloorLayer = false
  ) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    for (const item of this.data) {
      item.spawn(world, tilemap, index);
    }
  }

}
