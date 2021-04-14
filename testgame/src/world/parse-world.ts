import { getDirectory, LoadType } from '@heliks/tiles-assets';
import { Format } from '@heliks/tiles-assets';
import { GameWorld } from './game-world';

interface TmxWorldMapAsset {
  fileName: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface TmxWorldData {
  maps: TmxWorldMapAsset[];
}

/** Asset loader format for loading TMX tilemaps. */
export class ParseWorld implements Format<TmxWorldData, GameWorld> {

  /** @inheritDoc */
  public readonly name = 'tmx-world';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  constructor(private readonly unitSize = 1) {}

  /** Parses `TmxWorldData` and converts it to a `GameWorld` */
  public process(data: TmxWorldData, file: string): GameWorld {
    const world = new GameWorld();

    for (const map of data.maps) {
      world.setChunk(
        `${getDirectory(file)}/${map.fileName}`,
        map.height / this.unitSize,
        map.width / this.unitSize,
        map.x / this.unitSize,
        map.y / this.unitSize
      )
    }

    return world;
  }

}
