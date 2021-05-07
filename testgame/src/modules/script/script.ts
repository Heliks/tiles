export enum ScriptTrigger {
  /**
   * Script is automatically executed when it is loaded into the world.
   */
  Auto,
  /**
   * Script is triggered when a specific entity is touching the entity to which the
   * script is attached. For example when a player touches a pressure plate.
   */
  Touch,
  /**
   * Script is triggered when it is actively interacted with. For example the player
   * opening a door or pressing a button.
   */
  Trigger
}

export class Script {

  /** Remaining time in MS until the script can be executed again. */
  public cooldown = 0;

  /** Indicates if the script is currently running. */
  public isRunning = false;

  /** @internal */
  public _run = false;

  /** Trigger type that is required to execute the script. */
  public trigger = ScriptTrigger.Trigger;

  /**
   * @param name The name of the script that should be executed.
   */
  constructor(public name: string) {}

  /**
   * Executes the script. Does nothing if the script is currently on cooldown or
   * already running.
   */
  public exec(): this {
    if (!this.isRunning && this.cooldown <= 0) {
      this._run = true;
    }

    return this;
  }

}
