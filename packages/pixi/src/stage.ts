import { Container } from 'pixi.js';
import { Renderable } from "./types";

/** */
export class Stage extends Container {

  /** @inheritDoc */
  public children: Container[] = [];

  /** The zIndex of the stage is fixed to `0` so that it is always rendered first. */
  public readonly zIndex = 0;

  /** Returns the `Container` that belongs to a `layer` index. */
  protected getLayerContainer(layer: number): Container {
    while (layer > this.children.length - 1) {
      this.addChild(new Container());
    }

    return this.children[layer];
  }

  /** Adds a `Renderable` to the stage. */
  public add(item: Renderable, layer = 0): this {
    this.getLayerContainer(layer).addChild(item);

    return this;
  }

  /** Removes a `Renderable` from all layers of the stage. */
  public remove(item: Renderable): this {
    for (const layer of this.children) {
      layer.removeChild(item);
    }

    return this;
  }

}
