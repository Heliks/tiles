import { Bundle, GameBuilder } from '../game';
import { EntitySerializer } from './entity-serializer';
import { TypeDataSerializer } from './type-data-serializer';


/**
 * Provides APIs for different kinds of serialization.
 *
 * - For ECS entities and components: {@link EntitySerializer}.
 * - For known types: {@link TypeDataSerializer}.
 */
export class SerializationBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide(TypeDataSerializer)
      .provide(EntitySerializer);
  }

}
