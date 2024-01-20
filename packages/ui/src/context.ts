import { Entity } from '@heliks/tiles-engine';
import { Attribute } from './attribute';
import { getInputs } from './params';


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

/** @internal */
export function resolve<T>(target: T, key: keyof T): any {
  return target[key];
}

/** @internal */
interface ContextDirective<P, A extends Attribute = Attribute> {
  attribute: A;
  input?: keyof A;
  key: keyof P;
}

/**
 * Allows data sharing between the view references of {@link UiNode nodes}.
 *
 * If the entity that owns this context is not a top level node, it cannot be a top
 * level context.
 *
 * The context declares which data is shared between a local view reference `L` and a
 * parent view reference `P`, and in which direction it will flow. The parent view ref
 * is always the view reference of the parent context. Subsequently, if this context is
 * top-level, it can't share data up via {@link outputs}.
 *
 * The context hierarchy is not the same as the node hierarchy, as not all nodes capture
 * a context. The parent context is resolved automatically when this component is first
 * spawned into the world.
 *
 * - `L`: Local {@link ViewRef} type.
 * - `P`: Parent {@link ViewRef} type.
 */
export class Context<L = unknown, P = unknown> {

  /** Contains all {@link Attribute attributes} of this context. */
  public readonly attributes: ContextDirective<P, any>[] = [];

  /**
   * Contains all known bindings. Bindings are relationships between the local view
   * reference `L` and the parent view reference `P`. If they are set to be either
   * an {@link input} or an {@link output}, they will share data between each other.
   */
  public readonly bindings: Binding<L, P>[] = [];

  /**
   * Contains entities that own a context that is a direct child of this context. The
   * child context owner is not necessarily a direct child of the entity of this context,
   * as not all nodes have one.
   */
  public readonly children = new Set<Entity>();

  /**
   * Contains all keys of the local {@link ViewRef} `L` that are inputs.
   *
   * Inputs are keys of the local view reference `L` on which data is received from the
   * parent view reference `P`. The input requires a {@link bind relationship} to know
   * from where it should resolve data from. A key can't be an input and output at the
   * same time.
   */
  public readonly inputs = new Set<keyof L>();

  /**
   * Contains all keys of the local {@link ViewRef} `L` that are inputs.
   *
   * Outputs are keys of the local view reference `L` that send their data to the parent
   * view reference `P`. The input requires a {@link bind relationship} to know where it
   * should send data to. A key can't be an input and output at the same time.
   */
  public readonly outputs = new Set<keyof L>();

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
   * Adds an {@link Attribute} to the context and binds it to a key on the parent view
   * reference `P`. Data sent to the attribute will be resolved from that key.
   */
  public attr<D extends Attribute>(key: keyof P, attribute: D): this {
    const input = getInputs(attribute)[0];

    this.attributes.push({
      attribute,
      input,
      key
    });

    return this;
  }

  /**
   * Binds the given `local` key to a `parent` key, establishing a relationship between
   * this context and its parent.
   *
   * If the `local` key is a {@link input}, the context will share data from the parent
   * view reference `P` with the local view reference `L`. If it's a {@link output}, the
   * local view reference will share its data with the parent instead. If it's neither,
   * no data will be shared.
   */
  public bind(local: keyof L, parent: keyof P): this {
    this.bindings.push({
      local,
      parent
    });

    return this;
  }

  /** Overwrites the contexts {@link inputs}. */
  public input(...keys: (keyof L)[]): this {
    this.inputs.clear();

    for (const key of keys) {
      if (this.outputs.has(key)) {
        throw new Error(`${key.toString()} can not be both an input and output at the same time.`);
      }

      this.inputs.add(key);
    }

    return this;
  }

  /** Overwrites the contexts {@link outputs}. */
  public output(...keys: (keyof L)[]): this {
    this.outputs.clear();

    for (const key of keys) {
      if (this.inputs.has(key)) {
        throw new Error(`${key.toString()} can not be both an input and output at the same time.`);
      }

      this.outputs.add(key);
    }

    return this;
  }


  /**
   * Shares data between a `local` and `parent` view reference.
   *
   * Context {@link inputs} will be resolved from the parent view reference and applied
   * to the local reference. Context {@link outputs} will be resolved from the local view
   * reference and applied to the parent reference.
   *
   * Only data is shared for keys that have a  {@link bindings relationship} defined
   * on this context.
   */
  public apply(local: L, parent: P): this {
    for (const binding of this.bindings) {
      if (this.outputs.has(binding.local)) {
        parent[binding.parent] = resolve(local, binding.local);
      }
      else if (this.inputs.has(binding.local)) {
        local[binding.local] = resolve(parent, binding.parent);
      }
    }

    return this;
  }

}
