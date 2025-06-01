import { JsxNode } from './jsx-node';


export * from './nodes';

export * from './attributes';
export * from './bind';
export * from './data';
export * from './helpers';
export * from './jsx-node';
export * from './jsx-renderer';
export * from './metadata';
export * from './ref';
export * from './tag-registry';
export * from './ui-node-renderer';
export * from './ui-component';
export * from './ui-components-bundle';


/** Alias type for the root node returned by a {@link UiComponent}. */
export type ComponentTemplate = JsxNode;
