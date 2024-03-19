import { World } from '@heliks/tiles-engine';
import { UiNode } from '../ui-node';
import { TemplateComposer } from './template-composer';


export function template(world: World): TemplateComposer {
  return new TemplateComposer(
    world,
    world.insert(new UiNode())
  );
}
