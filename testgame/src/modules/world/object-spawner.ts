import { Entity, EntityBuilder, Transform, World } from '@heliks/tiles-engine';
import { createRigidBody } from './physics';
import { ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { GameObject, Tileset, TmxMap } from '@heliks/tiles-tmx';
import { Injectable } from '@heliks/tiles-injector';


@Injectable()
export abstract class ObjectSpawner {

  /**
   * @param screen {@see ScreenDimensions}
   */
  constructor(private readonly screen: ScreenDimensions) {}

  public createObjectSprite(tileset: Tileset, tileId: number, obj: GameObject, layer = 0): SpriteDisplay {
    const sprite = new SpriteDisplay(tileset.spritesheet, tileId, layer);

    // Get scale by comparing the objects actual size with the size that it is
    // supposed to be according to the tile size of its own tileset.
    sprite.scale.x = obj.data.width / tileset.tileWidth;
    sprite.scale.y = obj.data.height / tileset.tileHeight;

    // Flip accordingly.
    sprite.flip(obj.flipX, obj.flipY);

    // The origin position of objects is at their bottom center.
    sprite.setAnchor(0.5, 1);

    return sprite;
  }

  /**
   * Hook that is called after the entity for an object was created with all relevant
   * components. Use this in a custom object spawner to additionally modify the
   * entity based on custom `properties` or a custom object `type`.
   */
  protected abstract onObjectEntityCreated(entity: EntityBuilder, props: unknown, type?: string): void;

  public createObjectEntity(world: World, map: TmxMap, obj: GameObject, x = 0, y = 0, z = 0): EntityBuilder {
    const entity = world
      .builder()
      .use(new Transform(
        (obj.data.x / this.screen.unitSize) + x,
        (obj.data.y / this.screen.unitSize) + y
      ));

    // Custom object properties. If this object is based on a tile we use the tile
    // properties as base and merge the object properties on top, because the user
    // is allowed to manipulate the base properties on an individual object basis.
    let props = obj.properties;

    if (obj.tileId) {
      const tileset = map.tileset(obj.tileId);

      const tileId = tileset.toLocal(obj.tileId) - 1;
      const tileProps = tileset.properties.get(tileId);

      // Merge object properties on top of tile properties if necessary../
      if (tileProps) {
        props = {
          ...props,
          ...tileProps
        };
      }

      entity.use(this.createObjectSprite(tileset, tileId, obj, z));

      const body = createRigidBody(tileset, tileId, this.screen.unitSize, props);

      if (body) {
        entity.use(body);
      }
    }

    this.onObjectEntityCreated(entity, props, obj.type);

    return entity;
  }

  public spawn(world: World, map: TmxMap, obj: GameObject, x = 0, y = 0, z = 0): Entity {
    return this.createObjectEntity(world, map, obj, x, y, z).build();
  }

}
