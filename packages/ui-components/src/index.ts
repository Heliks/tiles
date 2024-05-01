import { JsxNode } from './jsx-node';
import { UiComponent } from './ui-component';


export * from './elements';
export * from './style';

export * from './attributes';
export * from './data';
export * from './jsx-node';
export * from './jsx-renderer';
export * from './metadata';
export * from './tag-registry';
export * from './ui-component';
export * from './ui-components-bundle';


/** Alias type for the root node returned by a {@link UiComponent}. */
export type ComponentTemplate = JsxNode;