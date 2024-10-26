import { CameraEffect, CameraEffects } from '../camera-effects';


class NoopEffect implements CameraEffect {
  update = jest.fn();
}

describe('CameraEffects', () => {
  let effects: CameraEffects;

  beforeEach(() => {
    effects = new CameraEffects();
  });

  it('should remove identical active effects when adding an effect', () => {
    const replacement = new NoopEffect();

    effects
      .add(new NoopEffect())
      .add(replacement);

    // Extract remaining active effect.
    const active = Array.from(effects.active.values())[0];

    expect(effects.active.size).toBe(1);
    expect(active).toBe(replacement);
  });
});
