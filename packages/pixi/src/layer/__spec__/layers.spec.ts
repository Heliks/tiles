import { Layers } from '../layers';


describe('Layers', () => {
  let layers: Layers;

  beforeEach(() => {
    layers = new Layers();
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
    const id3 = 2;

    layers.add(id1);
    layers.add(id3);

    layers.after(id2, id1);

    const index = layers.getIndex(id2);

    expect(index).toBe(1);
  });
});
