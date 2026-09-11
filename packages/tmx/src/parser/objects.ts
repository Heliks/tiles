import { Rectangle } from '@heliks/tiles-engine';
import { LevelObject } from '@heliks/tiles-level';
import { TmxObjectData } from '../tmx';
import { ParserConfig } from './config';
import { parseCustomType } from './custom-type';
import { parseGeometry } from './geometry';
import { hasFlag, parseGID, TmxGIDFlag } from './gid';
import { getCustomProps } from './props';


/** Parses {@link TmxObjectData} and produces a {@link LevelObject}. */
export function parseObjectData(data: TmxObjectData, config: ParserConfig): LevelObject {
  if (! data.gid) {
    return parseGeometry(data, config);
  }

  // Objects that are not freely placed shapes are always rectangles.
  const shape = new Rectangle(data.width, data.height, data.x, data.y).shrink(config.unitSize);
  
  shape.x /= config.unitSize;
  shape.y /= config.unitSize;

  return {
    flipX: hasFlag(data.gid, TmxGIDFlag.FlipX),
    flipY: hasFlag(data.gid, TmxGIDFlag.FlipY),
    id: data.id,
    name: data.name,
    props: getCustomProps(data),
    tileId: parseGID(data.gid),
    type: parseCustomType(data),
    shape
  };
}







