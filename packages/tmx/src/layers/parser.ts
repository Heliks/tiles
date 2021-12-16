import { Grid } from '@heliks/tiles-engine';
import { getProperties } from '../properties';
import { ObjectLayer, TileChunk, TileLayer } from './layers';
import { tmxParseObject } from './objects';
import { TmxObjectLayer, TmxTileLayer } from './tmx';


/** Parses TMX object layer data. */
export function tmxParseObjectLayer(data: TmxObjectLayer): ObjectLayer {
  const objects = [];

  for (const item of data.objects) {
    objects.push(tmxParseObject(item));
  }

  return new ObjectLayer(
    data.name,
    objects,
    getProperties(data)
  );
}

/** Parses TMX tile layer data. */
export function tmxParseTileLayer(data: TmxTileLayer, layout: Grid): TileLayer {
  const chunks = [];

  if (data.chunks) {
    for (const chunk of data.chunks) {
      chunks.push(new TileChunk(
        layout,
        chunk.data,
        chunk.x,
        chunk.y
      ));
    }
  }
  else {
    chunks.push(new TileChunk(layout, data.data, 0, 0));
  }

  return new TileLayer(data.name, chunks, getProperties(data));
}
