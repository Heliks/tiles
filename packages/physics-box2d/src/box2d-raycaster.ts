import { B2Fixture, B2ParticleSystem, B2RayCastCallback, B2Vec2, B2World } from '@heliks/box2d';
import { Inject, Injectable, Vec2, XY } from '@heliks/tiles-engine';
import { Ray } from '@heliks/tiles-physics';
import { B2_RAYCASTS, B2_WORLD, RaycastQueue } from './const';
import { FixtureUserData } from './types';


/**
 * Service to perform Box2D raycasts.
 *
 * This service simultaneously acts as a persistent {@link B2RayCastCallback} that
 * feeds the reports of intersections into a {@link Ray}.
 */
@Injectable()
export class Box2dRaycaster extends B2RayCastCallback {

  /**
   * Safety: Raycasts can only be performed with a valid ray. Therefore, the manager can
   * only be used by providing this first.
   *
   * @internal
   */
  private ray!: Ray;

  constructor(
    @Inject(B2_RAYCASTS)
    private readonly raycasts: RaycastQueue,
    @Inject(B2_WORLD)
    private readonly world: B2World,
  ) {
    super();
  }

  /** @inheritDoc */
  public ReportFixture(fixture: B2Fixture, point: B2Vec2, normal: B2Vec2, fraction: number): number {
    const data = fixture.GetUserData() as FixtureUserData;

    return this.ray.report(
      data.entity,
      data.collider,
      normal,
      fraction
    );
  }

  /** @inheritDoc */
  public ReportParticle(system: B2ParticleSystem, index: number, point: B2Vec2, normal: B2Vec2, fraction: number): number {
    return 0;
  }

  /** @inheritDoc */
  public ShouldQueryParticleSystem(system: B2ParticleSystem): boolean {
    return false;
  }

  /** Performs a raycast, using the given `ray`. */
  public cast(ray: Ray, from: XY, to: XY): void {
    this.ray = ray;
    this.world.RayCast(this, from, to);


    this.world.RayCast(from, to, () => 0);

    // Since this can run fairly often we only push these events in case there are any
    // subscribers to this queue to prevent the creation of unnecessary garbage that has
    // to be collected. This will mostly be used to draw debug information anyway.
    if (this.raycasts.size() > 0) {
      this.raycasts.push({
        start: new Vec2().copy(from),
        end: new Vec2().copy(to)
      });
    }
  }

}
