/** Serializable identifier of a material. */
export type MaterialId = string | number;

export interface MaterialData {
  /**
   * Density of the collider measured in kilograms per square meter. A higher density
   * means a heavier collider and therefore a heavier rigid body. For example a collider
   * with a size 2x2m and a density of `80` will have a total weight of 160kg. Be aware
   * that in top-down games where there is usually no gravity the object might still
   * behave lighter than anticipated.
   */
  density: number;
  /**
   * Value between `0` and `1` that determines how much friction the collider has when
   * sliding on others. A value of `0` completely disables friction.
   */
  friction: number;
  /**
   * Value between 0 and 1 that determines how "bouncy" each collider should be, closer
   * to 0 is less bouncy, closer to 1 more.
   */
  restitution: number;
}

export class Material implements MaterialData {

  /**
   * @param density @inheritDoc
   * @param friction @inheritDoc
   * @param restitution @inheritDoc
   */
  constructor(
    public readonly density = 0,
    public readonly friction = 0,
    public readonly restitution = 0
  ) {}

}

