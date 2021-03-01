export class Script {

  /** @internal */
  public isExecuted = false;

  /**
   * @param name The name of the script that should be executed.
   */
  constructor(public name: string) {}

  /** Executes the script. */
  public exec(): this {
    this.isExecuted = true;

    return this;
  }

}
