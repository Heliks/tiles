/**
 * @typeparam T The data that is passed down by the state machine
 *  during lifecycle or update events.
 */
export interface State<T> {
  /** Called when the state is added to a stack. */
  onStart?(data: T): unknown;
  /** Called when the state is removed from a stack. */
  onStop?(data: T): unknown;
  /**
   * If this state is currently on top and another state is pushed over it,
   * this method will be called.
   */
  onPause?(data: T): unknown;
  /**
   * When a state is popped and this state is resumed, this method
   * will be called.
   */
  onResume?(data: T): unknown;
  /**
   * Handles the logic of the state. Called when the state machine is
   * updated and this state is currently on top of the stack.
   */
  update(data: T): unknown;
}

export class StateMachine<T> {

  /**
   * Contains the state that is currently on top of the stack or `undefined`
   * if the stack is empty.
   */
  public get active(): State<StateMachine<T>> | undefined {
    return this.stack[ this.stack.length - 1 ];
  }

  /** Contains the current stack size. */
  public get size(): number {
    return this.stack.length;
  }

  /** Indicates if the state machine is currently running. */
  protected running = false;

  /**
   * The stack of states. The last state in the list is considered
   * the [[active]] state.
   */
  protected readonly stack: State<StateMachine<T>>[] = [];

  /**
   * @param data The state machines data that will be passed down to state when
   * they receive lifecycle or update events.
   */
  constructor(public data: T) {}

  /** Pushes a `state` at the top of the stack. */
  public push(state: State<StateMachine<T>>): this {
    if (this.running) {
      const active = this.active;

      // Pause the state that is currently active as we'll be pushing
      // a new state over it.
      active?.onPause?.(this);

      this.stack.push(state);

      state.onStart?.(this);
    }

    return this;
  }

  /**
   * Removes the top most state from the stack. If the stack is not empty afterwards
   * it will resume the next top most state, otherwise the state machine is shut down.
   */
  public pop(): this {
    if (this.running) {
      let state = this.stack.pop();

      // If we got a state from the top of the stack stop it before starting
      // the next one.
      state?.onStop?.(this);

      // Get the next active state. If there is we'll resume it, otherwise
      // the state machine will be exited.
      state = this.active;

      if (state) {
        state.onResume?.(this);
      }
      else {
        // Shutdown state machine.
        this.running = false;
      }
    }

    return this;
  }

  /** Replaces the top-most state of the stack with `state`. */
  public switch(state: State<StateMachine<T>>): this {
    if (this.running) {
      const top = this.stack.pop();

      // Stop the state we got from the top of the stack
      top?.onStop?.(this);

      // Push the given state to the top of the stack and start it if possible.
      this.stack.push(state);
      state.onStart?.(this);
    }

    return this;
  }

  /**
   * Starts the state machine. If a `state` is given it is pushed on top of the stack.
   * Throws an error if the state machine is started with an empty stack. This means
   * that the first time it is started, the `state` parameter is mandatory.
   */
  public start(state?: State<StateMachine<T>>): this {
    if (state) {
      this.stack.push(state);
    }
    else {
      state = this.active;
    }

    if (!state) {
      throw new Error('Stack is empty.');
    }

    // Start the initial state.
    state.onStart?.(this);

    this.running = true;

    return this;
  }

  /** Shuts the state machine down. */
  public stop(): this {
    let state;

    // noinspection JSAssignmentUsedAsCondition
    while (state = this.stack.pop()) {
      state.onStop?.(this);
    }

    this.running = false;

    return this;
  }

  /** Updates the currently active (the top most) state. */
  public update(): void {
    const active = this.active;

    if (active) {
      active.update(this);
    }
  }

}
