import { Injectable, Transform, World } from '@heliks/tiles-engine';
import { Tilemap } from '@heliks/tiles-tilemap';
import { LayerType, TmxMap } from '@heliks/tiles-tmx';
import { GameMap } from './game-map';
import { spawnObjectLayer } from './objects';
import { MapHierarchy } from './map-hierarchy';

@Injectable()
export class MapSpawner {

  constructor(private readonly hierarchy: MapHierarchy) {}

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
          spawnObjectLayer(world, map, data, _map, x, y, this.hierarchy.layer2);
          break;
      }
    }

    return _map;
  }

}
