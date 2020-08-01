import { State, StateMachine } from "../state";

/** A state that does nothing. */
class NoopState<T = any> implements State<T> {
  /** @inheritDoc */
  public onStart = jest.fn();
  /** @inheritDoc */
  public onStop = jest.fn();
  /** @inheritDoc */
  public onPause = jest.fn();
  /** @inheritDoc */
  public onResume = jest.fn();
  /** @inheritDoc */
  public update = jest.fn();
}

describe('StateMachine', () => {
  // The test data that is passed to every state machine.
  let data: symbol;

  // Test state and state machine.
  let state: NoopState;
  let states: StateMachine<symbol>;

  beforeEach(() => {
    data = Symbol();

    states = new StateMachine(data);
    state = new NoopState();
  });

  describe('push()', () => {
    it('should be ignored if state machine is not started', () => {
      expect(states.push(state).size).toBe(0);
    });

    it('should add new states to the top of the stack', () => {
      states.start(new NoopState()).push(state);

      // Second added state should now be on top.
      expect(states.active).toBe(state);
    });

    it('should start the pushed state', () => {
      states.start(new NoopState()).push(state);

      expect(state.onStart).toHaveBeenCalledWith(states, data);
    });

    it('should pause the previous top-most state', () => {
      states.start(state).push(new NoopState());

      expect(state.onPause).toHaveBeenCalledWith(states, data);
    });
  });

  describe('pop()', function () {
    it('should be ignored if the state machine is not started', () => {
      expect(states.pop().size).toBe(0);
    });

    it('should remove the top most state from the stack', () => {
      states.start(new NoopState()).push(new NoopState()).pop();

      // State should not be
      expect(states.size).toBe(1);
    });

    it('should stop the state that was popped', () => {
      states.start(new NoopState()).push(state).pop();

      expect(state.onStop).toHaveBeenCalledWith(states, data);
    });

    it('should resume the state that has become active afterwards', () => {
      states.start(state).push(new NoopState()).pop();

      expect(state.onResume).toHaveBeenCalledWith(states, data);
    });
  });

  describe('switch()', () => {
    it('should be ignored if the state machine is not started', () => {
      expect(states.switch(new NoopState()).size).toBe(0);
    });

    it('should switch a state with the top most state on the stack', () => {
      const state = new NoopState();

      // Start the state machine and then switch the initial NoopState
      // with our fixture.
      states.start(new NoopState()).switch(state);

      // Active state should now be state1.
      expect(states.active).toBe(state);
    });

    it('should stop the previous active state', () => {
      states.start(state).switch(new NoopState());

      expect(state.onStop).toHaveBeenCalledWith(states, data);
    });

    it('should start the new active state', () => {
      states.start(new NoopState()).switch(state);

      expect(state.onStart).toHaveBeenCalledWith(states, data);
    });
  });

  it('should start the initial state', () => {
    const state = new NoopState();
    const onStart = jest.spyOn(state, 'onStart');

    states.start(state);

    expect(onStart).toHaveBeenCalledWith(states, data);
  });

  it('should stop all states in the stack', () => {
    const state1 = new NoopState();
    const state2 = new NoopState();

    states.start(state1).push(state2).stop();

    expect(state1.onStop).toHaveBeenCalledWith(states, data);
    expect(state2.onStop).toHaveBeenCalledWith(states, data);
  });

  it('should update the top most state', () => {
    states.start(state).update();

    expect(state.update).toHaveBeenCalledWith(states, data);
  });
});
