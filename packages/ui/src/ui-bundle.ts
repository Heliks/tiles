import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { Host } from './context';
import { Document } from './providers/document';
import { EventLifecycle } from './providers/event-lifecycle';
import {
  DrawUi,
  ElementManager,
  EventSystem,
  MaintainLayouts,
  MaintainNodes,
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
      .provide(Document)
      .provide(EventLifecycle)
      .system(EventSystem)
      .system(ElementManager)
      .system(MaintainLayouts)
      .system(UpdateLayouts)
      .system(MaintainNodes)
      .system(UpdateNodes)
      .system(DrawUi, RendererSchedule.Update);
  }

}
