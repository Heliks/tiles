import { Layer } from './layer';
import { World } from '@heliks/tiles-engine';
import { Tilemap } from './tilemap';
import { Container } from '@heliks/tiles-pixi';

/**
 * A layer group.
 *
 * @typeparam T The kind of layer that is allowed to be a child of this group.
 */
export class LayerGroup<T extends Layer<Tilemap>> implements Layer<Tilemap> {

  /** @inheritDoc */
  public readonly isFloorLayer = false;

  constructor(public readonly children: T[]) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    for (const child of this.children) {
      child.spawn(world, tilemap, index);
    }
  }

  /** @inheritDoc */
  public render(world: World, tilemap: Tilemap, target: Container): void {
    for (const child of this.children) {
      child.render?.(world, tilemap, target);
    }
  }

}
