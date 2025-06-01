import { Type } from '@heliks/tiles-engine';
import { ResourceOptions, ResourceType } from './metadata';
import { UiComponent } from './ui-component';
import { UiNodeRenderer } from './ui-node-renderer';


/** Registry entry for a tag that renders a {@link UiNode}. */
export type TagRegistryNodeEntry = { options: ResourceOptions; renderer: UiNodeRenderer, type: ResourceType.Node  };

/** Registry entry for a tag that renders a {@link UiComponent}. */
export type TagRegistryComponentEntry = { options: ResourceOptions; component: Type<UiComponent>, type: ResourceType.Component };

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
   * Registers a `tag` that is rendered by `renderer`. Throws an error if the given tag
   * name is already in use.
   */
  public node(tag: string, renderer: UiNodeRenderer, options: ResourceOptions = {}): this {
    this.set(tag, {
      options,
      renderer,
      type: ResourceType.Node
    });

    return this;
  }

  /**
   * Registers a `tag` that renders a UI `component`. Throws an error if the given tag
   * name is already in use.
   */
  public component(tag: string, component: Type<UiComponent>, options: ResourceOptions = {}): this {
    this.set(tag, {
      component,
      options,
      type: ResourceType.Component
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




