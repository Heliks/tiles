import { Camera } from '../camera';

describe('Camera', () => {
  it('should calculate real width', () => {
    const camera = new Camera(10, 10);

    camera.scale = 1.5;
    camera.width = 10;

    expect(camera.getRealWidth()).toBe(15);
  });

  it('should calculate real height', () => {
    const camera = new Camera(10, 10);

    camera.scale = 1.5;
    camera.height = 10;

    expect(camera.getRealHeight()).toBe(15);
  });

  it('should clamp x axis coordinates', () => {
    const camera = new Camera(100, 100).setBounds({
      x: 0,
      y: 0,
      w: 100,
      h: 100
    });

    // Value is below minimum; should be clamped up.
    expect(camera.clampX(-1)).toBe(0);
    // Value is above maximum; should be clamped down.
    expect(camera.clampX(150)).toBe(100);
    // Value does not require clamping.
    expect(camera.clampX(50)).toBe(50);
  });

  it('should clamp y axis coordinates', () => {
    const camera = new Camera(100, 100).setBounds({
      x: 0,
      y: 0,
      w: 100,
      h: 100
    });

    // Value is below minimum; should be clamped up.
    expect(camera.clampY(-1)).toBe(0);
    // Value is above maximum; should be clamped down.
    expect(camera.clampY(150)).toBe(100);
    // Value does not require clamping.
    expect(camera.clampY(50)).toBe(50);
  });
});
