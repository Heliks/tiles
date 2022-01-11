import { b2CircleShape, b2FixtureDef, b2PolygonShape, b2World } from '@flyover/box2d';
import { Circle, Rectangle } from '@heliks/tiles-engine';
import { Collider, Material, MaterialManager } from '@heliks/tiles-physics';
import { Box2dBodyFactory } from '../box2d-body-factory';


describe('BodyFactory', () => {
  let materials: MaterialManager;
  let factory: Box2dBodyFactory;

  beforeEach(() => {
    materials = new MaterialManager();
    factory   = new Box2dBodyFactory(new b2World({ x: 0, y: 0 }), materials);
  });

  describe('fixtures', () => {
    it('should be returned', () => {
      const fixture = factory.getFixtureDef(new Collider(new Rectangle(1, 1)));

      expect(fixture).toBeInstanceOf(b2FixtureDef);
    });

    it('should have be able to have a rectangle shape', () => {
      const fixture = factory.getFixtureDef(new Collider(new Rectangle(1, 1)));

      expect(fixture.shape).toBeInstanceOf(b2PolygonShape);
    });

    it('should be able to have a circle shape', () => {
      const radians = 1;
      const fixture = factory.getFixtureDef(new Collider(new Circle(radians)));

      expect(fixture.shape).toBeInstanceOf(b2CircleShape)
      expect(fixture.shape.m_radius).toBe(radians);
    });

    it('should inherit material properties', () => {
      const material = new Material('test', 5, 6, 7);

      materials.register(material);

      const fixture = factory.getFixtureDef(new Collider(new Rectangle(0, 0), 'test'));

      expect(fixture).toMatchObject({
        density: material.density,
        friction: material.friction,
        restitution: material.restitution
      });
    });

    it('should set group and mask bits', () => {
      const group = 1;
      const mask  = 4;

      const collider = new Collider(new Rectangle(1, 1));

      collider.group = group;
      collider.mask = mask;

      const fixture = factory.getFixtureDef(collider);

      expect(fixture.filter.categoryBits).toBe(group);
      expect(fixture.filter.maskBits).toBe(mask);
    });
  });
});