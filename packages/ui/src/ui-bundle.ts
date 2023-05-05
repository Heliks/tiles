import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { RendererSchedule } from '@heliks/tiles-pixi';
import { DrawUi } from './draw-ui';
import { UpdateInteractions } from './update-interactions';
import { FlexCompositor, Style } from './flex';
import { UiNode } from './ui-node';


/**
 * Bunde that provides UI functionality.
 */
export class UiBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .component(Style)
      .component(UiNode)
      .provide(FlexCompositor)
      .system(UpdateInteractions)
      .system(DrawUi, RendererSchedule.Update);
  }

}
