import { TmxObjectLayerData, TmxTileLayerData } from './tmx';
import { ObjectLayer, TileLayer } from './layers';
import { tmxExtractProperties } from '../properties';
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
    tmxExtractProperties(data)
  );
}

/** Parses TMX tile layer data. */
export function tmxParseTileLayer(data: TmxTileLayerData): TileLayer {
  if (data.chunks) {
    throw new Error('Infinite maps are not supported');
  }

  return new TileLayer(
    data.name,
    data.data,
    tmxExtractProperties(data)
  );
}
