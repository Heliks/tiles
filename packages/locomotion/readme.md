This bundle provides functionality to move entities using steering forces.

To enable locomotion, add `Locomotion` component with a `SteeringBehavior`
to an entity with both `Transform` and `RigidBody` components: 

```ts
 // Create an entity that wanders around autonomously.
 world
   .create()
   .use(new Transform(0, 0))
   .use(new Locomotion(new Wander()))
   .use(new RigidBody().collider(new Circle(1)))
   .build();
```

Available steering behaviors are:

- Avoidance
- Seek
- Wander
