import { SpriteEvent, SpriteEvents } from '../sprite-event';
import { process } from '../sprite-event-system';


describe('SpriteEventSystem', () => {
  describe('process()', () => {
    let events: SpriteEvent;

    beforeEach(() => {
      events = new SpriteEvent();
    });

    it('should reset active event when queue is empty', () => {
      events.active = SpriteEvents.Up;

      process(events);

      expect(events.active).toBe(SpriteEvents.None);
    });

    it('should set latest queued event as active', () => {
      events.queue.push(SpriteEvents.Up);
      events.queue.push(SpriteEvents.None);
      events.queue.push(SpriteEvents.Down);

      process(events);

      expect(events.active).toBe(SpriteEvents.Down);
    });
  });
});
