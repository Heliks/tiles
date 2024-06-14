import { AppBuilder, AppSchedule, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { Host } from './context';
import { Document, EventLifecycle } from './providers';
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
import { UiFocus } from './ui-focus';
import { UiNode } from './ui-node';


/** System schedules used by the {@link UiBundle}. */
export enum UiSchedule {

  /**
   * Runs after {@link AppSchedule.PostUpdate}. Most of the UI computation in preparation
   * for the final rendering happens here.
   */
  Compute = 'ui-compute',

  /**
   * Runs before the {@link Compute} schedule. Here, {@link UiElement elements} will
   * be updated and recursively maintained until the full layout tree can be rendered.
   */
  MaintainElements = 'ui-maintain-elements'
  
}

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
      .schedule().after(UiSchedule.MaintainElements, AppSchedule.PostUpdate)
      .schedule().after(UiSchedule.Compute, UiSchedule.MaintainElements)
      .provide(Document)
      .provide(EventLifecycle)
      .provide(UiFocus)
      // The element manager will also maintain layouts in case the document becomes
      // dirty during its update, hence why this needs to be declared first.
      .system(MaintainLayouts, UiSchedule.Compute)
      // Process events before elements are updated. This ensures that OnEvent lifecycle
      // calls happen on the same frame as the event itself.
      .system(EventSystem, UiSchedule.MaintainElements)
      .system(ElementManager, UiSchedule.MaintainElements)
      .system(UpdateLayouts, UiSchedule.Compute)
      .system(MaintainNodes, UiSchedule.Compute)
      .system(UpdateNodes, UiSchedule.Compute)
      .system(DrawUi, RendererSchedule.Update);
  }

}
