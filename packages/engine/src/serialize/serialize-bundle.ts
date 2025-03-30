import { AppBuilder, Bundle } from '../app';
import { EntitySerializer, TypeSerializer } from './serializers';


/**
 * Provides resources for entity & component serialization.
 *
 * @see EntitySerializer
 * @see TypeSerializer
 */
export class SerializeBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .provide(TypeSerializer)
      .provide(EntitySerializer);
  }

}
