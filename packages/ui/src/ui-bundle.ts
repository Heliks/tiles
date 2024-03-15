import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { Host } from './context';
import { Elements } from './provider/elements';
import {
  DrawUi,
  EventSystem,
  MaintainElements,
  MaintainLayouts,
  MaintainNodes,
  UpdateElements,
  UpdateLayouts,
  UpdateNodes
} from './systems';
import { UiElement } from './ui-element';
import { UiNode } from './ui-node';


/**
 * Bunde that provides UI functionality.
 */
export class UiBundle implements Bundle {

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    app
      .component(Host)
      .component(UiNode)
      .component(UiElement)
      .provide(Elements)
      .system(EventSystem)
      .system(MaintainElements)
      .system(MaintainNodes)
      .system(UpdateNodes)
      .system(UpdateElements)
      .system(MaintainLayouts)
      .system(UpdateLayouts)
      .system(DrawUi, RendererSchedule.Update);
  }

}
