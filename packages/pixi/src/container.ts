import { Container as BaseContainer } from 'pixi.js';
import { Renderable } from './renderable';

/**
 * A container that can contain many for other renderable objects. The container itself
 * is a `Renderable` also.
 */
export class Container<T extends Renderable = Renderable> extends BaseContainer implements Renderable {

  /** @inheritDoc */
  public readonly children: T[] = [];

  /**
   * Transforms the pivot by a percentage `value`. E.g. the value `0.5` will set the
   * pivot to the center of the container. This also updates the [[x]] and [[y]]
   * position according to the new pivot.
   */
  public setPivot(value: number) {
    const hw = this.width * value;
    const hh = this.height * value;

    this.pivot.set(hw, hh);

    // Convert position values to retain original position.
    this.x += hw;
    this.y += hh;

    return this;
  }

  /**
   * Shrinks the container down to its lowest possible size. The x and y position will be
   * adjusted to take the new size into account so that the container retains its original
   * position from before it was shrunk.
   */
  public shrink(): this {
    const children = this.children;

    // Find the lowest possible x and y values. DON'T use sort() here because that would
    // destroy the render order of the container.
    const minX = children.reduce<number>((val, item) => val > item.x ? item.x : val, Infinity);
    const minY = children.reduce<number>((val, item) => val > item.y ? item.y : val, Infinity);

    for (const child of children) {
      child.x -= minX;
      child.y -= minY;
    }

    this.x = minX;
    this.y = minY;

    return this;
  }

}
