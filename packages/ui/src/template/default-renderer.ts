import { Entity } from '@heliks/tiles-engine';
import { TemplateRenderer } from '../elements';
import { BaseTemplateComposer, TemplateFactory } from './types';


export class DefaultRenderer<C extends BaseTemplateComposer> implements TemplateRenderer {

  constructor(
    public readonly composer: C,
    public readonly factory: TemplateFactory<C>
  ) {}

  /** @inheritDoc */
  public render(): Entity {
    return this.composer.child(this.factory).entity;
  }

}
