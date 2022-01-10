import { b2Body, b2CircleShape, b2Fixture, b2PolygonShape, b2Shape } from '@flyover/box2d';
import { b2FixtureDef } from '@flyover/box2d';
import { Circle, Entity } from '@heliks/tiles-engine';
import { Rectangle } from '@heliks/tiles-engine';
import { Injectable } from '@heliks/tiles-engine';
import { Collider, Material, MaterialManager, RigidBody } from '@heliks/tiles-physics';
import { b2ParseShape } from '../utils';

@Injectable()
export class BodyFactory {

  constructor(public readonly materials: MaterialManager) {}

  public parseFixture(body: RigidBody, collider: Collider, def = new b2FixtureDef()): b2FixtureDef {
    // Attach the shape to the fixture.
    def.shape = b2ParseShape(collider.shape);
    def.isSensor = collider.sensor;

    // Assign material. Hard check here because the number 0 is a valid material id.
    if (collider.material !== undefined) {
      const material = this.materials.get(collider.material);

      def.density = material.density;
      def.friction = material.friction;
      def.restitution = material.restitution;
    }

    // Collision groups are inherited by the rigid body itself.
    def.filter.categoryBits = body.group;
    def.filter.maskBits = body.mask;

    return def;
  }

}


describe('BodyFactory', () => {
  let materials: MaterialManager;
  let factory: BodyFactory;

  beforeEach(() => {
    materials = new MaterialManager();
    factory   = new BodyFactory(materials);
  });

  describe('fixtures', () => {
    it('should be parsed', () => {
      const def = factory.parseFixture(
        new RigidBody(),
        new Collider(new Rectangle(1, 1))
      );

      expect(def).toBeInstanceOf(b2FixtureDef);
    });

    it('should be able to have a rectangle shape', () => {
      const def = factory.parseFixture(
        new RigidBody(),
        new Collider(new Rectangle(1, 1))
      );

      expect(def.shape).toBeInstanceOf(b2PolygonShape);
    });

    it('should be able to have a circle shape', () => {
      const rad = 1;
      const def = factory.parseFixture(
        new RigidBody(),
        new Collider(new Circle(rad))
      );

      expect(def.shape).toBeInstanceOf(b2CircleShape)
      expect(def.shape.m_radius).toBe(rad);
    });

    it('should inherit material properties', () => {
      const material = new Material('test', 5, 6, 7);

      materials.register(material);


      const def = factory.parseFixture(
        new RigidBody(),
        new Collider(new Rectangle(0, 0), 'test')
      );

      expect(def).toMatchObject({
        density: material.density,
        friction: material.friction,
        restitution: material.restitution
      });
    });
  });
});