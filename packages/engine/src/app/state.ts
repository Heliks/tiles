/** Generic interface of a state machine stack. */
export interface Stack<I> {

  /**
   * Pushes a `state` at the top of the stack. The state that was previously at the top
   * of the stack will be paused in the process.
   */
  push(item: I): this;

  /**
   * Removes the top most state from the stack. If the stack is not empty afterwards,
   * it will resume the next top most state, otherwise the state machine is shut down.
   */
  pop(): this;

  /**
   * Replaces the top-most state of the stack with `state`. The state that is replaced
   * will be removed from the stack entirely.
   */
  switch(item: I): this;

}

/**
 * Implementation of a state that runs in a {@link StateMachine}.
 *
 * States implement a {@link update} method that contains the state logic. Additionally,
 * they can act upon certain events that happen when the state machine interact with
 * this state.
 *
 * The state machine will pass down the data type `D` to events in this state.
 */
export interface State<D> {

  /** Event that is called when the state is first pushed to the stack. */
  onStart?(data: D): unknown;

  /** Event that is called when the state is removed from to the stack. */
  onStop?(data: D): unknown;

  /**
   * If this state was previously the active state, this will be called after another
   * state replaces it. The state is still part of the stack and can become active
   * again at a later time.
   *
   * @see onResume
   */
  onPause?(data: D): unknown;

  /**
   * If this state was previously paused, this will be called after the event becomes
   * the active state in the state stack again.
   *
   * @see onPause
   */
  onResume?(data: D): unknown;

  /**
   * Contains the implementation of the state.
   *
   * If this state is the top-most state in a state machine, this will be called once
   * on each frame. During the execution of this method, state changes can be triggered
   * by interacting with the `stack`.
   */
  update(stack: Stack<State<D>>, data: D): unknown;

}

/**
 * Push-down automation (PDA) state machine.
 */
export class StateMachine<D> implements Stack<State<D>> {

  /** Contains the state that is currently on top of the stack, if any. */
  public get active(): State<D> | undefined {
    return this.stack[this.stack.length - 1];
  }

  /** Amount of states that are currently part of the stack. */
  public get size(): number {
    return this.stack.length;
  }

  /** @internal */
  private running = false;

  /** @internal */
  private readonly stack: State<D>[] = [];

  /**
   * @param data Data that the state machine passes down to its states.
   */
  constructor(public data: D) {}

  /** @inheritDoc */
  public push(state: State<D>): this {
    if (this.running) {
      const active = this.active;

      active?.onPause?.(this.data);

      this.stack.push(state);

      state.onStart?.(this.data);
    }

    return this;
  }

  /** @inheritDoc */
  public pop(): this {
    if (this.running) {
      let state = this.stack.pop();

      state?.onStop?.(this.data);

      // Get next active state. If successful, the state will be resumed. Otherwise the
      // state machine is shut down.
      state = this.active;

      if (state) {
        state.onResume?.(this.data);
      }
      else {
        this.running = false;
      }
    }

    return this;
  }

  /** @inheritDoc */
  public switch(state: State<D>): this {
    if (this.running) {
      const top = this.stack.pop();

      // Stop the state we got from the top of the stack
      top?.onStop?.(this.data);

      // Push the given state to the top of the stack and start it if possible.
      this.stack.push(state);

      state.onStart?.(this.data);
    }

    return this;
  }

  /**
   * Starts the state machine. If a `state` is given it is pushed on top of the stack.
   * Throws an error if the state machine is started with an empty stack. This means
   * that the first time it is started, the `state` parameter is mandatory.
   */
  public start(state?: State<D>): this {
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
    state.onStart?.(this.data);

    this.running = true;

    return this;
  }

  /** Shuts the state machine down. */
  public stop(): this {
    let state;

    // noinspection JSAssignmentUsedAsCondition
    while (state = this.stack.pop()) {
      state.onStop?.(this.data);
    }

    this.running = false;

    return this;
  }

  /** Updates the currently active (the top most) state. */
  public update(): void {
    const active = this.active;

    if (active) {
      active.update(this, this.data);
    }
  }

}
