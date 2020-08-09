import { Tilemap } from './tilemap';
import { Grid, Transform, World } from '@heliks/tiles-engine';
import { WorldObject } from './world-object';
import { Container, Renderer } from '@heliks/tiles-pixi';
import { TileLayer } from './tile-layer';

/***/
export class TileComposition extends WorldObject<Tilemap> {

  public shrink = false;

  constructor(
    id: number,
    public readonly grid: Grid,
    public readonly data: TileLayer[] = []
  ) {
    super(id);
  }

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    const container = new Container();

    for (const layer of this.data) {
      layer.render?.(world, tilemap, container);
    }

    if (this.shrink) {
      container.shrink();
    }

    // Pivot it around its center like other game objects.
    container.setPivot(0.5);

    const us = world.get(Renderer).config.unitSize;

    // Create the entity
    world
      .builder()
      .use(container)
      .use(new Transform(container.x / us, container.y / us))
      .build();
  }

}
