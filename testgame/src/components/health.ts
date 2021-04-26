import { clamp, Entity } from '@heliks/tiles-engine';

class DamageEvent {

  /**
   * @param source The entity that triggered this health change.
   * @param valueOld The health value before it was modified.
   * @param valueNew Health value after the event.
   */
  constructor(
    public readonly source: Entity,
    public readonly valueOld: number,
    public readonly valueNew: number,
  ) {}

  /**
   * Returns the difference between the health value before and after the event
   * occurred.
   */
  public diff(): number {
    return Math.abs(this.valueOld - this.valueNew);
  }

}

/** Attaches health to an entity. */
export class Health {

  /** Contains a history of events that changed the health in the past. */
  public readonly history: DamageEvent[] = [];

  /** Current amount of health. If this falls below `0` the entity is considered "dead". */
  public current = 0;

  /**
   * @param total The maximum amount of health that this entity can possibly have.
   * @param current (optional) Current amount of health. By default the entity will
   *  start with it's maximum health `total`.
   */
  constructor(public total = 0, current?: number) {
    this.current = current ? current : total;
  }

  /** Sets the current health to `value`. If it exceeds [[total]] it will be clamped. */
  public set(value: number): this {
    this.current = clamp(value, value, this.total);

    return this;
  }

  /**
   * Damages the health pool by `amount` where `source` is the entity that inflicted that
   * damage. If `amount` is negative it is rounded to `0` to prevent negative damage from
   * healing back health.
   */
  public damage(source: Entity, amount: number): this {
    const prev = this.current;

    if (amount >= 0) {
      this.set(this.current - Math.abs(amount));
    }

    this.history.push(new DamageEvent(source, prev, this.current));

    return this;
  }

  /**
   * Returns all entities that recently damaged this health pool. If `out` is passed
   * those entities will be added to it.
   */
  public getDamagingEntities(out: Entity[] = []): Entity[] {
    for (const item of this.history) {
      if (!out.includes(item.source)) {
        out.push(item.source);
      }
    }

    return out;
  }

}
