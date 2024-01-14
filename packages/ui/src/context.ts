import { Entity } from '@heliks/tiles-engine';


/** Data for a {@link Context}. */
type ContextData<T = unknown> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]?: any;
};

/**
 * Describes a one-way data binding relationship between a local {@link Context} and its
 * parent. Essentially, the local context data at the given `local` key will resolve
 * data.
 *
 * - `L`: Local type of the context that references this binding.
 * - `P`: Parent type of the context that references this binding.
 */
export interface OneWayBinding<L, P> {
  local: keyof L;
  parent: keyof P;
}

/**
 * Relationship between a local {@link Context} `L` and its parent `P`.
 *
 * - `L`: Local type of the context that references this binding.
 * - `P`: Parent type of the context that references this binding.
 */
export type Binding<L, P> = OneWayBinding<L, P>;

/**
 * When attached to entities with a {@link UiNode} component, data is resolved from the
 * nodes {@link UiWidget} and propagated to child context {@link inputs}, and eventually
 * applied to the instance of the childs {@link UiWidget}.
 *
 * The context tree is not the same as the node / entity tree. Not all nodes captures a
 * context, therefore the owner of a parent context is not necessarily the same entity
 * that owns the node that is the direct parent of the owner of this context.
 *
 * The parent context is resolved automatically when this component is attached to an
 * entity. If that entity is not a top is not top-level, it requires a parent context
 * somewhere up its entity tree.
 *
 * - `L`: Local type to which this context applies data to.
 * - `P`: Parent type from which this context resolves data from.
 */
export class Context<L = unknown, P = unknown> {

  /**
   * Bindings are data relationships from child to parent. They describe how a context
   * will resolve {@link data} from the type its parent references (`P`). Subsequently,
   * top-level contexts will never resolve bindings as they don't have a parent to
   * resolve data from.
   */
  public readonly bindings: Binding<L, P>[] = [];

  /**
   * Contains entities that own a context that is a direct child of this context. The
   * child context owner is not necessarily a direct child of the entity of this context,
   * as not all nodes have one.
   */
  public readonly children = new Set<Entity>();

  /**
   * Contains all data for this context. The data will be {@link resolve resolved} from
   * the type `P` that the parent of this context references.
   */
  public readonly data: ContextData<L> = {};

  /**
   * Contains all keys of the local type `L` that are treated as inputs. When the context
   * is {@link apply applied} to an object, all inputs will be copied from {@link data}
   * to the instance to which it is applied.
   */
  public readonly inputs = new Set<keyof L>();

  /**
   * Entity that is the parent context of this one, if any. If this context is not a top
   * level context, it is guaranteed to have a parent, as only top-level nodes can also
   * be top-level contexts.
   */
  public parent?: Entity;

  /**
   * Adds `entity` as a child context. The entity is assumed to have a {@link UiNode} and
   * a {@link Context} component attached to it.
   */
  public add(entity: Entity): this {
    this.children.add(entity);

    return this;
  }

  /**
   * Removes `entity` as child context.
   */
  public remove(entity: Entity): this {
    this.children.delete(entity);

    return this;
  }

  /**
   * Binds the given `local` key to a `parent` key, establishing a relationship between
   * this context and its parent. The context will resolve data from `parent` and store
   * it using `local` as key for the context {@link data}.
   *
   * This will not have any effect if this is a top-level context, as it does not have
   * a parent to establish a relationship with.
   */
  public bind(local: keyof L, parent: keyof P): this {
    this.bindings.push({
      local,
      parent
    });

    return this;
  }

  public input(...inputs: (keyof L)[]): this {
    this.inputs.clear();

    for (const input of inputs) {
      this.inputs.add(input);
    }

    return this;
  }

  /** Copies all data keys that are {@link inputs} from  {@link data} to `target`. */
  public apply(target: L): this {
    for (const input of this.inputs) {
      target[input] = this.data[input];
    }

    return this;
  }

  /** Resolves all context {@link bindings}. */
  public resolve(instance: P): this {
    for (const binding of this.bindings) {
      this.data[binding.local] = instance[binding.parent];
    }

    return this;
  }

}
