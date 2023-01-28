import { ClassDecoratorType, setTypeId, Type, UUID } from '@heliks/tiles-engine';
import { ShaderMaterial } from './shader-material';


/** @internal */
const MATERIAL_REGISTRY = new Map<UUID, Type<ShaderMaterial>>();

export function getMaterialFromId(id: UUID): Type<ShaderMaterial> {
  const material = MATERIAL_REGISTRY.get(id);

  if (! material) {
    throw new Error(`Invalid material ${id}`);
  }

  return material;
}

/**
 * Registers a class that implements the {@link ShaderMaterial} interface as a material,
 * using the given `id`.
 */
export function Material(id: UUID): ClassDecoratorType<ShaderMaterial> {
  return function materialDecorator(ctor: Type<ShaderMaterial>): void {
    setTypeId(ctor, id);

    MATERIAL_REGISTRY.set(id, ctor);
  }
}
