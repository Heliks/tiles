import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { DrawUi } from './draw-ui';
import { SyncNodes } from './sync-nodes';
import { MaintainLayouts, ComputeLayouts } from './systems';
import { UiNode } from './ui-node';
import { UpdateInteractions } from './update-interactions';


/**
 * Bunde that provides UI functionality.
 */
export class UiBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .component(UiNode)
      .system(UpdateInteractions)
      .system(SyncNodes, RendererSchedule.Update)
      .system(MaintainLayouts, RendererSchedule.Update)
      .system(ComputeLayouts, RendererSchedule.Update)
      .system(DrawUi, RendererSchedule.Update);
  }

}
