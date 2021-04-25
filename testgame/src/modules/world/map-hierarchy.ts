import { Stage } from '@heliks/tiles-pixi';
import { Injectable } from '@heliks/tiles-injector';

@Injectable()
export class MapHierarchy {

  /**
   * Index of the render layer where the background should be placed.
   */
  public readonly layer1: number;

  /**
   * Index of the layer where NPCs and other entities should be placed. This layer is
   * automatically depth-sorted on the CPU.
   */
  public readonly layer2: number;

  /**
   * Index of the render layer where the foreground should be placed.
   */
  public readonly layer3: number;

  constructor(stage: Stage) {
    this.layer1 = stage.layers.add(false);
    this.layer2 = stage.layers.add(true);
    this.layer3 = stage.layers.add(false);
  }

}
