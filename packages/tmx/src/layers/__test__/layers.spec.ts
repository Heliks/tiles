import { Grid } from '@heliks/tiles-engine';
import { LayerGroup, LayerType, parseLayer } from '../layers';


describe('Layers', () => {
  it('should parse group layers', () => {
    const map = require('./maps/layers-layer-groups.json');

    const layer = parseLayer(
      map,
      map.layers[1],
      new Grid(0, 0, 0, 0)
    ) as LayerGroup;

    expect(layer.type).toBe(LayerType.Group);
    expect(layer.data.length).toBe(2);

    // Check if parsed layers have the correct type.
    expect(layer.data[0].type).toBe(LayerType.Tiles);
    expect(layer.data[1].type).toBe(LayerType.Objects);
  });
});