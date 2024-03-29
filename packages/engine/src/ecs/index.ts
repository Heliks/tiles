// Re-export everything needed from ecs package. The ecs version is kinda non-negotiable
// so makes no sense to bundle this as a peer dependency.
export {
  Builder as EntityBuilder,
  ComponentEvent,
  ComponentEventType,
  ComponentType,
  Entity,
  EntityGroupEvent as EntityQueryEvent, // Todo: Rename this in ecs package
  entityId,
  entityVersion,
  Query,
  QueryBuilder,
  QueryManager,
  Storage,
  System
} from '@heliks/ecs';

export * from './change-aware-value';
export * from './entity-ref';
export * from './storage';
export * from './processing-system';
export * from './reactive-system';
export * from './world';
