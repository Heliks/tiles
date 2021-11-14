import { Injectable } from '@heliks/tiles-engine';
import { Container, Drawable } from '../drawable';
import { Layer } from './layer';
import { Layers } from './layers';
import { Filter } from 'pixi.js';

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

  /** Adds a `renderable` object. */
  public add(renderable: Drawable): this {
    this.view.add(renderable);

    return this;
  }

  /** Removes a `renderable`. */
  public remove(renderable: Drawable): this {
    this.view.removeChild(renderable);

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
