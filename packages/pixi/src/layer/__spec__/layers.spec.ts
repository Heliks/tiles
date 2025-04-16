import { Layers } from '../layers';


describe('Layers', () => {
  let layers: Layers;

  beforeEach(() => {
    layers = new Layers();
  });

  describe('insertAt', () => {
    it('should insert a layer at the given index', () => {
      const layer0 = 1;
      const layer1 = 2;
      const layer2 = 3;
      const layer3 = 4;

      layers.insertAt(layer0, 0);
      layers.insertAt(layer1, 1);
      layers.insertAt(layer2, 2);
      layers.insertAt(layer3, 1);

      const ids = layers.items.map(layer => layer.id);

      expect(ids).toEqual([
        layer0,
        layer3,
        layer1,
        layer2
      ]);
    });

    it('should correctly set the index of each layer', () => {
      const layer0 = 1;
      const layer1 = 2;
      const layer2 = 3;
      const layer3 = 4;

      layers.insertAt(layer0, 0);
      layers.insertAt(layer1, 1);
      layers.insertAt(layer2, 2);
      layers.insertAt(layer3, 1);

      const idx = [
        layers.getIndex(layer0),
        layers.getIndex(layer1),
        layers.getIndex(layer2),
        layers.getIndex(layer3)
      ];

      expect(idx).toEqual([0, 2, 3, 1]);
    });
  });

  it('should insert a layer', () => {
    const id = 1;

    layers.add(id);

    const index = layers.getIndex(id);

    expect(index).toBe(0);
  });

  it('should insert a layer before a different layer', () => {
    const id1 = 1;
    const id2 = 2;

    layers.add(id2);
    layers.before(id1, id2);

    const index = layers.getIndex(id1);

    expect(index).toBe(0);
  });

  it('should insert a layer after a different layer', () => {
    const id1 = 1;
    const id2 = 2;
    const id3 = 3;

    layers.add(id1);
    layers.add(id3);

    layers.after(id2, id1);

    const index = layers.getIndex(id2);

    expect(index).toBe(1);
  });

  it('should remove a layer', () => {
    const id = 'foo';

    layers.add(id);
    layers.remove(id);

    expect(() => layers.get(id)).toThrow();
  });

});
