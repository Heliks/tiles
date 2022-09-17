// Re-export the entity system so that it can be imported from a local path. This has
// the benefit that other packages won't have to include the entity-system as a peer
// dependency.
export {
  Builder as EntityBuilder,
  ComponentEvent,
  ComponentEventType,
  ComponentType,
  Entity,
  EntityGroup,
  entityId,
  entityVersion,
  EntityQuery,
  Storage,
  System
} from '@heliks/ecs';

// Export hierarchy system..
export * from '@heliks/ecs-hierarchy';

export * from './change-aware-value';
export * from './storage';
export * from './processing-system';
export * from './reactive-system';
export * from './world';
