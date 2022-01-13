import { Rectangle } from '@heliks/tiles-engine';
import { Collider } from '../collider';


const RECT = new Rectangle(0, 0, 0, 0);

describe('Collider', () => {
  it('should add contacts with other colliders', () => {
    const collider = new Collider(RECT);

    collider.addContact(0, 15);

    expect(collider.contacts[0]).toMatchObject({
      colliderId: 15,
      entity: 0
    });
  });

  it('should remove contacts with other colliders', () => {
    const collider = new Collider(RECT);

    collider.addContact(0, 15);
    collider.removeContact(0, 15);

    expect(collider.contacts).toHaveLength(0);
  });

  describe('tags', () => {
    const TAG_A = 1;
    const TAG_B = 2;
    const TAG_C = 4;
    const TAG_ALL = TAG_A | TAG_B | TAG_C;

    let colliders: Collider;

    beforeEach(() => {
      colliders = new Collider(RECT);
    });

    it('should set a tag', () => {
      colliders.tag(TAG_ALL);

      expect(colliders.hasTags(TAG_A)).toBeTruthy();
    });

    it('should set multiple tags', () => {
      colliders.tag(TAG_ALL);

      expect(colliders.hasTags(TAG_A | TAG_C)).toBeTruthy();
    });

    it('should check if a tag is not set', () => {
      colliders.tag(TAG_A | TAG_B);

      expect(colliders.hasTags(TAG_C)).toBeFalsy();
    });

    it('should check if one of the tags in the mask is not set', () => {
      colliders.tag(TAG_A | TAG_B);

      expect(colliders.hasTags(TAG_A | TAG_C)).toBeFalsy();
    });

    it('should remove a tag', () => {
      colliders
        .tag(TAG_ALL)
        .untag(TAG_B);

      expect(colliders.hasTags(TAG_B)).toBeFalsy();
    });

    it('should remove multiple tags', () => {
      colliders
        .tag(TAG_ALL)
        .untag(TAG_B | TAG_C);

      expect(colliders.hasTags(TAG_B | TAG_C)).toBeFalsy();
    });
  });
});
