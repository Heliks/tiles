import { World } from './world';

/** Where all the logic of an entity system is implemented. */
export interface System {
  /**
   * Setup logic for your game goes here. Will be called when the
   * system is added to a `SystemManager`.
   */
  boot?(world: World): void;
  /**
   * Implementation of the systems logic. Will be called once by
   * the system manager on each frame.
   */
  update(world: World): void;
}

/** Manages and updates systems. */
export class SystemManager {

  /** All systems that were added to the manager. */
  protected systems: System[] = [];

  /**
   * @param world The entity world.
   */
  constructor(public readonly world = new World()) {}

  /** Adds the given `system`. */
  public add(system: System): void {
    // Boot the system if necessary.
    if (system.boot) {
      system.boot(this.world);
    }

    this.systems.push(system);
  }

  /**
   * Updates all systems that were added to the manager. Should be
   * called once on each frame.
   */
  public update(): void {
    for (const system of this.systems) {
      system.update(this.world);
    }
  }

}
