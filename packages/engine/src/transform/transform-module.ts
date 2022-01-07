import { GameBuilder, Module } from '../game-builder';
import { Hierarchy, Parent } from '@heliks/ecs-hierarchy';
import { HierarchySystem } from './hierarchy-system';
import { TransformSystem } from './transform-system';
import { Transform } from '@heliks/ecs-transform';


/**
 * Module that provides a hierarchical transform system. This module is optional.
 *
 * @see Transform
 * @see Hierarchy
 */
export class TransformModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    const hierarchy = new Hierarchy();

    builder
      .component(Parent)
      .component(Transform)
      .provide({
        token: Hierarchy,
        value: hierarchy
      })
      .system(HierarchySystem)
      .system(TransformSystem);
  }

}
