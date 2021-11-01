import { Material } from './material';

/** Serializable, unique identifier of a physics material. */
export type MaterialId = string | number;

export class MaterialManager {

  /** @internal */
  private readonly materials = new Map<MaterialId, Material>();

  public register(material: Material): this {
    if (this.materials.has(material.id)) {
      throw new Error(`A material with ID ${material.id} already exists.`);
    }

    this.materials.set(material.id, material);

    return this;
  }

  public get(id: MaterialId): Material {
    const material = this.materials.get(id);

    if (! material) {
      throw new Error(`Unknown material ${id}`);
    }

    return material;
  }

}
