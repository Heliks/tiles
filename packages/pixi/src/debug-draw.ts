import { Sprite, Texture } from 'pixi.js';
import { Injectable, Vec2 } from '@heliks/tiles-engine';
import { hex2rgb } from './utils';
import { Camera } from './camera';
import { Screen } from './screen';

export enum Align {
  Center,
  TopLeft
}

/**
 * Utility that can be used to draw debug information on the screen. The debug draw
 * will be cleared automatically on each frame.
 */
@Injectable()
export class DebugDraw {

  /**
   * 2D Drawing context.
   *
   * You can draw on this directly to add debug information to your game or can use
   * one of the utility methods of this class. The context will be cleared automatically
   * at the beginning of each frame.
   *
   * The pivot of this context is always in the middle of the canvas element. So if for
   * example the canvas has a dimension of 200x200px, the position `x: 0, y: 0` will in
   * reality be `x: 100px, y: 100px`.
   */
  public readonly ctx: CanvasRenderingContext2D;

  /** Sprite that contains all drawn debug information. */
  public readonly view: Sprite;

  /** @internal */
  private readonly canvas = document.createElement('canvas');
  private readonly texture: Texture;

  /**
   * @param camera @link camera
   * @param screen @link screen
   */
  constructor(private readonly camera: Camera, private readonly screen: Screen) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to get 2D drawing context.');
    }

    this.ctx = ctx;

    // From the canvas element, create a WebGL Texture and a PIXI sprite.
    this.texture = Texture.from(this.canvas);
    this.view = Sprite.from(this.texture);
    this.view.zIndex = 9999;
  }

  /** Clears the drawing context completely. */
  public clear(): void {
    // Update the texture so that changes made to the canvas context are
    // accurately reflected on the debug draws view.
    this.texture.update();

    this.ctx.save();

    // Briefly resets the transformation matrix back to default for clearing.
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.restore();
  }

  /**
   * Resizes the debug draw canvas element and re-calculates the pivot based on the
   * new middle position.
   */
  public resize(width: number, height: number): this {
    this.canvas.width = width;
    this.canvas.height = height;

    // Sets the pivot of the context to the center.
    this.ctx.resetTransform();
    this.ctx.translate(width / 2, height / 2);

    // WebGL textures need a re-upload when their dimension has changed.
    this.texture.update();

    return this;
  }

  /** Sets the scale in which the debug draw should be rendered. */
  public scale(x: number, y: number): this {
    this.ctx.scale(x, y);

    return this;
  }

  /** Stores the current state of the debug draw context. */
  public save(): this {
    this.ctx.save();

    return this;
  }

  /** Restores the previous saved state of the debug draw context. */
  public restore(): this {
    this.ctx.restore();

    return this;
  }

  /** Adds a translation transformation on the `x` and `y` axis. */
  public translate(x: number, y: number): this {
    this.ctx.translate(
      x - (this.camera.world.x * this.screen.unitSize),
      y - (this.camera.world.y * this.screen.unitSize)
    );

    return this;
  }

  /**
   * Sets the style in which future lines should be drawn.
   *
   * @param width The width in px.
   * @param color Line color in hex.
   * @param opacity (optional) Opacity from 0 to 1.
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

    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(dest.x, dest.y);

    this.ctx.stroke();

    return this;
  }

  /**
   * Draws a `text` message at the given `x` and `y` position.
   */
  public text(text: string, x: number, y: number, align = Align.Center): void {
    this.ctx.font = '4px Arial';
    this.ctx.fillStyle = "red";

    if (align === Align.TopLeft) {
      x -= (this.screen.resolution.x / 2);
      y -= (this.screen.resolution.y / 2);
    }

    this.ctx.fillText(text, x, y);
  }

}
