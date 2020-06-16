import { Inject, Injectable } from "@tiles/injector";
import { RENDERER_CONFIG_TOKEN, RendererConfig } from "./config";

@Injectable()
export class Camera {

  /** Position on x axis. */
  public x = 0;

  /** Position on y axis. */
  public y = 0;

  public transform(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

}
