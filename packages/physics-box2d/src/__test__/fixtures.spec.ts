import { b2World } from '@heliks/box2d';
import { Rectangle } from '@heliks/tiles-engine';
import { Collider, RigidBody } from '@heliks/tiles-physics';
import { Box2dBodyFactory } from '../box2d-body-factory';
import { getColliderFixture, syncBodyFixtures } from '../fixtures';


describe('synchronize fixtures', () => {
  const factory = new Box2dBodyFactory(
    new b2World({
      x: 0,
      y: 0
    }),
  );

  it('should update collision filters', () => {
    const collider = new Collider(new Rectangle(
      0,
      0
    ));

    const body = factory.createBody(
      0,
      new RigidBody().attach(collider)
    );

    const group = 1 | 2 | 3
    const mask  = 2 | 3;

    collider.setFilterData(group, mask);

    syncBodyFixtures(body);

    const filters = getColliderFixture(body, collider)?.GetFilterData();

    expect(filters?.categoryBits).toBe(group);
    expect(filters?.maskBits).toBe(mask);
  });
});
