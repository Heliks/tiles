import { Entity, Ignore, Transform, TypeId, Vec2, World, XY } from '@heliks/tiles-engine';
import { Physics } from '@heliks/tiles-physics';
import { Locomotion } from '../locomotion';
import { SteeringBehavior } from '../steering-behavior';
import { AvoidanceRay } from './avoidance-ray';


/**
 * Avoidance applies an additional steering force to a steering behavior that slightly
 * pushes the entity away from obstacles in its path.
 *
 * This is not a pathfinding algorithm and therefore doesn't prevent entities from moving
 * into walls or other large obstacles. Avoiding works best against obstacles with circle
 * colliders. It doesn't work very well with "T" shapes.
 *
 * ```ts
 *   world.insert(
 *    new Transform(),
 *    new RigidBody().collider(
 *      new Circle(1)
 *    ),
 *
 *    // ...
 *    // Other steering behaviors can be stacked on top of the avoidance behavior to
 *    // apply an avoidance force to its result. Using the seek behavior, this entity
 *    // will steer towards a world position in a straight line while trying to steer
 *    // away from obstacles.
 *    new Locomotion(
 *      new Avoidance(
 *        new Seek(10, 10)
 *      )
 *    ),
 *  );
 * ```
 *
 * `T`: The steering behavior type to which the avoidance will be applied to.
 */
@TypeId('locomotion_avoidance')
export class Avoidance<T extends SteeringBehavior> implements SteeringBehavior {

  /** Calculated avoidance vector. */
  @Ignore()
  public avoidance = new Vec2();

  /** Determines by how much the entity steers away from an obstacle. */
  public force = 1;

  /** Vision ray. */
  @Ignore()
  private ray = new AvoidanceRay();

  /** Vector to calculate the target position of a vision ray. */
  @Ignore()
  private rayTo = new Vec2(0, 0);

  /** Amount of radians that vision rays are separated from the "cone" center. */
  public visionWideness = 0.349066;

  /** Distance that the entity can look ahead to detect obstacles. */
  public visionDistance = 1.5;

  /**
   * @param behavior The steering behavior to execute. The final direction vector of
   *  this behavior will be the result of this steering behavior with the avoidance
   *  force applied.
   */
  constructor(public readonly behavior: T) {}

  /** Returns the nearest obstacle in the entities path, if any. */
  public obstacle(world: World, from: XY, direction: XY): Entity | undefined {
    const physics = world.get(Physics);

    this.ray.reset();

    // Center ray.
    this.rayTo
      .copy(direction)
      .scale(this.visionDistance)
      .add(from);

    physics.raycast(this.ray, from, this.rayTo);

    // Left side.
    this.rayTo
      .copy(direction)
      .rotate(-this.visionWideness)
      .scale(this.visionDistance)
      .add(from)

    physics.raycast(this.ray, from, this.rayTo);

    // Right side.
    this.rayTo
      .copy(direction)
      .rotate(this.visionWideness)
      .scale(this.visionDistance)
      .add(from)

    physics.raycast(this.ray, from, this.rayTo);

    return this.ray.obstacle;
  }

  /** @inheritDoc */
  public update(world: World, locomotion: Locomotion, transform: Transform): Vec2 {
    const direction = this.behavior.update(world, locomotion, transform);
    const obstacle = this.obstacle(world, transform.world, direction);

    this.avoidance.set(0, 0);

    if (obstacle !== undefined) {
      const transform = world.storage(Transform).get(obstacle);

      this.avoidance
        .copy(transform.world)
        .add(direction)
        .sub(transform.world)
        .normalize()
        .scale(this.force);
    }

    return direction.add(this.avoidance).normalize();
  }

}
