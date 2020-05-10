import { Sprite, Texture } from 'pixi.js';

export class DebugDraw {

  /** The canvas element where the all information will be drawn.*/
  protected readonly canvas = document.createElement('canvas');

  /** Drawing context for [[canvas]]. */
  protected readonly ctx: CanvasRenderingContext2D;

  /** WebGL texture that we'll create from the [[canvas]] element. */
  protected readonly texture: Texture;

  /** Sprite that contains all drawn debug information. */
  public readonly view: Sprite;

  constructor() {
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to get 2D drawing context.');
    }

    this.ctx = ctx;

    // Create a WebGL texture for the canvas element.
    this.texture = Texture.from(this.canvas);

    // Create the sprite that can be drawn to the stage and make sure that it is
    // always rendered on top of everything else.
    this.view = Sprite.from(this.texture);
    this.view.zIndex = 9999;
  }

  public clear(): void {
    // Update the texture so that changes made to the canvas context are accurately
    // reflected on the debug draws view.
    this.texture.update();

    // Clear the canvas so that we can re-draw on the next frame.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

}
