import { setTypeId } from '@heliks/ecs-serialize';
import { Transform } from '@heliks/ecs-transform';

// Since we export this directly, manually assign a type ID.
setTypeId(Transform, '40998bd2-b2cc-4a13-b2e1-c52f70d67970');

export { Transform } from '@heliks/ecs-transform';
export { Hierarchy, Parent } from '@heliks/ecs-hierarchy';

export * from './transform-bundle';
