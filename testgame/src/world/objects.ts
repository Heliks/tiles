import { GameObject, ObjectLayer, Tileset, TmxMap } from '@heliks/tiles-tmx';
import { ShapeType, tmxShapeToColliderShape } from './collider';
import { ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { Transform, World } from '@heliks/tiles-engine';
import { RigidBody, RigidBodyType } from '@heliks/tiles-physics';
import { GameMap } from './game-map';

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

/** @internal */
function createRigidBody(
  tileset: Tileset,
  tileId: number,
  us: number,
  type?: RigidBodyType
): RigidBody | undefined {
  // Get all collider type shapes.
  const colliders = tileset.shapes.get(tileId)?.filter(item => item.type === ShapeType.COLLISION);

  // If we found any collision shapes we add a rigid body to the object, using the
  // shapes as colliders.
  if (colliders && colliders.length > 0) {
    const body = new RigidBody(type);

    for (const shape of colliders) {
      body.attach(tmxShapeToColliderShape(shape, us), {
        material: shape.properties.physicsMaterial as any
      });
    }

    return body;
  }

}

/**
 * Utility to spawn an object layer. All entities that are created in the process
 * will be added to `target`.
 *
 * @param world Entity world.
 * @param mapData The map asset to which the layer belongs.
 * @param layerData The layer data that we want to spawn.
 * @param target The `GameMap` to which the spawned entities should be added to.
 * @param offsetX (optional) Offset position on x axis in game units.
 * @param offsetY (optional) Offset position on y axis in game units.
 * @param z (optional) Render layer
 * @private
 */
export function spawnObjectLayer(
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
    const tileset = mapData.tileset(obj.tileId);
    const tileId = tileset.toLocal(obj.tileId) - 1;

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
  }
}
