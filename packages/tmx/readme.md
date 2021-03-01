WIP

# Tiled (TMX) Module

Module for loading and handling tiled (TMX) maps. 

Note: Only supports the tiled JSON format.

## Position values

Positions in Tiled are based on different anchor positions depending on
the object type. For example object layer objects have their anchor on 
the bottom-left while tiles are top-left. This will be normalized to the
following:

- Tiles and shapes have their anchor in their middle, which means that a `16x16` 
  tile on grid position `0/0` will have a position of `x: 8` and `y: 8`.
- Objects: Bottom-Center


To circumvent this all position 
values will be normalized and anchored to the objects *center* instead, 
which means that a `16x16` tile on grid position `0/0` will have a position 
of `x: 8` and `y: 8`.

## Tile Animations

Tiles can be animated by adding an `animation` property to them where the 
value is the name of the animation that should be played.

Animations defined via the Tiled animation editor will be saved with the 
tile index as animation name. So if you want to create the animation for 
tile `0` you can do it like this:

```ts
const animationData = tileset.spritesheet.createAnimation('0');
```

This means that if you want to autoplay that animation you have to add 
the `animation` property to a tile using its own index (in this case 
`'0'`) as value.

## Colliders

Shapes with the type `collision` will automatically be converted to colliders. 

#### Ellipses

The physics engine does not support ellipses hence why all elliptic shapes
will be converted to circles instead. For the circle radius the larger of 
the two sides (width or height) of the ellipsis will be used.

### Rigid bodies

If an object has at least one collider a `RigidBody` will be created. Options
for the rigid body must be set on the Tiled object that defines the colliders. 




