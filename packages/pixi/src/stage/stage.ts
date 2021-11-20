import { Injectable } from '@heliks/tiles-engine';
import { Container, Drawable } from '../drawable';
import { Filter } from 'pixi.js';


/**
 * The stage is where game objects are supposed to be rendered.
 *
 * Everything rendered here is scaled appropriately according to resolution and zoom
 * factor, which means that if we have a 200x200px screen with 100x100px resolution a
 * 20x20px `Drawable` would be scaled to the appropriate size of `40x40px`.
 *
 * @see Overlay
 * @see Renderer
 */
@Injectable()
export class Stage {

  /** Contains everything that the stage displays. */
  public readonly view = new Container();

  /** Returns all filters on the stage.*/
  public get filters(): Filter[] {
    return this.view.filters;
  }

  constructor() {
    // By default PIXI.JS has set this to `null`.
    this.view.filters = [];
  }

  /** Adds a `drawable` object. */
  public add(drawable: Drawable): this {
    this.view.add(drawable);

    return this;
  }

  /** Removes a `drawable`. */
  public remove(drawable: Drawable): this {
    this.view.removeChild(drawable);

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

}
