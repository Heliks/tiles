import { Entity, World } from '@heliks/tiles-engine';


/** A component that carries data of type `T`. */
export class Data<T = unknown> {

  /** The data that is being carried by this component. */
  constructor(public data: T) {}

  public static get<T = unknown>(world: World, entity: Entity): T {
    return world.storage(Data).get(entity).data;
  }

}
