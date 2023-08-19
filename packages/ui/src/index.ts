import { World } from '@heliks/tiles-engine';
import { Style } from './style';
import { UiComposer } from './ui-composer';
import { UiNode } from './ui-node';

export * from './layout';
export * from './widgets';

export * from './border-style';
export * from './draw-ui';
export * from './interaction-event';
export * from './ui-bundle';
export * from './ui-composer';
export * from './ui-node';
export * from './ui-widget';
export * from './update-interactions';


/**
 * Returns a {@link UiComposer} that provides a top-level API to compose Ui hierarchies.
 *
 * @see UiComposer
 */
export function composeUi(world: World, style: Partial<Style> = {}): UiComposer {
  const component = new UiNode(style.layer, style.space, style);

  return new UiComposer(world.builder().use(component), component);
}