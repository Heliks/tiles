import { BitSet } from './bit-set';
import { Entity } from './entity';

/**
 * A bit set that contains the Ids of all components that are contained in this
 * composition. The entity manager will store a composition for each entity.
 */
export type Composition = BitSet;

/**
 * Wrapper over `number` that represents a bit that indicates the existence of a certain
 * component kind on an entity.
 */
export type CompositionBit = number;

/**
 * Keeps track of entity modifications.
 */
export class Changes {

  /** Entities that were changed during this frame (e.g. composition updates etc.). */
  public readonly changed: Entity[] = [];

  /** Entities that were destroyed during this frame. */
  public readonly destroyed: Entity[] = [];

  /** Bit sets that hold the composition of an entity. */
  private readonly compositions = new Map<Entity, Composition>();

  /**
   * Returns the composition of an entity. If it didn't exist previously it will be
   * created automatically.
   */
  public composition(entity: Entity): Composition {
    let item = this.compositions.get(entity);

    if (item) {
      return item;
    }

    item = new BitSet();

    this.compositions.set(entity, item);

    return item;
  }

  /** @internal */
  private setDirty(entity: Entity): void {
    if (!this.changed.includes(entity)) {
      this.changed.push(entity);
    }
  }

  /** Adds a composition `bit` to `entity`. */
  public add(entity: Entity, bit: CompositionBit): void {
    this.composition(entity).add(bit);
    this.setDirty(entity);
  }

  /** Removes a composition `bit` to `entity`. */
  public remove(entity: Entity, bit: CompositionBit): this {
    if (this.composition(entity).remove(bit)) {
      this.setDirty(entity);
    }

    return this;
  }

  /** Flags an entity as "destroyed". */
  public destroy(entity: Entity): boolean {
    if (this.destroyed.includes(entity)) {
      return false;
    }

    this.destroyed.push(entity);

    return true;
  }

  /** Clears all changes. Should be called once at the end of each frame. */
  public clear(): void {
    this.changed.length = 0;
    this.destroyed.length = 0;
  }

}
