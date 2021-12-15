import { TmxObjectLayerData, TmxTileLayerData } from './tmx';
import { ObjectLayer, TileLayer } from './layers';
import { getProperties } from '../properties';
import { tmxParseObject } from './objects';

/** Parses TMX object layer data. */
export function tmxParseObjectLayer(data: TmxObjectLayerData): ObjectLayer {
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
export function tmxParseTileLayer(data: TmxTileLayerData): TileLayer {
  const chunks = [];

  if (data.chunks) {
    for (const chunk of data.chunks) {
      chunks.push(chunk.data);
    }
  }
  else {
    chunks.push(data.data);
  }

  return new TileLayer(data.name, chunks, getProperties(data));
}
