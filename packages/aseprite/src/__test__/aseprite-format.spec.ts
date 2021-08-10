import { AssetLoader } from '@heliks/tiles-assets';
import { AsepriteFormat } from '../aseprite-format';
import { SpriteSheet, Texture } from '@heliks/tiles-pixi';
import { AsepriteData } from '../file-format';

class AsepriteFormatMock extends AsepriteFormat {

  /** @inheritDoc */
  protected getTexture(): Promise<Texture> {
    return Promise.resolve(Texture.WHITE);
  }

}

describe('AsepriteFormat', () => {
  let format: AsepriteFormat;
  let loader: AssetLoader;

  beforeEach(() => {
    format = new AsepriteFormatMock();
    loader = new AssetLoader();
  });

  function parse(data: AsepriteData): Promise<SpriteSheet> {
    return format.process(data, './', loader);
  }

  it('should parse frames with output type "Array"', async () => {
    const result = await parse(require('./output-array.json'));

    expect(result.size()).toBeGreaterThan(0);
  });

  it('should parse frames with output type "Hash"', async () => {
    const result = await parse(require('./output-hash.json'));

    expect(result.size()).toBeGreaterThan(0);
  });
});
