Bundle that provides a 2D rendering pipeline via the PIXI.js library.

## Usage

To use the renderer, add its bundle to the game runtime:

```ts
runtime()
  // ... Runtime configuration.
  .bundle(
    new PixiBundle({
      selector: '#stage'
    })
  )
  .build()
  .start();
```

### Settings

#### Required

- **selector** `string`:

  Selector for the renderer canvas.

  The renderer will automatically append the canvas to the element matched by this
  selector when the game is initialized.

  Must be a valid input for `document.querySelector()`.

#### Optional

- **antiAlias** `boolean` (Default: `false`):

  Enables or disables antialiasing.

- **autoResize** `boolean` (Default: `true`):

  Enables or disables auto-resizing.

  When enabled, the renderer will automatically resize the canvas element to fit
  its parent element. This causes the entire game scene to be scaled to match the
  games' resolution.

- **background** `number` (Default: `0x000000`):

  Background color of the game stage.

- **layers** `Function`:

  If defined, allows for custom configuration of renderer layers.

  See: [Layers](#Layers)

- **unitSize** `number` (Default: `1`):

  The unit size tells the renderer how many pixels are equivalent to one game unit.

  When working with a non-pixel based physics engine, its highly recommended to use
  a unit size to translate between an arbitrary unit and pixels. The renderer will
  apply this unit size to all transform values to translate that unit back to pixels 
  for rendering.

  For example, given a unit size of `16`, an entity at the world position x:5 / y:5
  will be rendered on the screen at the position x:80px / y:80px.

## Layers

In most cases each game that is being developed wants to define its own layer hierarchy 
to specifically fit its needs. This can be done by defining the `layers` setup function:

```ts
function setupRendererLayers(layers: Layers): void {
  // Insert a basic layer.
  layers.add('layer0');

  // All drawables on this layer will be automatically sorted by their y-axis:
  layers.add('layer1').sortBy((a, b) => a.y - b.y);

  // Insert a layer at a specific position:
  layers.after('layer2', 'layer0');
  layers.before('layer2', 'layer0');

  // Layer that ignores camera zoom: 
  layers.add('layer3').zoom(false);
}

// Create the game runtime.
runtime()
  .bundle(
    new PixiBundle({
      layers: setupRendererLayers,
      selector: '#stage'
    })
  )
  .build()
  .start();
```

If no custom hierarchy is defined, the renderer will put everything on a single layer.
