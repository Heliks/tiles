import { Entity, Game, Parent, System, Transform, World } from '@heliks/tiles-engine';
import { Chunk, GameObject, LayerType, TmxMap } from './parser';
import { Camera, RenderNode, ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { Injectable } from '@heliks/tiles-injector';
import { Tilemap } from '@heliks/tiles-tilemap';
import { Grid, Vec2 } from '@heliks/tiles-math';
import { MaterialId, RigidBody } from '@heliks/tiles-physics';
import { tmxShapeToColliderShape } from './collider';

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



export class GameMap {

  loadedChunks = new Set<number>();

  /** Contains all chunks that are currently loaded, mapped to the chunks index. */
  readonly chunks = new Map<number, LoadedChunk>();

  constructor(
    public readonly chunkGrid: Grid,
    public readonly data: TmxMap
  ) {}

  public isChunkLoaded(index: number): boolean {
    return this.chunks.has(index);
  }

  public setLoadedChunk(index: number, chunk: LoadedChunk) {
    this.chunks.set(index, chunk);
  }

  public getLoadedChunk(index: number): LoadedChunk {
    const chunk = this.chunks.get(index);

    if (!chunk) {
      throw new Error(`Chunk ${index} is not loaded`);
    }

    return chunk;
  }

}

/**
 * Manager for active game maps.
 */
@Injectable()
export class GameMapHandler implements System {

  /** Contains the currently active game map. */
  public active?: GameMap;

  /** Parent entity for entities that should be placed in the background. */
  public layer1!: Entity;

  /**
   * Parent entity for entities that should be placed on the entity layer. Entities on
   * this layer are automatically depth-sorted.
   */
  public layer2!: Entity;

  /** Parent entity for entities that should be placed in the foreground. */
  public layer3!: Entity;



  public update(world: World): void {
    const camera = world.get(Camera);

    const map = this.active;

    if (map) {
      const chunkIndex = map.chunkGrid.index(camera.local.x, camera.local.y);

      if (!map.isChunkLoaded(chunkIndex)) {
        this.spawnChunk(world, chunkIndex);

        for (const loadedChunkIndex of map.chunks.keys()) {
          if (loadedChunkIndex !== chunkIndex) {
            this.deSpawnChunk(world, loadedChunkIndex);
          }
        }
      }
    }
  }

  public boot(world: World): void {
    this.layer1 = world.create([ new RenderNode() ]);
    this.layer2 = world.create([ new RenderNode(true) ]);
    this.layer3 = world.create([ new RenderNode() ]);
  }

  public getActiveMap(): GameMap {
    if (!this.active) {
      throw new Error('No map is currently spawned.');
    }

    return this.active;
  }

  private spawnObjectChunk(
    world: World,
    chunk: Chunk<GameObject[]>,
    loadedChunk: LoadedChunk,
    position: Vec2
  ) {
    const map = this.getActiveMap().data;
    const us = world.get(ScreenDimensions).unitSize;

    for (const obj of chunk.data) {
      const tileset = map.tileset(obj.tileId);
      const tileId = tileset.toLocal(obj.tileId) - 1;

      const sprite = new SpriteDisplay(tileset.spritesheet, tileId);

      // Get scale by comparing the objects actual size with the size that it is
      // supposed to be according to the tile size of its own tileset.
      sprite.scale.x = obj.data.width / tileset.tileWidth;
      sprite.scale.y = obj.data.height / tileset.tileHeight;

      // Flip it accordingly.
      sprite.flip(obj.flipX, obj.flipY);

      // The origin position of objects is at their bottom center.
      sprite.setAnchor(0.5, 1);

      const entity = world
        .builder()
        .use(new Transform(
          position.x + (obj.data.x / us),
          position.y + (obj.data.y / us)
        ))
        .use(new Parent(this.layer2))
        .use(sprite);

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

  public deSpawnChunk(world: World, index: number) {
    const map = this.getActiveMap();
    const chunk = map.getLoadedChunk(index);

    for (const entity of chunk.entities) {
      world.destroy(entity);
    }

    map.chunks.delete(index);
  }

  public spawnChunk(world: World, index: number): LoadedChunk {
    const map = this.getActiveMap();

    // Flag to decide if a layer should be placed in the foreground or the background.
    let bg = true;

    const loadedChunk = new LoadedChunk();
    const position = map.data.chunks.position(index);

    for (let i = 0, l = map.data.layers.length; i < l; i++) {
      const layer = map.data.layers[i];

      if (!layer.hasChunkAt(index)) {
        continue;
      }

      const chunk = layer.getChunkAt(index);

      // Determine if we should attach the layer to the foreground or background.
      const parent = bg ? this.layer1 : this.layer3;

      // If an NPC layer is encountered we place every other layer that comes after-
      // wards in the foreground.
      if (layer.properties.isFloor) {
        bg = false;
      }

      switch (layer.type) {
        case LayerType.Tiles:
          // Insert tilemap into the world.
          const tilemap = world
            .builder()
            .use(new Transform(
              position.x + (chunk.grid.cols / 2),
              position.y + (chunk.grid.rows / 2)
            ))
            .use(new Tilemap(
              chunk.grid,
              map.data.tilesets,
              chunk.data,
              parent
            ))
            .use(new Parent(parent))
            .build();

          loadedChunk.entities.push(tilemap);
          break;
        case LayerType.Objects:
          this.spawnObjectChunk(world, chunk, loadedChunk, position);
          break;
      }
    }

    map.setLoadedChunk(index, loadedChunk);

    return loadedChunk;
  }

  /** Todo: WIP */
  public spawn(world: World, asset: TmxMap) {
    (window as any).FOOBAR = this;


    const chunkIndex = 1;

    // this.spawnChunk(world, asset, 0);
    // this.spawnChunk(world, asset, 1);
    // this.spawnChunk(world, asset, 2);
    // this.spawnChunk(world, asset, 3);

    const map = new GameMap(asset.chunks, asset);





    this.active = map;


  }

}
