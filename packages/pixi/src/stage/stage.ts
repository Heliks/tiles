import { Injectable } from '@heliks/tiles-engine';
import { Container, Renderable } from '../renderables';
import { Layer } from './layer';
import { Layers } from './layers';

@Injectable()
export class Stage {

  /** Contains everything that the stage displays. */
  public readonly view = new Container<Layer>();

  /** Stage layers. */
  public readonly layers: Layers;

  constructor() {
    this.layers = new Layers(this.view);
  }

  /**
   * Adds a `renderable`. If a `node` is provided it will be added as a child of that
   * node instead of the stage root. Throws when the given node is invalid.
   */
  public add(renderable: Renderable, layer = 0): this {
    this.layers.get(layer).add(renderable);

    return this;
  }

  /** Removes a `renderable` from the stage. */
  public remove(renderable: Renderable): this {
    // Disable the false-positive unicorn rule.
    // eslint-disable-next-line unicorn/prefer-node-remove
    renderable.parent.removeChild(renderable);

    return this;
  }

  /**
   * Scales the stage along its `x` and `y` axis. If no `y` axis is given the stage
   * will be scaled by ratio (y = x).
   */
  public scale(x: number, y?: number): this {
    this.view.scale.set(x, y ?? x);

    return this;
  }

  /** Sets the stage position. */
  public setPosition(x: number, y: number): void {
    this.view.x = x * this.view.scale.x;
    this.view.y = y * this.view.scale.y;
  }

}
