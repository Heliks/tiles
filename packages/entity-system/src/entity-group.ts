import { BitSet } from './bit-set';
import { Filter } from './filter';
import { Entity } from './entity';
import { EventQueue, Subscriber } from '@heliks/event-queue';

export enum GroupEvent {
  Added,
  Removed
}

interface EventData {
  entity: Entity;
  type: GroupEvent;
}

export class EntityGroup {

  /** Contains references of entity symbols that satisfy this groups requirements */
  public readonly entities: Entity[] = [];

  /** @internal */
  private readonly eventQueue = new EventQueue<EventData>();

  /** Total amount of entities */
  public get size(): number {
    return this.entities.length;
  }

  /**
   * @param filter {@see Filter}
   */
  constructor(public readonly filter = new Filter()) {}

  /** Returns true if the entity satisfies the groups requirements */
  public test(composition: BitSet): boolean {
    return this.filter.test(composition);
  }

  /** Add an entity to the group. */
  public add(entity: Entity): this {
    this.entities.push(entity);
    this.eventQueue.push({
      entity,
      type: GroupEvent.Added
    });

    return this;
  }

  /** Returns true if the entity is contained in this group. */
  public has(entity: Entity): boolean {
    return this.index(entity) > -1;
  }

  /** Removes an entity. */
  public remove(entity: Entity): this {
    if (this.has(entity)) {
      this.entities.splice(this.index(entity), 1);
      this.eventQueue.push({
        entity,
        type: GroupEvent.Removed
      });
    }

    return this;
  }

  /** Removes all entities. */
  public clear(): this {
    this.entities.length = 0;

    return this;
  }

  /**
   * Returns the index of an entity. If the entity is not part of this
   * group '-1' will be returned instead.
   */
  public index(entity: Entity): number {
    return this.entities.indexOf(entity);
  }

  /** Subscribes to events in this group. */
  public subscribe(): Subscriber {
    return this.eventQueue.subscribe();
  }

  /** Reads the groups events. */
  public events(subscriber: Subscriber) {
    return this.eventQueue.read(subscriber);
  }

}
