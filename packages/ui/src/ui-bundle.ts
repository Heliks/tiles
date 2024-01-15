import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { Context } from './context';
import {
  DrawUi,
  EventSystem,
  MaintainContexts,
  MaintainLayouts,
  SyncNodes,
  UpdateContexts,
  UpdateElements,
  UpdateLayouts
} from './systems';
import { UiNode } from './ui-node';


/**
 * Bunde that provides UI functionality.
 */
export class UiBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .component(Context)
      .component(UiNode)
      .system(EventSystem)
      .system(SyncNodes)
      .system(MaintainLayouts)
      .system(MaintainContexts)
      .system(UpdateContexts)
      .system(UpdateElements)
      .system(UpdateLayouts)
      .system(DrawUi, RendererSchedule.Update);
  }

}
