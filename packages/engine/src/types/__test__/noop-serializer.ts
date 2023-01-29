import { Type } from '../../utils/types';
import { TypeSerializationStrategy } from '../type-serialization-strategy';


export class NoopSerializer implements TypeSerializationStrategy<Type> {

  /** @inheritDoc */
  serialize = jest.fn();

  /** @inheritDoc */
  deserialize = jest.fn();

}
