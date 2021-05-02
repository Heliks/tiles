import { Injectable, Transform, World } from '@heliks/tiles-engine';
import { Tilemap } from '@heliks/tiles-tilemap';
import { LayerType, ObjectLayer, TmxMap } from '@heliks/tiles-tmx';
import { GameMap } from './game-map';
import { MapHierarchy } from './map-hierarchy';
import { ObjectSpawner } from './object-spawner';


@Injectable()
export class MapSpawner {

  constructor(
    private readonly hierarchy: MapHierarchy,
    private readonly objectSpawner: ObjectSpawner
  ) {}

  /** @internal */
  private spawnObjectLayer(
    world: World,
    map: TmxMap,
    layer: ObjectLayer,
    target: GameMap,
    offsetX = 0,
    offsetY = 0,
    z = 0): void {
    const mw2 = map.grid.cols / 2;
    const mh2 = map.grid.rows / 2;

    for (const obj of layer.data) {
      target.entities.push(this.objectSpawner.spawn(world, map, obj, -(mw2 + offsetX), -(mh2 + offsetY), z));
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
