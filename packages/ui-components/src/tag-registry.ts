import { Entity, Type, World } from '@heliks/tiles-engine';
import { UiElement, UiNode } from '@heliks/tiles-ui';
import { Attributes } from './jsx-node';
import { TagType } from './metadata';
import { UiComponent } from './ui-component';


/**
 * Transforms a JSX node into an entity with a {@link UiNode} component. Additional
 * settings may be made to the node or an {@link UiElement} component may be added,
 * depending on the implementation of the element.
 */
export interface ElementFactory<A extends Attributes = Attributes> {

  /**
   * Called to render a JSX element (e.g. <div>, <span>, etc.). The entity that is
   * produced by this function *must* have a {@link UiNode} component.
   *
   * @param world Entity world
   * @param attributes Attributes for the element to create.
   */
  render(world: World, attributes: A): Entity;

}

/** Registry entry for tags that are elements. */
export type ElementEntry = { factory: ElementFactory, type: TagType.Element };

/** Registry entry for tags that are components. */
export type ComponentEntry = { component: Type<UiComponent>, type: TagType.Component };

/** An entry for the {@link TagRegistry}. */
export type TagRegistryEntry = ElementEntry | ComponentEntry;

/** Stores entries for each known tag that can be used in a JSX context. */
export class TagRegistry {

  /** Contains all registry entries mapped to their tag name. */
  private readonly entries = new Map<string, TagRegistryEntry>();

  /** @internal */
  private set(tag: string, entry: TagRegistryEntry): void {
    if (this.entries.has(tag)) {
      throw new Error(`Tag ${tag} is already in use by a different entry.`);
    }

    this.entries.set(tag, entry);
  }

  /**
   * Registers a `tag` as an element, using `factory` to render it when it is used in
   * a JSX context. Throws an error if the given tag name is already in use.
   */
  public element(tag: string, factory: ElementFactory): this {
    this.set(tag, {
      factory,
      type: TagType.Element
    });

    return this;
  }

  /**
   * Registers a `tag` to render the given UI `component`. Throws an error if the given
   * tag name is already in use.
   */
  public component(tag: string, component: Type<UiComponent>): this {
    this.set(tag, {
      component,
      type: TagType.Component
    });

    return this;
  }

  /**
   * Returns the {@link TagRegistryEntry} that matches the given `tag` name. Throws an
   * error if it does not exist.
   */
  public entry(tag: string): TagRegistryEntry {
    const entry = this.entries.get(tag);

    if (! entry) {
      throw new Error(`Invalid tag <${tag}>`);
    }

    return entry;
  }

}




