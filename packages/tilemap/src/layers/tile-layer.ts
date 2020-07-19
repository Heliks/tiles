import { Struct, Transform, World } from '@tiles/engine';
import { Tilemap } from '../tilemap';
import { Renderer, SpriteDisplay } from '@tiles/pixi';
import { Layer } from './layer';

/** A layer that contains tiles structured in a grid. */
export class TileLayer implements Layer<Tilemap> {

  /**
   * @param data
   * @param properties @inheritDoc
   */
  constructor(
    public readonly data: number[],
    public readonly properties: Struct
  ) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap): void {
    const tw2 = tilemap.cellWidth / 2;
    const th2 = tilemap.cellHeight / 2;

    // Get the unit size from the renderer config.
    const us = world.get(Renderer).config.unitSize;

    for (let i = 0, l = this.data.length; i < l; i++) {
      const gId = this.data[i];

      // A global tile ID "0" means that no tile exists at this index.
      if (gId === 0) {
        continue;
      }

      const position = tilemap.pos(i);
      const tileset = tilemap.tileset(gId);

      // Convert the local tile id to an index.
      const idx = tileset.toLocal(gId) - 1;

      world
        .builder()
        // Tiled anchors tiles from the top left corner so we need to calculate the
        // center position manually.
        .use(new Transform((position[0] + tw2) / us, (position[1] + th2) / us))
        .use(new SpriteDisplay(tileset.tileset, idx))
        .build();
    }
  }

}

