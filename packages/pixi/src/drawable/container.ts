import { Container as BaseContainer } from 'pixi.js';
import { Drawable } from './drawable';
import { Vec2 } from '@heliks/tiles-math';

/**
 * A container to group multiple display objects.
 *
 * @typeparam T Kind of `Drawable` contained in this container.
 */
export class Container<T extends Drawable = Drawable> extends BaseContainer implements Drawable {

  /** @inheritDoc */
  public readonly children: T[] = [];

  /** @internal */
  private _pivot = 0;

  /**
   * If this is set operations that take the containers size into account will pretend
   * that the container is the size matching this value instead of determining it at
   * runtime by calculating the containers bounds (this is default behavior).
   *
   * Note: This is a workaround for PIXI automatically applying shit like scaling when
   *  attempting to set `width` or `height`. We also can't override this behavior without
   *  nasty hacks because accessors for both are declared as normal properties in their
   *  declarations file.
   */
  private fixedSize?: Vec2;

  /** Adds a `renderable` to the container. */
  public add(renderable: T): this {
    this.addChild(renderable);

    return this;
  }

  /** Removes a `renderable` from the container. */
  public remove(renderable: T): this {
    this.removeChild(renderable);

    return this;
  }

  /**
   * Updates the containers scale factor.
   *
   * This means that if we set a scale factor of `2`, a `Drawable` with a size of
   * 20x20px is rendered as 40x40px inside of it.
   */
  public rescale(x: number, y: number): this {
    this.scale.set(x, y);

    return this;
  }

  /**
   * Transforms the pivot by a percentage `value`. E.g. the value `0.5` will set the
   * pivot to the center of the container. This also updates the [[x]] and [[y]]
   * position according to the new pivot.
   */
  public setPivot(value: number): this {
    const size = this.getFixedSize();
    
    const hw = size.x * value;
    const hh = size.y * value;

    // Update position values to retain original position.
    this.x += hw;
    this.y += hh;

    this._pivot = value;
    this.pivot.set(hw, hh);

    return this;
  }

  /**
   * Sets a fixed size for the container. This does not modify the containers visual
   * representation but merely changes how the container calculates stuff.
   *
   * Note: Calling this method will re-calculate the containers pivot.
   */
  public setFixedSize(size: Vec2): this {
    this.fixedSize = size;

    // Re-calculate the pivot.
    this.setPivot(this._pivot);

    return this;
  }

  /**
   * Returns the size of a container.
   *
   * This is not *necessarily* the containers real, physical size, but rather the size
   * that the container is supposed to be. If the container has a fixed size the fixed
   * size is returned, otherwise the size is calculated based on the containers bounds.
   */
  public getFixedSize(): Vec2 {
    return this.fixedSize ? this.fixedSize : new Vec2(this.width, this.height);
  }

  /**
   * Shrinks the container down to its lowest possible size. The x and y position will
   * be adjusted to take the new size into account so that the container retains its
   * original position from before it was shrunk.
   */
  public shrink(): this {
    const children = this.children;

    // Find the lowest possible x and y values. DON'T use sort() here because that would
    // destroy the render order of the container.
    /* eslint-disable unicorn/no-reduce */
    const minX = children.reduce<number>((val, item) => val > item.x ? item.x : val, Infinity);
    const minY = children.reduce<number>((val, item) => val > item.y ? item.y : val, Infinity);
    /* eslint-enable unicorn/no-reduce */

    for (const child of children) {
      child.x -= minX;
      child.y -= minY;
    }

    this.x = minX;
    this.y = minY;

    return this;
  }

}
