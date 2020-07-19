import { Struct, Transform, World } from '@tiles/engine';
import { Tilemap } from '../tilemap';
import { Renderer, SpriteDisplay } from '@tiles/pixi';
import { Layer, WorldObject, WorldObjectType } from './layer';
import { BodyPartType, RigidBody, RigidBodyType } from '@tiles/physics';
import { CollisionGroups } from '@tiles/test/src/const';

/** A layer that contains world objects. */
export class ObjectLayer implements Layer<Tilemap> {

  constructor(
    public readonly data: WorldObject[],
    public readonly properties: Struct
  ) {}

  /** @inheritDoc */
  public spawn(world: World, tilemap: Tilemap): void {
    // Get the unit size from the renderer config.
    const us = world.get(Renderer).config.unitSize;

    for (const item of this.data) {

      const builder = world
        .builder()
        .use(new Transform(item.x / us, item.y / us));

      if (item.tileId) {
        const tileset = tilemap.tileset(item.tileId);
        const idx = tileset.toLocal(item.tileId) - 1;

        builder
          .use(new SpriteDisplay(tileset.tileset, idx))
          .build()
      }
      else {
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
