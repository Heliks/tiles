import { MaterialId } from './material-manager';


/**
 * A physics material is used to adjust physical properties density, friction and
 * restitution of a `Collider`.
 */
export class Material {

  /**
   * @param id Unique identifier. Must be unique across all materials.
   * @param density Density of the collider measured in kilograms per square meter. A
   *  higher density means a heavier collider and therefore a heavier rigid body. For
   *  example a collider with a size 2x2m and a density of `80` will have a total
   *  weight of 160kg. Be aware that in top-down games where there is usually no
   *  gravity the object might still behave lighter than anticipated.
   * @param friction Value between `0` and `1` that determines how much friction the
   *  collider has when sliding on others. A value of `0` completely disables friction.
   * @param restitution Value between 0 and 1 that determines how "bouncy" each
   *  collider should be, closer  to 0 is less bouncy, closer to 1 more.
   */
  constructor(
    public readonly id: MaterialId,
    public readonly density = 0,
    public readonly friction = 0,
    public readonly restitution = 0
  ) {}

}
