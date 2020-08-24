import { SpriteAnimation } from './sprite-animation';

describe('SpriteAnimation', () => {
  it('should check if an animation is complete', () => {
    // Random frame indexes. The values here don't matter.
    const animation = new SpriteAnimation([5, 4, 1, 8, 7]);

    // Set the animation to its last frame.
    animation.frame = 4;

    expect(animation.isComplete()).toBeTruthy();
  });
});
