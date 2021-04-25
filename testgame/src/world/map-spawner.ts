import { Injectable, Transform, World } from '@heliks/tiles-engine';
import { Tilemap } from '@heliks/tiles-tilemap';
import { GameObject, LayerType, ObjectLayer, Tileset, TmxMap } from '@heliks/tiles-tmx';
import { GameMap } from './game-map';
import { MapHierarchy } from './map-hierarchy';
import { ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { ObjectTypes } from './object-types';
import { createRigidBody } from './physics';

/** @internal */
function createObjectSprite(tileset: Tileset, tileId: number, obj: GameObject, layer = 0): SpriteDisplay {
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


@Injectable()
export class MapSpawner {

  constructor(
    private readonly hierarchy: MapHierarchy,
    private readonly types: ObjectTypes
  ) {}

  private spawnObject() {

  }

  private spawnObjectLayer(
    world: World,
    mapData: TmxMap,
    layerData: ObjectLayer,
    target: GameMap,
    offsetX = 0,
    offsetY = 0,
    z = 0
  ) {
    const us = world.get(ScreenDimensions).unitSize;

    const mw2 = mapData.grid.cols / 2;
    const mh2 = mapData.grid.rows / 2;

    for (const obj of layerData.data) {
      const entity = world
        .builder()
        .use(new Transform(
          (obj.data.x / us) - mw2 + offsetX,
          (obj.data.y / us) - mh2 + offsetY
        ));

      // Custom object properties. If this object is based on a tile we use the tile
      // properties as base and merge the object properties on top, because the user
      // is allowed to manipulate the base properties on an individual object basis.
      let props = obj.properties;

      if (obj.tileId) {
        const tileset = mapData.tileset(obj.tileId);

        const tileId = tileset.toLocal(obj.tileId) - 1;
        const tileProps = tileset.properties.get(tileId);

        // Merge object properties on top of tile properties if necessary../
        if (tileProps) {
          props = {
            ...props,
            ...tileProps
          };
        }

        entity.use(createObjectSprite(tileset, tileId, obj, z));

        const body = createRigidBody(tileset, tileId, us, props);

        if (body) {
          entity.use(body);
        }
      }

      if (obj.type) {
        this.types.get(obj.type)?.onSpawn(entity, props);
      }

      target.entities.push(entity.build());



      // If we still have no properties use fallback value to avoid checking them.

      /*


      const entity = world
        .builder()
        .use(new Transform(
          (obj.data.x / us) - mw2 + offsetX,
          (obj.data.y / us) - mh2 + offsetY
        ))
        .use(createObjectSprite(tileset, tileId, obj, z));

      const props = tileset.properties.get(tileId);

      // Animate the object.
      if (props?.animation) {
        entity.use(tileset.spritesheet.createAnimation(props.animation));
      }

      // Create and attach rigid body (if object needs one).
      const body = createRigidBody(tileset, tileId, us, props?.physicsBodyType);

      if (body) {
        entity.use(body);
      }

      // Create entity.
      target.entities.push(entity.build());
       */
    }
  }

  public spawn(world: World, map: TmxMap, x = 0, y = 0): GameMap {
    // Collection of all entities that were spawned on the map.
    const _map = new GameMap();

    for (const data of map.layers) {
      switch (data.type) {
        case LayerType.Tiles:
          const entity = world
            .builder()
            .use(new Transform(x, y))
            .use(new Tilemap(
              map.grid,
              map.tilesets,
              data.data,
              this.hierarchy.layer1
            ))
            .build();

          _map.entities.push(entity);
          break;
        case LayerType.Objects:
          this.spawnObjectLayer(world, map, data, _map, x, y, this.hierarchy.layer2);
          break;
      }
    }

    return _map;
  }

}
