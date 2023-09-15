import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { ComputeLayouts, DrawUi, EventSystem, MaintainLayouts, SyncNodes, UpdateWidgets } from './systems';
import { UiNode } from './ui-node';


/**
 * Bunde that provides UI functionality.
 */
export class UiBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .component(UiNode)
      .system(EventSystem)
      .system(SyncNodes, RendererSchedule.Update)
      .system(MaintainLayouts, RendererSchedule.Update)
      .system(UpdateWidgets, RendererSchedule.Update)
      .system(ComputeLayouts, RendererSchedule.Update)
      .system(DrawUi, RendererSchedule.Update);
  }

}
