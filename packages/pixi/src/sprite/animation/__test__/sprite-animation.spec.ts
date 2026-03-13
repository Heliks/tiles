import { SpriteAnimation } from '../sprite-animation';


describe('SpriteAnimation', () => {
  let animation: SpriteAnimation;

  beforeEach(() => {
    animation = new SpriteAnimation();
  });

  describe('isComplete()', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation([1, 2, 3, 4]);
    });

    it('should return true when animation is on its last frame', () => {
      animation.frame = 3;

      expect(animation.isComplete()).toBeTruthy();
    });

    it('should return false when animation is transformed', () => {
      const animation = new SpriteAnimation([5, 4, 1, 8, 7]);

      animation.frame = 3;
      animation.transform.active = true;

      expect(animation.isComplete()).toBeFalsy();
    });
  });

  describe('getNextFrame()', () => {
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

  describe('getFrameProgress()', () => {
    it.each([
      {
        elapsed: 200,
        result: 0
      },
      {
        elapsed: 50,
        result: 0.5
      },
      {
        elapsed: 150,
        result: 0.5
      },
      {
        elapsed: 299,
        result: 0.99
      }
    ])('should return $result when elapsed time is $elapsed ms', data => {
      animation.frameDuration = 100;
      animation.elapsedTime = data.elapsed;

      const result = animation.getFrameProgress();

      expect(result).toBe(data.result);
    });
  });

  describe('setAnimation()', () => {
    it('should set the animation data', () => {
      const frames = [1, 2, 3, 4];
      const frameDuration = 150;

      animation.setAnimation({
        frames,
        frameDuration
      });

      expect(animation.frames).toEqual(frames);
      expect(animation.frameDuration).toEqual(frameDuration);
    });

    it('should reset the current animation', () => {
      animation.reset = jest.fn();
      animation.setAnimation({
        frames: []
      });

      expect(animation.reset).toHaveBeenCalled();
    });

    it('should preserve frame progress between animations', () => {
      const start = 2;

      // Frame progress is 0.5
      animation.frame = start;
      animation.elapsedTime = 250;
      animation.frameDuration = 100;

      const frames = [1, 2, 3, 4];
      const frameDuration = 150;

      animation.setAnimation({ frames, frameDuration }, true);

      expect(animation).toMatchObject({
        frame: start,
        elapsedTime: 375
      });
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
