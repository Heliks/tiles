import { Rectangle } from '@heliks/tiles-engine';
import { BaseTexture, Texture } from 'pixi.js';
import { SpriteSlices } from '../sprite-slices';


describe('SpriteSlices', () => {
  let spritesheet: SpriteSlices;

  beforeEach(() => {
    const canvas = document.createElement('canvas');

    canvas.width = 100;
    canvas.height = 100;

    spritesheet = new SpriteSlices(new Texture(
      BaseTexture.from(canvas)
    ));
  });

  it('should create sprite texture', () => {
    spritesheet.setSliceRegion('foo', new Rectangle(5, 5, 0, 0));

    const texture = spritesheet.texture('foo');

    expect(texture).toBeInstanceOf(Texture);
  });

  it('should correctly slice the sprite texture from the source texture', () => {
    spritesheet.setSliceRegion('foo', new Rectangle(25, 10, 15, 20));

    const texture = spritesheet.texture('foo');

    expect(texture.orig).toMatchObject({
      width: 25,
      height: 10,
      x: 15,
      y: 20
    });
  });
});