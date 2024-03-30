import { Type } from '@heliks/tiles-engine';
import { Style } from '../style';


export type Attributes = {
  readonly style?: Partial<Style>;
  readonly [name: string]: unknown;
}

export type NodeTag<C> = string | Type<C>;

export type NodeChildren<N> = readonly (N | string)[];

export interface Node<C = unknown> {

  /**
   * Contains all attributes that were passed into the node. The {@link children} of the
   * node are additionally stored as an attribute under the same name.
   *
   * ```jsx
   *  <div foo={1} bar={2}></div>
   * ```
   *
   * Will result in the following attributes:
   *
   * ```json
   *  {
   *    children: [],
   *    foo: 1,
   *    bar: 2
   *  }
   * ```
   *
   * Note: Because children are stored as the key `children`, no attribute named
   * "children" can be used on JSX elements.
   *
   * ```jsx
   *  // This is invalid.
   *  <div children={123}></div>
   * ```
   */
  readonly attributes: Attributes;

  /**
   * Contains all nodes and strings that are children of this node. Children are stored
   * additionally as {@link attributes} as the key `children`.
   */
  readonly children: readonly (Node<C> | string)[];

  /**
   * The tag used for this node. This is either a string or a constructor for the UI
   * component type `C`.
   *
   * ```jsx
   *  // Declare a test component.
   *  class Header {
   *    // ... implementation
   *  }
   *
   *  // Tag for this node is 'div'
   *  <div></div>
   *
   *  // Tag for this node is the constructor of the `Header` class
   *  <Header></Header>
   * ```
   */
  readonly tag: NodeTag<C>;

}
