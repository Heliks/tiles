WIP

# Tiled (TMX) Module

Loads tiled (tmx) map and tileset files.

- [Tiled](https://www.mapeditor.org/)

## Position values

Position values for free-floating shape objects will be converted to be 
relative to the objects center instead of the top left corner.

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

## Ellipses

The physics engine does not support ellipses hence why all eliiptic shapes
will be converted to a circle. The circle radius will be the larger of the
two sides of the ellipsis.




