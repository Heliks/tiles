import { Tilemap } from './tilemap';
import { Transform, World } from '@heliks/tiles-engine';
import { SpriteDisplay } from '@heliks/tiles-pixi';
import { MapObject } from './map-object';

export class Tile extends MapObject<Tilemap> {

  /**
   * @param id An Id that is unique on the map on which the object is contained.
   * @param tileId Id of the tile that should be displayed.
   */
  constructor(id: number, public tileId: number) {
    super(id);
  }

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    const tileset = tilemap.tileset(this.tileId);

    world
      .builder()
      .use(new Transform(this.x / 16, this.y / 16))
      .use(new SpriteDisplay(
        tileset.spritesheet,
        tileset.toLocal(this.tileId) - 1,
        index
      ))
      .build();
  }

}
