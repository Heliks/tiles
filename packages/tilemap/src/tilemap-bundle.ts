import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { RenderTiles } from './render-tiles';
import { Tilemap } from './tilemap';


export class TilemapBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app.type(Tilemap).system(RenderTiles, RendererSchedule.Render);
  }

}
