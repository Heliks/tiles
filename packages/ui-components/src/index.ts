import { Node } from './jsx';
import { UiComponent } from './ui-component';


export * from './element';
export * from './jsx';
export * from './style';


export * from './jsx-renderer';
export * from './ui-component';
export * from './ui-components-bundle';


/** Alias type for the root node returned by a {@link UiComponent}. */
export type ComponentTemplate = Node<UiComponent>;
