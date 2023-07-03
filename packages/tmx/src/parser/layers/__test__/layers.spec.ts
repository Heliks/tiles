import { Grid } from '@heliks/tiles-engine';
import { TmxLayerGroup, TmxLayerType, parseLayer } from '../layers';


describe('Layers', () => {
  it('should parse group layers', () => {
    const map = require('./maps/layers-layer-groups.json');

    const layer = parseLayer(
      map,
      map.layers[1],
      new Grid(0, 0, 0, 0)
    ) as TmxLayerGroup;

    expect(layer.type).toBe(TmxLayerType.Group);
    expect(layer.data.length).toBe(2);

    // Check if parsed layers have the correct type.
    expect(layer.data[0].type).toBe(TmxLayerType.Tiles);
    expect(layer.data[1].type).toBe(TmxLayerType.Objects);
  });
});