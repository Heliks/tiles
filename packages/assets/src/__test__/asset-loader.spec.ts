import { AssetLoader } from '../asset-loader';

describe('AssetLoader', () => {
  it('should normalize base URLs', () => {
    expect(new AssetLoader().setBaseUrl('1/2/').getBaseUrl()).toBe('1/2');
  });

  it('should normalize paths', () => {
    expect(new AssetLoader().setBaseUrl('1/2/').getPath('//foo/')).toBe('1/2/foo/');
  });
});
