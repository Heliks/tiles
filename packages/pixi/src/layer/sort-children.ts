import { Injectable, System } from "@heliks/tiles-engine";
import { Layers } from './layers';


@Injectable()
export class SortChildren implements System {

  /**
   * @param layers {@see Layers}
   */
  constructor(private readonly layers: Layers) {}

  /** @inheritDoc */
  public update(): void {
    for (const layer of this.layers.items) {
      layer.sort();
    }
  }

}
