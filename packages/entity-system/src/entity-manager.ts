import { BitSet } from './bit-set';
import { EntityGroup } from './entity-group';
import { Entity } from './types';

export class EntityManager {

  /** Contains all entities that are currently alive. */
  public readonly alive: Entity[] = [];

  /** Entities that had their composition updated and require synchronization. {@link sync()} */
  public readonly dirty: Entity[] = [];

  /** Composition bitsets mapped to the entity to which they belong. */
  protected readonly compositions = new Map<Entity, BitSet>();

  /** Returns the composition of an entity. */
  public getComposition(entity: Entity): BitSet {
    let composition = this.compositions.get(entity);

    if (composition) {
      return composition;
    }

    composition = new BitSet();

    this.compositions.set(entity, composition);

    return composition;
  }

  /** Inserts an entity. */
  public insert(entity: Entity): void {
    this.alive.push(entity);
  }

  /** Returns true if the given entity is alive. */
  public isAlive(entity: Entity): boolean {
    return this.alive.indexOf(entity) > -1;
  }

  /** Returns all alive entities. */
  public getAlive(): readonly Entity[] {
    return this.alive;
  }

  /** Flags the given entity as dirty. */
  public setDirty(entity: Entity): void {
    if (this.dirty.indexOf(entity) === -1 && this.isAlive(entity)) {
      this.dirty.push(entity);
    }
  }

  /**
   * Synchronizes dirty ({@link dirty}) entities with the given `groups`. Dirty
   * entities will be un-flagged in the process.
   */
  public sync(groups: readonly EntityGroup[]): void {
    const dirty = this.dirty;

    if (! dirty.length) {
      return;
    }

    for (const group of groups) {
      for (const entity of dirty) {
        // If the entity is contained in the group and no longer eligible it will be
        // removed. If the entity is not contained but eligible it will be added to
        // the group.
        if (group.has(entity)) {
          if (! group.test(this.getComposition(entity))) {
            group.remove(entity);
          }
        }
        else if (group.test(this.getComposition(entity))) {
          group.add(entity);
        }
      }
    }

    this.dirty.length = 0;
  }

}
