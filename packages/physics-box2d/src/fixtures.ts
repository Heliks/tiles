/* eslint-disable new-cap */
import { B2Body, B2Fixture } from '@heliks/box2d';
import { Collider } from '@heliks/tiles-physics';


export function syncBodyFixtures(body: B2Body): void {
  for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
    const collider = fixture.GetUserData().collider;

    if (collider.isDirty) {
      // Update collision filters.
      const filter = fixture
        .GetFilterData()
        .Clone();

      filter.categoryBits = collider.group;
      filter.maskBits = collider.mask;

      fixture.SetFilterData(filter);

      // Clear flag.
      collider.isDirty = false;
    }
  }
}

/**
 * Returns the `B2Fixture` on `body` that belongs to the given `collider`, or nothing if
 * no matching fixture could be found on that body.
 */
export function getColliderFixture(body: B2Body, collider: Collider): B2Fixture | undefined {
  for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
    if (fixture.GetUserData().collider.id === collider.id) {
      return fixture;
    }
  }
}
