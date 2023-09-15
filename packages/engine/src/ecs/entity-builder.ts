import { EntityBuilder as Base } from '@heliks/ecs';
import { Parent } from '@heliks/ecs-hierarchy';


/** Factory to create a child entity. */
export type ChildFactory<B extends Base> = (builder: B) => void;


/** @inheritDoc*/
export class EntityBuilder extends Base {

  /**
   * Creates an entity that is a child of the entity that we are currently creating
   * with this builder.
   */
  public child(factory?: ChildFactory<EntityBuilder>): this {
    const builder = new EntityBuilder(this.world, this.world.insert());

    factory?.(builder);

    builder.use(new Parent(this.entity)).build();

    return this;
  }

}
