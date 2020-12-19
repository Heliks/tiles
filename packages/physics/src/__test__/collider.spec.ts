import { Collider } from '../collider';
import { Rectangle } from '@heliks/tiles-math';

const RECT = new Rectangle(0, 0, 0, 0);

describe('Collider', () => {
  it('should add contacts with other colliders', () => {
    const collider = new Collider(1, RECT);

    collider.addContact(0, 15);

    expect(collider.contacts[0]).toMatchObject({
      colliderId: 15,
      entity: 0
    });
  });

  it('should remove contacts with other colliders', () => {
    const collider = new Collider(1, RECT);

    collider.addContact(0, 15);
    collider.removeContact(0, 15);

    expect(collider.contacts).toHaveLength(0);
  });
});
