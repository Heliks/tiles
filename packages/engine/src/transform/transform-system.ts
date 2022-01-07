import { TransformSystem as Base } from '@heliks/ecs-transform'
import { Injectable } from "@heliks/tiles-injector";
import { Hierarchy } from '@heliks/ecs-hierarchy';


/** @inheritDoc */
@Injectable()
export class TransformSystem extends Base {

  constructor(hierarchy: Hierarchy) {
    super(hierarchy);
  }

}
