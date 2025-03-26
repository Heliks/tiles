import { getRandomFloat, Transform, UUID, Vec2, World } from '@heliks/tiles-engine';
import { Locomotion } from '../locomotion';
import { SteeringBehavior } from '../steering-behavior';


/**
 * Lets the entity wander around aimlessly.
 *
 * This behavior tries to avoid moving entities in straight line and to prevent it from
 * changing direction abruptly. This creates the perception that the wandering is in
 * fact, aimless.
 */
@UUID('tiles_locomotion_wander')
export class Wander implements SteeringBehavior {

  private displacement = new Vec2(0, 0);
  private distance = 1.5;
  private circlePos = new Vec2(0, 0);

  private radius = 0.5;
  private angle = getRandomFloat(360);

  private maxAngleChange = +0.1;
  private minAngleChange = -0.1;

  /** @inheritDoc */
  public update(world: World, movement: Locomotion, transform: Transform): Vec2 {
    // Calculate the "wander circles" center position, which should be in front of the
    // wandering entity.
    this.circlePos.copy(movement.direction).scale(this.distance);

    // Calculate displacement force.
    this.displacement.set(0, -1).scale(this.radius);

    const length = this.displacement.magnitude();

    this.displacement.x = Math.cos(this.angle) * length;
    this.displacement.y = Math.sin(this.angle) * length;

    // Slightly change wander angle by a random amount for the next frame.
    this.angle += getRandomFloat(this.maxAngleChange, this.minAngleChange);

    // Calculate final force vector.
    return this.circlePos.add(this.displacement).normalize();
  }

  /** @inheritDoc */
  public reset(): void {
    this.angle = getRandomFloat(360);
  }

}
