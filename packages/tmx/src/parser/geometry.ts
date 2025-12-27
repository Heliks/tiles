import { Circle, Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { Geometry } from '../level';
import { TmxGeometryData } from '../tmx';
import { ParserConfig } from './config';
import { parseCustomType } from './custom-type';
import { getCustomProps } from './props';


/** @internal */
function createShape(data: TmxGeometryData): ColliderShape {
  if (data.ellipse) {
    // We do not support ellipses, hence why we convert them to circles. Calculate the
    // radius based on the larger of the two sides of the ellipsis.
    const radius = Math.max(data.width, data.height) / 2;

    return new Circle(
      radius,
      data.x + radius,
      data.y + radius
    );
  }

  return new Rectangle(
    data.width,
    data.height,
    data.x + (data.width / 2),
    data.y + (data.height / 2)
  );
}

/** Parses {@link TmxGeometryData geometry data}. */
export function parseGeometry(data: TmxGeometryData, config: ParserConfig): Geometry {
  const shape = createShape(data).shrink(config.unitSize);

  shape.x /= config.unitSize;
  shape.y /= config.unitSize;

  return {
    id: data.id,
    name: data.name,
    props: getCustomProps(data),
    shape: createShape(data),
    type: parseCustomType(data)
  };
}
