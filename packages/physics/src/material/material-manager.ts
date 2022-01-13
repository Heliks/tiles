import { Material } from './material';


/** Serializable, unique identifier of a physics material. */
export type MaterialId = string | number;

/**
 * Manages physics materials.
 *
 * @see Material
 */
export class MaterialManager {

  /** @internal */
  private readonly materials = new Map<MaterialId, Material>();

  /**
   * Registers a `material`. Will throw an error if a material with the same ID is
   * already registered.
   */
  public register(material: Material): this {
    if (this.materials.has(material.id)) {
      throw new Error(`A material with ID ${material.id} already exists.`);
    }

    this.materials.set(material.id, material);

    return this;
  }

  /**
   * Returns the material matching `id`. Throws an error if no such material was
   * previously registered.
   */
  public get(id: MaterialId): Material {
    const material = this.materials.get(id);

    if (! material) {
      throw new Error(`Unknown material ${id}`);
    }

    return material;
  }

}
