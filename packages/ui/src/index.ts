import { World } from '@heliks/tiles-engine';
import { Style } from './style';
import { UiComposer } from './ui-composer';
import { UiNode } from './ui-node';


export * from './layout';
export * from './widgets';

export * from './systems/draw-ui';
export * from './ui-bundle';
export * from './ui-composer';
export * from './ui-event';
export * from './ui-node';
export * from './ui-widget';


/**
 * Returns a {@link UiComposer} that provides a top-level API to compose Ui hierarchies.
 *
 * @see UiComposer
 */
export function composeUi(world: World, style: Partial<Style> = {}): UiComposer {
  const component = new UiNode(style);

  return new UiComposer(world, world.insert(component), component);
}
