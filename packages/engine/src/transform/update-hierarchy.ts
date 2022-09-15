import { Hierarchy, HierarchySystem as Base } from '@heliks/ecs-hierarchy';
import { Injectable } from '@heliks/tiles-injector';


/** @inheritDoc */
@Injectable()
export class UpdateHierarchy extends Base {

  constructor(hierarchy: Hierarchy) {
    super(hierarchy);
  }

}
