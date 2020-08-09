import { Transform, Vec2, World } from '@heliks/tiles-engine';
import { Tilemap } from './tilemap';
import { Container, Renderer, SpriteDisplay } from '@heliks/tiles-pixi';
import { Layer } from './layer';

/** A layer that contains tiles structured in a grid. */
export class TileLayer implements Layer<Tilemap> {

  /** @inheritDoc */
  public readonly isFloorLayer = false;

  constructor(public readonly data: number[]) {}

  /** @internal */
  private *iter(tilemap: Tilemap): IterableIterator<{ gId: number; pos: Vec2 }> {
    for (let i = 0, l = this.data.length; i < l; i++) {
      const gId = this.data[i];

      // A global tile ID "0" means that no tile exists at this index.
      if (gId === 0) {
        continue;
      }

      yield {
        gId: gId,
        pos: tilemap.grid.pos(i)
      };
    }
  }

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    // Get the unit size from the renderer config.
    const us = world.get(Renderer).config.unitSize;

    for (const { gId, pos } of this.iter(tilemap)) {
      const tileset = tilemap.tileset(gId);
      const idx = tileset.toLocal(gId) - 1;

      // Grids are top left aligned. Convert to center aligned world position.
      tilemap.grid.toCenter(pos);

      world
        .builder()
        .use(new Transform(
          pos[0] / us,
          pos[1] / us
        ))
        .use(new SpriteDisplay(tileset.tileset, idx, index))
        .build();
    }
  }

  /** @inheritDoc */
  public render(world: World, tilemap: Tilemap, target: Container): void {
    for (let { gId, pos } of this.iter(tilemap)) {
      const tileset = tilemap.tileset(gId);
      const idx = tileset.toLocal(gId) - 1;

      const sprite = tileset.tileset.sprite(idx);

      sprite.x = pos[0];
      sprite.y = pos[1];

      target.addChild(sprite);
    }
  }

}

