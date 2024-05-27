import { World } from '@heliks/tiles-engine';
import { Style } from './style';
import { UiComposer } from './ui-composer';
import { UiNode } from './ui-node';


export * from './attributes';
export { AlignContent, FlexDirection, Node, Rect, Sides, Size, Unit, block, fill, auto, rect } from './layout';

export * from './elements';
export * from './providers';

export * from './attribute';
export * from './context';
export * from './element';
export * from './input';
export * from './lifecycle';
export * from './style';
export * from './ui-bundle';
export * from './ui-component';
export * from './ui-composer';
export * from './ui-element';
export * from './ui-event';
export * from './ui-node';


/**
 * Returns a {@link UiComposer} that provides a top-level API to compose Ui hierarchies.
 *
 * @see UiComposer
 */
export function composeUi(world: World, style: Partial<Style> = {}): UiComposer {
  const component = new UiNode(style);

  return new UiComposer(world, world.insert(component), component);
}
