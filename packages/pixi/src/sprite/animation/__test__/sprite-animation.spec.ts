import { SpriteAnimation } from '../sprite-animation';


describe('SpriteAnimation', () => {
  describe('isComplete()', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation([1, 2, 3, 4])
    });

    it('should return true when animation is on its last frame', () => {
      animation.frame = 3;

      expect(animation.isComplete()).toBeTruthy();
    });

    it('should return false when animation is transformed', () => {
      const animation = new SpriteAnimation([5, 4, 1, 8, 7]);

      animation.frame = 3;
      animation.transform = 'foo';

      expect(animation.isComplete()).toBeFalsy();
    });
  });

  describe('getNextFrame()', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation();
    });

    it('should return 0 if animation has no frames', () => {
      expect(animation.getNextFrame()).toBe(0);
    });

    it('should calculate frame for single-frame animations', () => {
      animation.setFrames([1]);
      animation.elapsedTime = 500;

      expect(animation.getNextFrame()).toBe(0);
    });

    it('should calculate frame for multi-frame animations.', () => {
      animation.setFrames([1, 2, 3, 4]);
      animation.elapsedTime = 250;

      expect(animation.getNextFrame()).toBe(2);
    });

    it('should account for animation speed', () => {
      animation.setFrames([1, 2, 3, 4]);
      animation.speed = 0.5;
      animation.elapsedTime = 300;

      expect(animation.getNextFrame()).toBe(1);
    });

    it('should wrap frame index', () => {
      animation.setFrames([1, 2, 3, 4]);
      animation.elapsedTime = 1050;

      expect(animation.getNextFrame()).toBe(2);
    });
  });

  describe('step()', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation([1, 2, 3, 4]);
    });

    it('should update the frame based on elapsed time', () => {
      animation.step(250);

      expect(animation.frame).toBe(2);
    });

    it('should return true if the frame is updated', () => {
      expect(animation.step(250)).toBeTruthy();
    });

    it('should return false if the frame is not updated', () => {
      animation.frame = 0;

      const result = animation.step(50);

      expect(result).toBeFalsy();
    });

    it('should not update if the animation is paused', () => {
      animation.paused = true;

      const result = animation.step(100);

      expect(result).toBeFalsy();
      expect(animation.frame).toBe(-1);
    });

    it('should not update if there are no animation frames', () => {
      animation.setFrames([]);

      const result = animation.step(100);

      expect(result).toBeFalsy();
      expect(animation.frame).toBe(-1);
    });

    it('should remain on the last frame if loop is disabled', () => {
      animation.loop = false;
      animation.frame = 3;

      animation.step(100);

      expect(animation.frame).toBe(3);
    });
  });
});
