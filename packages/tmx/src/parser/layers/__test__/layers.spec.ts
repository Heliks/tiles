import { Grid } from '@heliks/tiles-engine';
import { parseLayer, TmxLayerGroup, TmxLayerKind } from '../layers';


describe('Layers', () => {
  it('should parse group layers', () => {
    const map = require('./maps/layers-layer-groups.json');

    const layer = parseLayer(
      map,
      map.layers[1],
      new Grid(0, 0, 0, 0)
    ) as TmxLayerGroup;

    expect(layer.kind).toBe(TmxLayerKind.Group);
    expect(layer.data.length).toBe(2);

    // Check if parsed layers have the correct type.
    expect(layer.data[0].kind).toBe(TmxLayerKind.Tiles);
    expect(layer.data[1].kind).toBe(TmxLayerKind.Objects);
  });
});
