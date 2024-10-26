import { Timer } from '../timer';


describe('Timer', () => {
  it('should move forward in time', () => {
    const timer = new Timer(1000);

    timer.update(500);

    expect(timer.elapsed).toBe(500);
  });

  it.each([
    { delta: 0, finished: false },
    { delta: 50, finished: false },
    { delta: 100, finished: true },
    { delta: 150, finished: true },
    { delta: 201, finished: true }
  ])('with duration of 100 ms should finish on tick ($finished) taking $delta ms', (data) => {
    const timer = new Timer(100);

    timer.update(data.delta);

    expect(timer.hasFinishedThisTick()).toBe(data.finished);
  });

  describe('when not repeating', () => {
    it('should clamp elapsed time at timer duration', () => {
      const timer = new Timer(100);

      timer.update(200);

      expect(timer.elapsed).toBe(100);
    });
  });

  describe('when repeating', () => {
    it.each([
      { delta: 150, excess: 50 },
      { delta: 300, excess: 0 },
      { delta: 399, excess: 99 }
    ])('a timer of 100 ms should carry over $excess ms on $delta ms tick', (data) => {
      const timer = new Timer(100, true);

      timer.update(data.delta);

      expect(timer.elapsed).toBe(data.excess);
    });
  });
});
