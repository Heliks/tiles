import { AppBuilder, Bundle } from '@heliks/tiles-engine';
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
      .system(UpdateInteractions);
  }

}
