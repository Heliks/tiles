import { Entity, Transform } from "@heliks/tiles-engine";
import { rand, Vec2, vec2 } from '@heliks/tiles-math';

export class Spawner {

  /** Contains the spawned entity. */
  public entity?: Entity;

  /** Remaining amount of time that it takes until the next entity is spawned. */
  public cooldown = 0;

  /**
   * @param id ID of the blueprint that is used to spawn the entity.
   * @param respawnTime The time it takes for the entity to be re-spawned after it
   *  has been killed. A time of `0` means it is re-spawned instantly.
   * @param range The range around the spawner where entities can be spawned. The exact
   *  spawning location is a random position in that range. A range of `0` means the
   *  entity is spawned on top of the spawner.
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
