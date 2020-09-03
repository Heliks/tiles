// Re-export the entity system so that it can be imported from a local path. This has
// the benefit that other packages won't have to include the entity-system as a peer
// dependency.
export {
  ComponentEvent,
  ComponentEventType,
  Entity,
  EntityGroup,
  entityId,
  entityVersion,
  Query as EntityQuery,
  Storage,
  System
} from '@heliks/ecs';

export * from './processing-system';
export * from './world';
