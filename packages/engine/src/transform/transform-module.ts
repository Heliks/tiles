import { GameBuilder, Module } from '../game-builder';
import { Hierarchy } from '@heliks/ecs-hierarchy';
import { HierarchySystem } from './hierarchy-system';
import { TransformSystem } from './transform-system';

/**
 * Module that provides a simple hierarchical transform system.
 * Note: You do not need this module to use the `Transform` component independently.
 */
export class TransformModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    const hierarchy = new Hierarchy();

    builder
      .provide({
        token: Hierarchy,
        value: hierarchy
      })
      .system(HierarchySystem)
      .system(TransformSystem);
  }

}
