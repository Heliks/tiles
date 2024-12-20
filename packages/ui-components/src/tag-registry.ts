import { Type } from '@heliks/tiles-engine';
import { TagType } from './metadata';
import { UiComponent } from './ui-component';
import { UiNodeRenderer } from './ui-node-renderer';


/** Registry entry for a tag that renders a {@link UiNode}. */
export type TagRegistryNodeEntry = { factory: UiNodeRenderer, type: TagType.Node };

/** Registry entry for a tag that renders a {@link UiComponent}. */
export type TagRegistryComponentEntry = { component: Type<UiComponent>, type: TagType.Component };

/** An entry for the {@link TagRegistry}. */
export type TagRegistryEntry = TagRegistryNodeEntry | TagRegistryComponentEntry;

/** Stores metadata for each valid tag-name in JSX. */
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
  public element(tag: string, factory: UiNodeRenderer): this {
    this.set(tag, {
      factory,
      type: TagType.Node
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




