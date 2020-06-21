import { Sprite, Texture } from 'pixi.js';
import { Vec2 } from "@tiles/engine";
import { hex2rgb } from "./utils";

export class DebugDraw {

  /** Drawing context for [[canvas]]. */
  public readonly ctx: CanvasRenderingContext2D;

  /** Sprite that contains all drawn debug information. */
  public readonly view: Sprite;

  /** The canvas element where the all information will be drawn.*/
  protected readonly canvas = document.createElement('canvas');

  /** WebGL texture that we'll create from the [[canvas]] element. */
  protected readonly texture: Texture;

  constructor() {
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to get 2D drawing context.');
    }

    this.ctx = ctx;

    // Create a WebGL texture for the canvas element.
    this.texture = Texture.from(this.canvas);

    // Create the sprite that can be drawn to the stage and make sure that it
    // is always rendered on top of everything else.
    this.view = Sprite.from(this.texture);
    this.view.zIndex = 9999;
  }

  /** Clears the drawing context completely. */
  public clear(): void {
    // Update the texture so that changes made to the canvas context are
    // accurately reflected on the debug draws view.
    this.texture.update();

    // Clear the canvas so that we can re-draw on the next frame.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Resize the debug canvas draw element. */
  public resize(width: number, height: number, ratio: number): void {
    this.canvas.width = width;
    this.canvas.height = height;

    // Needs re-upload because of dimension change.
    this.texture.update();

    this.ctx.scale(ratio, ratio);
  }

  /**
   * Sets the style in which future lines should be drawn.
   *
   * @param width The width in px.
   * @param color Line color in hex.
   * @param opacity (optional) Opacity from 0 to 1. By default lines will be
   *  drawn fully visible (opacity 1)
   */
  public setLineStyle(width: number, color: number, opacity = 1): this {
    const rgb = hex2rgb(color);

    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;

    return this;
  }

  /** Draws a line from `start` to `dest`. */
  public drawLine(start: Vec2, dest: Vec2): this {
    this.ctx.beginPath();

    this.ctx.moveTo(start[0], start[1]);
    this.ctx.lineTo(dest[0], dest[1]);

    this.ctx.stroke();

    return this;
  }

}
