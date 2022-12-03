// Re-export everything needed from ecs package. The ecs version is kinda non-negotiable
// so makes no sense to bundle this as a peer dependency.
export {
  ComponentEvent,
  ComponentEventType,
  ComponentType,
  Entity,
  entityId,
  entityVersion,
  Query,
  QueryBuilder,
  QueryEvent,
  QueryEventType,
  QueryManager,
  Storage,
  System
} from '@heliks/ecs';

export * from './change-aware-value';
export * from './entity-builder';
export * from './entity-ref';
export * from './storage';
export * from './processing-system';
export * from './reactive-system';
export * from './world';
