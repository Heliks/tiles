import { Transform, World } from '@tiles/engine';
import { Tilemap } from '../tilemap';
import { Renderer, SpriteDisplay } from '@tiles/pixi';
import { Layer, LayerProperties, WorldObject, WorldObjectType } from './layer';
import { BodyPartType, RigidBody } from '@tiles/physics';

/** A layer that contains world objects. */
export class ObjectLayer implements Layer<Tilemap> {

  constructor(
    public readonly data: WorldObject[],
    public readonly properties: LayerProperties
  ) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap, index: number): void {
    // Get the unit size from the renderer config.
    const us = world.get(Renderer).config.unitSize;

    for (const item of this.data) {
      const builder = world.builder().use(new Transform(
        item.x / us,
        item.y / us
      ));

      if (item.tileId) {
        const tileset = tilemap.tileset(item.tileId);

        builder
          .use(new SpriteDisplay(
            tileset.tileset,
            tileset.toLocal(item.tileId) - 1,
            index
          ))
          .build()
      }
      else {
        // Todo

        console.log(item);

        if (item.type === WorldObjectType.Trigger) {
          const body = new RigidBody()
            .attach({
              data: [
                item.width / us,
                item.height / us
              ],
              type: BodyPartType.Rect
            });

          body.damping = 10;

          builder.use(body).build();
        }
        else {
          console.warn('Unknown world object type. Skipping.', item);
        }
      }
    }
  }

}
