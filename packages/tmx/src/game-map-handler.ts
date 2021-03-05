import { Entity, Parent, System, Transform, World } from '@heliks/tiles-engine';
import { Chunk, GameObject, LayerType, TmxMap, TmxObjectData } from './parser';
import { Camera, RenderNode, ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { Injectable } from '@heliks/tiles-injector';
import { Tilemap } from '@heliks/tiles-tilemap';
import { Grid, Vec2 } from '@heliks/tiles-math';
import { MaterialId, RigidBody } from '@heliks/tiles-physics';
import { tmxShapeToColliderShape } from './collider';
import { Tileset } from '../../tilemap/lib';

/**
 * Internal shape types that are recognized by the map loader to provide basic functions
 * like collision out of the box.
 */
export const enum ShapeType {
  /** Shape should be treated as a physics collider. */
  COLLISION = 'collision',
}

/** Properties that can possibly occur on a shape of type `ShapeType.COLLISION`. */
export interface CollisionShapeProperties {
  /**
   * If the shape is a collider that is part of a rigid-body this will be assigned
   * as it's `Material`
   */
  physicsMaterial?: MaterialId;
}

export class LoadedChunk {
  public readonly entities: Entity[] = [];
}

/** Layers that are used to place objects. */
interface MapRenderHierarchy {
  /** Parent entity for entities that should be placed in the background. */
  layer1: Entity;
  /**
   * Parent entity for entities that should be placed on the entity layer. Entities on
   * this layer are automatically depth-sorted.
   */
  layer2: Entity;

  /** Parent entity for entities that should be placed in the foreground. */
  layer3: Entity;
}

export class GameMap implements MapRenderHierarchy {

  loadedChunks = new Set<number>();

  /** Contains all chunks that are currently loaded, mapped to the chunks index. */
  readonly chunks = new Map<number, LoadedChunk>();

  constructor(
    public readonly chunkGrid: Grid,
    public readonly data: TmxMap,
    public layer1: Entity,
    public layer2: Entity,
    public layer3: Entity
  ) {}

  /** Returns `true` if the chunk at `index` is currently loaded. */
  public isChunkLoaded(index: number): boolean {
    return this.chunks.has(index);
  }

  /** @internal */
  private static createObjectSprite(tileset: Tileset, tileId: number, obj: GameObject): SpriteDisplay {
    const sprite = new SpriteDisplay(tileset.spritesheet, tileId);

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

  private spawnObjectChunk(
    world: World,
    chunk: Chunk<GameObject[]>,
    loadedChunk: LoadedChunk,
    position: Vec2
  ) {
    const us = world.get(ScreenDimensions).unitSize;

    for (const obj of chunk.data) {
      const tileset = this.data.tileset(obj.tileId);
      const tileId = tileset.toLocal(obj.tileId) - 1;

      const entity = world
        .builder()
        .use(new Parent(this.layer2))
        .use(new Transform(
          position.x + (obj.data.x / us),
          position.y + (obj.data.y / us)
        ))
        .use(GameMap.createObjectSprite(
          tileset,
          tileId,
          obj
        ));

      const properties = tileset.properties.get(tileId) ?? {};

      // Add animation component if the properties specify an animation name.
      if (properties.animation) {
        entity.use(tileset.spritesheet.createAnimation(properties.animation));
      }

      const colliders = tileset.shapes.get(tileId)?.filter(item => item.type === ShapeType.COLLISION);

      // If we have any collision shapes we add a rigid body to the object, using the
      // shapes as colliders.
      if (colliders && colliders.length > 0) {
        const body = new RigidBody(properties.physicsBodyType);

        for (const shape of colliders) {
          body.attach(tmxShapeToColliderShape(shape, us), {
            material: shape.properties.physicsMaterial as any
          });
        }

        entity.use(body);
      }

      loadedChunk.entities.push(entity.build());
    }
  }

  public spawnChunk(world: World, index: number): LoadedChunk {
    // Flag to decide if a layer should be placed in the foreground or the background.
    let bg = true;

    const loadedChunk = new LoadedChunk();
    const position = this.data.chunks.position(index);

    for (let i = 0, l = this.data.layers.length; i < l; i++) {
      const layer = this.data.layers[i];

      if (!layer.hasChunkAt(index)) {
        continue;
      }

      // Determine if we should attach the layer to the foreground or background.
      const parent = bg ? this.layer1 : this.layer3;

      // If an NPC layer is encountered we place every other layer that comes after-
      // wards in the foreground.
      if (layer.properties.isFloor) {
        bg = false;
      }

      switch (layer.type) {
        case LayerType.Tiles:
          const chunkData = layer.getChunkAt(index);

          // Insert tilemap into the world.
          const tilemap = world
            .builder()
            .use(new Transform(
              position.x + (chunkData.grid.cols / 2),
              position.y + (chunkData.grid.rows / 2)
            ))
            .use(new Tilemap(
              chunkData.grid,
              this.data.tilesets,
              chunkData.data,
              parent
            ))
            .use(new Parent(parent))
            .build();

          loadedChunk.entities.push(tilemap);
          break;
        case LayerType.Objects:
          this.spawnObjectChunk(world, layer.getChunkAt(index), loadedChunk, position);
          break;
      }
    }

    this.chunks.set(index, loadedChunk);

    return loadedChunk;
  }

  /**
   * De-spawns a chunk. Returns `false` if the chunk could not be de-spawned because
   * it wasn't loaded in the first place.
   */
  public despawnChunk(world: World, index: number): boolean {
    const chunk = this.chunks.get(index);

    if (chunk) {
      for (const entity of chunk.entities) {
        world.destroy(entity);
      }

      this.chunks.delete(index);

      return true;
    }

    return false;
  }

}

/**
 * Manager for active game maps.
 */
@Injectable()
export class GameMapHandler implements System, MapRenderHierarchy {

  /** Contains the currently active game map. */
  public active?: GameMap;

  /** @inheritDoc */
  public layer1!: Entity;

  /** @inheritDoc */
  public layer2!: Entity;

  /** @inheritDoc */
  public layer3!: Entity;

  /**
   * The index of the chunk on which the camera is currently located on. This is used
   * to determine if the camera has moved from one chunk to another and spawn or
   * de-spawn chunks if necessary.
   */
  private chunkIndex = -1;

  /** @inheritDoc */
  public boot(world: World): void {
    this.layer1 = world.create([ new RenderNode() ]);
    this.layer2 = world.create([ new RenderNode(true) ]);
    this.layer3 = world.create([ new RenderNode() ]);
  }

  /** @inheritDoc */
  public update(world: World): void {
    const map = this.active;

    if (!map) {
      return;
    }

    const camera = world.get(Camera);
    const cameraChunk = map.chunkGrid.index(camera.local.x, camera.local.y);

    // Check if we moved to a different chunk.
    if (cameraChunk !== this.chunkIndex) {
      const chunks = map.chunkGrid.getNeighbourIndexes(cameraChunk);

      chunks.unshift(cameraChunk);

      // Unload chunks that are no longer needed.
      for (const index of map.chunks.keys()) {
        if (!chunks.includes(index)) {
          map.despawnChunk(world, index);
        }
      }

      // Load new chunks.
      for (const index of chunks) {
        if (!map.isChunkLoaded(index)) {
          map.spawnChunk(world, index);
        }
      }

      this.chunkIndex = cameraChunk;
    }
  }

  /** Todo: WIP */
  public spawn(world: World, map: TmxMap): void {
    this.active = new GameMap(
      map.chunks,
      map,
      this.layer1,
      this.layer2,
      this.layer3
    );
  }

}
