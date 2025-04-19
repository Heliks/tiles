/* eslint-disable new-cap */
import { B2Body, B2Fixture } from '@heliks/box2d';
import { Collider } from '@heliks/tiles-physics';


/** Creates a Box2D collision filter from the settings of the given `collider`. */
export function setFilterData(fixture: B2Fixture, collider: Collider): void {
  const filter = fixture.GetFilterData();

  Object.assign(filter, {
    categoryBits: collider.group,
    maskBits: collider.mask
  });
}

/**
 * Synchronizes all fixtures of the given `body` with the colliders on which they are
 * based on. Some updates may require the collider to be `dirty`.
 */
export function syncFixtures(body: B2Body): void {
  for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
    const collider = fixture.GetUserData().collider as Collider;

    if (collider.dirty) {
      setFilterData(fixture, collider);
      collider.dirty = false;
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
