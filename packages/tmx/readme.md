# Tiled (TMX) Module

Module for loading and handling tiled (TMX) maps. 

Note: Only supports the tiled JSON format.

## Position values

Positions in Tiled are based on different anchor positions depending on
the object type. For example object layer objects have their anchor on 
the bottom-center while tiles are top-left. To circumvent this all position 
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

Colliders can be added to tiles via the Tiled collision editor. To be 
recognized as such by the engine you must give the shape the type `collision`.

### Ellipses

The physics engine does not support ellipses hence why all elliptic shapes
will be converted to circles instead. For the circle radius the larger of 
the two sides (width or height) of the ellipsis will be used. 
