import { Hierarchy, Parent } from '@heliks/ecs-hierarchy';
import { Transform } from '@heliks/ecs-transform';
import { AppBuilder, Bundle } from '../app';
import { UpdateHierarchy } from './update-hierarchy';
import { UpdateTransforms } from './update-transforms';


/**
 * Bundle that provides a hierarchical transform system. This module is optional.
 *
 * @see Transform
 * @see Hierarchy
 */
export class TransformBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    // Manually assign type IDs to serialize-able types that we import from 3rd party libs.
    builder
      .type(Transform, 'tiles_transform')
      .component(Parent)
      .component(Transform)
      .provide(Hierarchy, new Hierarchy())
      .system(UpdateHierarchy)
      .system(UpdateTransforms);
  }

}
