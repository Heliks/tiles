import { State, StateMachine } from "../state";

/** A state that does nothing. */
class NoopState<T = any> implements State<T> {
  /** {@inheritDoc} */
  public onStart(): void {}
  /** {@inheritDoc} */
  public onStop(): void {}
  /** {@inheritDoc} */
  public onPause(): void {}
  /** {@inheritDoc} */
  public onResume(): void {}
  /** {@inheritDoc} */
  public update(): void {}
}

describe('StateMachine', () => {
  let stateMachine: StateMachine<undefined>;

  beforeEach(() => {
    stateMachine = new StateMachine();
  });

  describe('push()', () => {
    it('should be ignored if state machine is not started', () => {
      expect(stateMachine.push(new NoopState()).size).toBe(0);
    });

    it('should add new states to the top of the stack', () => {
      const second = new NoopState();

      stateMachine.start(new NoopState()).push(second);
      // Second added state should now be on top.
      expect(stateMachine.active).toBe(second);
    });

    it('should start the pushed state', () => {
      const state = new NoopState();
      const fn = jest.spyOn(state, 'onStart');

      stateMachine.start(new NoopState()).push(state);

      expect(fn).toHaveBeenCalledWith(stateMachine);
    });

    it('should pause the previous top-most state', () => {
      const state = new NoopState();
      const fn = jest.spyOn(state, 'onPause');

      stateMachine.start(state).push(new NoopState());

      expect(fn).toHaveBeenCalledWith(stateMachine);
    });
  });

  describe('pop()', function () {
    it('should be ignored if the state machine is not started', () => {
      expect(stateMachine.pop().size).toBe(0);
    });

    it('should remove the top most state from the stack', () => {
      stateMachine.start(new NoopState()).push(new NoopState()).pop();

      // State should not be
      expect(stateMachine.size).toBe(1);
    });

    it('should stop the state that was popped', () => {
      const state = new NoopState();
      const fn = jest.spyOn(state, 'onStop');

      stateMachine
        .start(new NoopState())
        .push(state)
        .pop();

      expect(fn).toHaveBeenCalledWith(stateMachine);
    });

    it('should resume the state that has become active afterwards', () => {
      const state = new NoopState();
      const fn = jest.spyOn(state, 'onResume');

      stateMachine
        .start(state)
        .push(new NoopState())
        .pop();

      expect(fn).toHaveBeenCalledWith(stateMachine);
    });
  });

  /*
  it('should start the initial state', () => {
    const onStart = jest.spyOn(foo, 'onStart');

    stateMachine
      .default(foo)
      .start();

    expect(onStart).toHaveBeenCalledWith('foobar');
  });

  it('should stop all states when the state machine is shut down', () => {
    const onStop1 = jest.spyOn(foo, 'onStop');
    const onStop2 = jest.spyOn(bar, 'onStop');

    stateMachine
      .default(foo)
      .start()
      .push(bar)
      .stop();

    expect(onStop1).toHaveBeenCalledWith('foobar');
    expect(onStop2).toHaveBeenCalledWith('foobar');
  });

  it('should update the top most state', () => {
    const update = jest.spyOn(foo, 'update');

    stateMachine
      .default(foo)
      .start()
      .update();

    expect(update).toHaveBeenCalledWith('foobar');
  });
   */
});