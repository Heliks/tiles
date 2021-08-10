// Re-export the entity system so that it can be imported from a local path. This has
// the benefit that other packages won't have to include the entity-system as a peer
// dependency.
export {
  Builder as EntityBuilder,
  ComponentEvent,
  ComponentEventType,
  Entity,
  EntityGroup,
  entityId,
  entityVersion,
  EntityQuery,
  Storage,
  System
} from '@heliks/ecs';

export * from '@heliks/ecs-hierarchy';

export * from './processing-system';
export * from './reactive-system';
export * from './world';
