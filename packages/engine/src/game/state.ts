/**
 * Generic interface of a state machine stack.
 *
 * @typeparam T Item that is pushed into the stack. Mostly this will either be a state
 *  name that the state machine associates with a certain state, or a state directly,
 *  depending on the implementation of the state machine.
 */
export interface Stack<T> {
  /** Pushes an `item` at the top of the stack. */
  push(item: T): this;
  /** Removes the top most item from the stack. */
  pop(): this;
  /** Replaces the top-most item of the stack with `item`. */
  switch(item: T): this;
}


/**
 * State that can be used inside of a state machine.
 *
 * @see StateMachine
 * @see Stack
 *
 * @typeparam T Data that is passed down to this state by the state machine.
 * @typeparam S Stack type.
 */
export interface State<T, S extends Stack<unknown>> {

  /** Called when added to a stack. */
  onStart?(data: T): unknown;

  /** Called when removed from a stack. */
  onStop?(data: T): unknown;

  /** Called when a different `State<T>` is pushed over this one. */
  onPause?(data: T): unknown;

  /** Called when this state becomes active after having been inactive once. */
  onResume?(data: T): unknown;

  /**
   * Called when the state machine is updated and this state is currently on
   * top of the stack, usually once per frame.
   */
  update(stack: S, data: T): unknown;

}

export type StateStack<T> = Stack<State<T, StateStack<T>>>;
export type StateStackState<T> = State<T, StateStack<T>>;

/**
 * Stack based push-down automation (PDA) state machine.
 *
 * @typeparam T The data that will be passed down to each state.
 */
export class StateMachine<T> implements StateStack<T> {

  /**
   * Contains the state that is currently on top of the stack or `undefined`
   * if the stack is empty.
   */
  public get active(): StateStackState<T> | undefined {
    return this.stack[this.stack.length - 1];
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
  protected readonly stack: StateStackState<T>[] = [];

  /**
   * @param data The state machines data that will be passed down to state when
   * they receive lifecycle or update events.
   */
  constructor(public data: T) {}

  /** Pushes a `state` at the top of the stack. */
  public push(state: StateStackState<T>): this {
    if (this.running) {
      const active = this.active;

      // Pause the state that is currently active as we'll be pushing
      // a new state over it.
      active?.onPause?.(this.data);

      this.stack.push(state);

      state.onStart?.(this.data);
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
      state?.onStop?.(this.data);

      // Get the next active state. If there is we'll resume it, otherwise
      // the state machine will be exited.
      state = this.active;

      if (state) {
        state.onResume?.(this.data);
      }
      else {
        // Shutdown state machine.
        this.running = false;
      }
    }

    return this;
  }

  /** Replaces the top-most state of the stack with `state`. */
  public switch(state: StateStackState<T>): this {
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
  public start(state?: StateStackState<T>): this {
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
