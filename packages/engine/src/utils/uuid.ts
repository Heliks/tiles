import { UUID } from '@heliks/ecs-serialize';
import { v4, v5 } from 'uuid';


/** Namespace used to generate uuids from a seed string. */
const UUID_NAMESPACE = '0fd91390-0b98-4c7d-a434-84a153c8bbb4';

/** Creates a {@link UUID}. */
export function uuid(seed?: string): UUID {
  return seed ? v5(seed, UUID_NAMESPACE) : v4();
}
