import { Entity, Transform } from "@heliks/tiles-engine";
import { rand, Vec2, vec2 } from '@heliks/tiles-math';
import { SpawnerOptions } from "./spawner-object";

export class Spawner implements Required<SpawnerOptions> {

  /** Contains the spawned entity. */
  public entity?: Entity;

  /** Remaining time (in seconds) until the next entity is spawned. */
  public cooldown = 0;

  /**
   * @param id @inheritDoc
   * @param respawnTime @inheritDoc
   * @param range @inheritDoc
   */
  constructor(public id: string, public respawnTime = 0, public range = 0) {}

  /**
   * Returns a randomized spawn location within the acceptable spawn `range` where
   * `position` is the current position of the spawner itself.
   */
  public getRandomSpawnPosition(position: Transform): Vec2 {
    return vec2(
      position.world.x + rand(-this.range, this.range),
      position.world.y + rand(-this.range, this.range)
    );
  }

  /**
   * Resets the spawner, meaning the `entity` is un-assigned and a new cooldown to
   * spawn a new entity is started based on the spawners re-spawn time.
   */
  public reset(): this {
    this.entity = undefined;
    this.cooldown = this.respawnTime;

    return this;
  }

}
