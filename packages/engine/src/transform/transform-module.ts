import { Hierarchy } from '@heliks/ecs-hierarchy';
import { GameBuilder, Module } from '../game-builder';
import { HierarchySystem } from './hierarchy-system';
import { Transform } from './transform';
import { TransformSystem } from './transform-system';


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
