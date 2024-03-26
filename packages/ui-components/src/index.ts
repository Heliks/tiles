import { Node } from './jsx';
import { UiComponent } from './ui-component';


export * from './jsx';
export * from './jsx-renderer';
export * from './ui-component';


/** Alias type for the root node returned by a {@link UiComponent}. */
export type ComponentTemplate = Node<UiComponent>;
