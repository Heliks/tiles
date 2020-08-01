import { Container as BaseContainer, DisplayObject } from 'pixi.js';

/** Something that can be displayed by the renderer. */
export type Renderable = DisplayObject;

/**
 * A container that can contain many for other renderable objects. The container itself
 * is a `Renderable` also.
 */
export class Container<T extends Renderable = Renderable> extends BaseContainer implements Renderable {
  /** @inheritDoc */
  public readonly children: T[] = [];
}
