import { Entity } from '@heliks/tiles-engine';
import { TemplateRenderer } from '../elements';
import { ComposeNode, TemplateFactory } from './types';


/** @inheritDoc */
export class DefaultRenderer<C extends ComposeNode> implements TemplateRenderer {

  /**
   * @param composer Composer of the node that wants to render this template as a child.
   * @param factory Template factory used to create the template when it is being rendered.
   */
  constructor(public readonly composer: C, public readonly factory: TemplateFactory<C>) {}

  /** @inheritDoc */
  public render(): Entity {
    // Safety: insert() always returns its own composer type.
    const composer = this.composer.insert() as C;

    this.factory(composer);

    return composer.entity;
  }

}
