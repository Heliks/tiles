import { AppBuilder, Bundle, World } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { RenderTiles } from './render-tiles';


export class TilemapBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app.system(RenderTiles, RendererSchedule.Render);
  }

}