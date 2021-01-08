import { spawnLayer } from './spawners';
import { GameMap } from './game-map';
import { World } from '@heliks/tiles-engine';
import { TmxMap } from './parser';
import { RenderNode } from '@heliks/tiles-pixi';
import { Floor } from './floor';

/** @internal */
function getFloorCount(map: TmxMap): number {
  return map.layers.filter(layer => layer.properties.isFloor).length;
}

/**
 * Manager for active game maps.
 */
export class GameMapHandler {

  /** Contains the currently active game map. */
  public active?: GameMap;

  /**
   * Contains all map floors in the order of their level. This means that the floor at
   * index `0` is simultaneously floor level 0. The amount of floors can vary during
   * the the game as new ones are created when required or removed when no map needs
   * them anymore.
   */
  private floors: Floor[] = [];

  /**
   * Grows the amount of available floors to `size`. This doesn't increase the existing
   * amount by `size`, but rather creates as many floors until `size` is reached.
   */
  public growFloors(world: World, size: number): void {
    for (let i = 0, l = size - this.floors.length; i < l; i++) {
      this.floors.push(new Floor(
        world.create([ new RenderNode() ]),
        world.create([ new RenderNode(true) ]),
        world.create([ new RenderNode() ])
      ));
    }
  }

  /** Returns the `Floor` at `floor`. */
  public getFloor(floor: number): Floor {
    const item = this.floors[floor];

    if (!item) {
      throw new Error(`Floor ${floor} does not exist.`);
    }

    return item;
  }

  /** Todo: WIP */
  public spawn(world: World, asset: TmxMap): GameMap {
    const floors = getFloorCount(asset);

    // Grow new floors as needed.
    this.growFloors(world, floors);

    // The floor on which we are currently working on. Increased when we encounter a
    // layer that is flagged as floor.
    let floor = this.getFloor(0);

    // Flag to decide if a layer should be placed in the foreground or the background.
    let fg = false;

    const layers = [];

    for (let i = 0, l = asset.layers.length, f = 0; i < l; i++) {
      const data = asset.layers[i];

      let layer;

      if (data.properties.isFloor) {
        layer = spawnLayer(world, asset, data, floor.layer2);

        // If we are not on the last floor everything above layer2 will be placed on
        // layer1 of the next floor. If we are on the last floor however we place
        // everything after this floor layer in the foreground.
        if (f < (floors - 1)) {
          f++;
          floor = this.getFloor(f);
        }
        else {
          fg = true;
        }
      }
      else {
        layer = spawnLayer(
          world,
          asset,
          data,
          fg ? floor.layer3 : floor.layer1
        );
      }

      layers.push(layer);
    }

    return this.active = new GameMap(layers);
  }

}
