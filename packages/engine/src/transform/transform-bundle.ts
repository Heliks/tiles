import { Hierarchy, Parent } from '@heliks/ecs-hierarchy';
import { Transform } from '@heliks/ecs-transform';
import { UpdateHierarchy } from './update-hierarchy';
import { UpdateTransforms } from './update-transforms';
import { Bundle, AppBuilder } from '../app';


/**
 * Bundle that provides a hierarchical transform system. This module is optional.
 *
 * @see Transform
 * @see Hierarchy
 */
export class TransformBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    const hierarchy = new Hierarchy();

    builder
      .component(Parent)
      .component(Transform)
      .provide({
        token: Hierarchy,
        value: hierarchy
      })
      .system(UpdateHierarchy)
      .system(UpdateTransforms);
  }

}
