import { GameBuilder, Module } from '../game-builder';
import { Hierarchy } from '@heliks/ecs-hierarchy';
import { HierarchySystem } from './hierarchy-system';
import { TransformSystem } from './transform-system';
import { Transform } from './transform';


/**
 * Optional module that provides a simple hierarchical transform system. This module
 * is not required to use the `Transform` component independently.
 */
export class TransformModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    const hierarchy = new Hierarchy();

    builder
      .component(Transform)
      .provide({
        token: Hierarchy,
        value: hierarchy
      })
      .system(HierarchySystem)
      .system(TransformSystem);
  }

}
