import {
  AppBuilder,
  Bundle,
  Entity,
  Injectable,
  ProcessingSystem,
  Query,
  QueryBuilder,
  Transform,
  World
} from '@heliks/tiles-engine';
import { TmxTilemap } from './tmx-tilemap';
import { AssetLoader, AssetStorage, Handle } from '@heliks/tiles-assets';
import { TileLayer } from './layers';
import { Tilemap } from '@heliks/tiles-tilemap';
import { Parent } from '@heliks/tiles-engine/lib/transform/parent';
import { Align, LayerId, SpriteRender } from '@heliks/tiles-pixi';
import { LoadTileset } from './load-tileset';
import { LoadTilemap } from './load-tilemap';
import { TmxConfig } from './tmx-config';
import { MapSpawner } from './spawner/map-spawner';


/**
 * Component that can be attached to an entity to display a {@link TmxTilemap}.
 *
 * When the tilemap asset has finished loading, a hierarchy of entities is created to
 * compose the map. This hierarchy is always a child of the owner of this component.
 *
 * When the map is being reloaded (See: {@link dirty}), the entity hierarchy is destroyed
 * and recreated in the process. Therefore, the persistence of manually added or removed
 * components of entities in the hierarchy can not be guaranteed.
 */
export class TmxMap {

  /**
   * If set to `true`, the map will be reloaded. Deleting all child entities of the owner
   * of this component and re-creating the map scene.
   */
  public dirty = true;

  /**
   * @param handle Asset handle of the {@link TmxTilemap} asset.
   */
  constructor(public handle?: Handle<TmxTilemap>) {}

}


@Injectable()
export class TmxSystem extends ProcessingSystem {

  constructor(
    private readonly assets: AssetStorage,
    private readonly spawner: MapSpawner
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(TmxMap).build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const storage = world.storage(TmxMap);

    for (const entity of this.query.entities) {
      const component = storage.get(entity);

      if (component.dirty && component.handle) {
        const map = this.assets.get(component.handle)?.data;

        if (map) {
          this.spawner.spawn(world, map, entity);

          // Update is done.
          component.dirty = false;
        }
      }
    }
  }

}

/** @internal */
function setupAssetFormats(world: World): void {
  world
    .get(AssetLoader)
    .use(new LoadTileset())
    .use(new LoadTilemap());
}

/**
 * Bundle that manages the spawning of {@link TmxTilemap} assets.
 *
 * ## Physics
 *
 * ### Measurements
 *
 * If physics are involved it's usually recommended to not use pixel values for positions
 * and measurements, as most physics engines work best with small numbers. To allow this,
 * the tmx spawner can convert appropriate units with a `unitSize`. For example, a shape
 * that would normally be 32x32 pixels, would only be 2x2 with a unit size of `16`.
 *
 * ### Ellipses
 *
 * The physics engine doesn't support elliptic shapes, hence why they will be converted
 * to circles when the TMX file is parsed. The radius of the circle is the larger of
 * the two sides of the ellipsis.
 */
export class TmxBundle implements Bundle {

  /**
   * @param unitSize Amount of pixels that are equivalent to one game unit.
   */
  constructor(public unitSize = 1) {}

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .provide({
        token: TmxConfig,
        value: new TmxConfig(this.unitSize)
      })
      .provide(MapSpawner)
      .system(TmxSystem)
      .run(setupAssetFormats);
  }

}
