import { CameraEffect, CameraEffects } from '../camera-effects';


class NoopEffect implements CameraEffect {

  constructor(public readonly id: number) {}

  update = jest.fn();
}

describe('CameraEffects', () => {
  let effects: CameraEffects;

  beforeEach(() => {
    effects = new CameraEffects();
  });

  it('should remove identical active effects when adding an effect', () => {
    effects
      .add(new NoopEffect(1))
      .add(new NoopEffect(2));

    const active = effects.active[0] as NoopEffect;

    expect(active.id).toBe(2);
    expect(effects.active).toHaveLength(1);
  });
});