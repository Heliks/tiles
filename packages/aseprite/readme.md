Asset loader format that loads sprite-sheets exported by aseprite.

Supports both "Hash" and "Array" outputs.

- File extension: `.aseprite.json`.

## Usage

Add the `AsepriteFormat` to your `AssetsBundle`. The format will now load all files
with the extension `.aseprite.json`.

```ts
 runtime()
  .bundle(
    new AssetsBundle()
      .use(new AsepriteFormat())
  )
```

## Animations

As individual frame durations are not supported by the animation system, the frame
duration for the entire animation is defined by the duration of its first frame.
