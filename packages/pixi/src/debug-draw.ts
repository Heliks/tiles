import { Injectable, Vec2 } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { Camera } from './camera';
import { Screen } from './common';
import { RendererConfig } from './config';
import { hex2rgb } from './utils';


/**
 * Utility that can be used to draw debug information on the screen. The debug draw
 * will be cleared automatically at the beginning of each frame.
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
  public readonly context: CanvasRenderingContext2D;

  /** WebGL texture for the canvas context. */
  public readonly texture: Texture;

  /** Sprite that contains all drawn debug information. */
  public readonly view: Sprite;

  /** @internal */
  private readonly canvas = document.createElement('canvas');

  /**
   * @param camera {@see Camera}
   * @param config {@see RendererConfig}
   * @param screen {@see Screen}
   */
  constructor(
    private readonly camera: Camera,
    private readonly config: RendererConfig,
    private readonly screen: Screen
  ) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to get 2D drawing context.');
    }

    this.context = ctx;

    // From the canvas element, create a WebGL Texture and a PIXI sprite.
    this.texture = Texture.from(this.canvas);
    this.view = Sprite.from(this.texture);
    this.view.zIndex = 9999;
  }

  /** Clears the drawing context completely. */
  public clear(): void {
    this.context.save();

    // Briefly resets the transformation matrix back to default for clearing.
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.restore();
    this.texture.update();
  }

  /**
   * Resizes the debug draw canvas element and re-calculates the pivot based on the
   * new middle position.
   */
  public resize(width: number, height: number): this {
    this.canvas.width = width;
    this.canvas.height = height;

    // Sets the pivot of the context to the center.
    this.context.resetTransform();
    this.context.translate(width / 2, height / 2);

    this.texture.update();

    return this;
  }

  /** Sets the scale in which the debug draw should be rendered. */
  public scale(x: number, y: number): this {
    this.context.scale(x, y);

    return this;
  }

  /** Stores the current state of the debug draw context. */
  public save(): this {
    this.context.save();

    return this;
  }

  /** Restores the previous saved state of the debug draw context. */
  public restore(): this {
    this.context.restore();

    return this;
  }

  /** Adds a translation transformation on the `x` and `y` axis. */
  public translate(x: number, y: number): this {
    this.context.translate(
      x - (this.camera.world.x * this.config.unitSize),
      y - (this.camera.world.y * this.config.unitSize)
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

    this.context.lineWidth = width;
    this.context.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;

    return this;
  }

  /** Draws a line from `start` to `dest`. */
  public drawLine(start: Vec2, dest: Vec2): this {
    this.context.beginPath();

    this.context.moveTo(start.x, start.y);
    this.context.lineTo(dest.x, dest.y);

    this.context.stroke();

    return this;
  }

  /**
   * Draws a `text` message at the given `x` and `y` position.
   */
  public text(text: string, x: number, y: number): void {
    this.context.font = '4px Arial';
    this.context.fillStyle = "red";

    this.context.fillText(text, x, y);
  }

}
