import { EntitySerializer, TypeSerializer } from '@heliks/ecs-serialize';
import { AppBuilder, Bundle } from '../app';


/**
 * Provides resources for entity & component serialization.
 *
 * @see EntitySerializer
 * @see TypeSerializer
 */
export class SerializeBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    const types = new TypeSerializer();

    app
      .provide(TypeSerializer, types)
      .provide(EntitySerializer, new EntitySerializer(types));
  }

}