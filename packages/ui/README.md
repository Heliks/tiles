# Bitmap UI text

Load bitmap fonts through the asset loader before initializing UI text. Use the
font's registered face name, rather than its asset filename.

```ts
new UiBundle({
  text: {
    fontFamily: 'Pirata One',
    fontSize: 8,
    color: 0xffffff
  }
});

// Insert a simple UI text.
world.insert(
  new UiElement(
    new UiText('Hello World')
  ),
  new UiNode()
);

// Customize style via node style.
world.insert(
  new UiElement(
    new UiText('Heading')
  ),
  new UiNode({
    text: {
      fontSize: 12
    }
  })
);
```

