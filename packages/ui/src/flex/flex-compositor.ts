import { Entity, Hierarchy, Injectable, InjectStorage, Screen, Storage } from '@heliks/tiles-engine';
import { AlignItems, FlexDirection, JustifyContent, Style } from './style';
import { Rectangle } from 'pixi.js';
import { UiNode } from '../ui-node';
import { FlexContainer } from './flex-container';


/** Composites the content of {@link UiNode} components with a flexbox {@link Style}. */
@Injectable()
export class FlexCompositor {

  /** @internal */
  private readonly _bounds = new Rectangle();

  /** @internal */
  private readonly _content: Entity[] = [];

  /** @internal */
  private readonly _flexbox = new FlexContainer(0, 0);

  constructor(
    @InjectStorage(Style)
    private readonly layouts: Storage<Style>,
    @InjectStorage(UiNode)
    private readonly roots: Storage<UiNode>,
    private readonly hierarchy: Hierarchy,
    private readonly screen: Screen
  ) {}

  /** Returns available width in px. */
  public getWidth(style: Style): number {
    return style.width ? style.width.toPx(this.screen.resolution.x) : this.screen.resolution.x;
  }

  /** Returns available height in px. */
  public getHeight(style: Style): number {
    return style.height ? style.height.toPx(this.screen.resolution.y) : this.screen.resolution.y;
  }

  /** Returns the size of the flexbox main {@link FlexDirection axis} in px. */
  public getMainAxisSize(style: Style): number {
    return style.direction === FlexDirection.Column ? this.getHeight(style) : this.getWidth(style);
  }

  /** Returns the size of the flexbox main {@link FlexDirection axis} in px. */
  public getCrossAxisSize(style: Style): number {
    return style.direction === FlexDirection.Column ? this.getWidth(style) : this.getHeight(style);
  }

  /** @internal */
  private getMainAxisOffset(bounds: FlexContainer, style: Style): number {
    switch (style.justify) {
      case JustifyContent.Center:
        return (this.getMainAxisSize(style) / 2) - (bounds.main / 2);
      case JustifyContent.End:
        return this.getMainAxisSize(style) - (bounds.main);
      default:
      case JustifyContent.Start:
        return 0;
    }
  }

  /** @internal */
  private getCrossAxisOffset(bounds: FlexContainer, style: Style): number {
    switch (style.align) {
      case AlignItems.Center:
        return (this.getCrossAxisSize(style) / 2) - (bounds.cross / 2);
      case AlignItems.End:
        return this.getCrossAxisSize(style) - bounds.cross;
      default:
      case AlignItems.Start:
        return 0;
    }
  }

  /** @internal */
  private getColumnItemCrossOffset(boxWidth: number, itemWidth: number, style: Style): number {
    switch (style.align) {
      case AlignItems.Center:
        return (boxWidth / 2) - (itemWidth / 2);
      case AlignItems.End:
        return boxWidth - itemWidth;
      default:
      case AlignItems.Start:
        return 0;
    }
  }

  /** @internal */
  private getRowItemCrossOffset(boxHeight: number, itemHeight: number, style: Style): number {
    switch (style.align) {
      case AlignItems.Center:
        return (boxHeight / 2) - (itemHeight / 2);
      case AlignItems.End:
        return boxHeight - itemHeight;
      default:
      case AlignItems.Start:
        return 0;
    }
  }

  /**
   * Returns the boundaries of a content item.
   *
   * @param owner Owner of the content item component.
   * @param component Node component of the content item.
   * @param style Stylesheet of the flexbox that contains the content item.
   * @param out (optional) Rectangle where result should be written to.
   */
  public getContentItemBounds(owner: Entity, component: UiNode, style: Style, out = new Rectangle()): Rectangle {
    component.container.getLocalBounds(out);

    // Respect width and height styling of content item.
    if (this.layouts.has(owner)) {
      const cItemStyle = this.layouts.get(owner);

      if (cItemStyle.width) {
        out.width = cItemStyle.width.toPx(this.getWidth(style));
      }

      if (cItemStyle.height) {
        out.height = cItemStyle.height.toPx(this.getHeight(style));
      }
    }

    return out;
  }

  /** @internal */
  private updateColumnContentBounds(entity: Entity, items: Entity[], style: Style, out: FlexContainer): FlexContainer {
    out.cross = this.roots.get(entity).container.getLocalBounds(this._bounds).width;

    for (const child of items) {
      const component = this.roots.get(child);
      const bounds = this.getContentItemBounds(child, component, style, this._bounds);

      component.x = this.getColumnItemCrossOffset(out.cross, bounds.width, style);
      component.y = out.main - bounds.y;

      out.main += this._bounds.height;
    }

    return out;
  }

  /** @internal */
  private updateRowContentBounds(entity: Entity, items: Entity[], style: Style, out: FlexContainer): FlexContainer {
    out.cross = this.roots.get(entity).container.getLocalBounds(this._bounds).height;

    for (const child of items) {
      const component = this.roots.get(child);
      const bounds = this.getContentItemBounds(child, component, style, this._bounds);

      component.x = out.main - bounds.x;
      component.y = this.getRowItemCrossOffset(out.cross, bounds.height, style);

      out.main += this._bounds.width;
    }

    return out;
  }

  /** @internal */
  private updateContentBounds(entity: Entity, items: Entity[], style: Style): FlexContainer {
    this._flexbox.reset();

    return style.direction === FlexDirection.Column
      ? this.updateColumnContentBounds(entity, items, style, this._flexbox)
      : this.updateRowContentBounds(entity, items, style, this._flexbox);
  }

  /** @internal */
  private getContentItems(entity: Entity): Entity[] {
    const children = this.hierarchy.children.get(entity);

    this._content.length = 0;

    if (children) {
      for (const child of children) {
        if (this.roots.has(child)) {
          this._content.push(child);
        }
      }
    }

    return this._content;
  }

  /** Applies `style` to the owner of a {@link UiNode} component. */
  public apply(entity: Entity, style: Style): void {
    const items = this.getContentItems(entity);

    // No content items to apply style to.
    if (items.length === 0) {
      return;
    }

    // const items = this.getContentItems(entity);
    const space = this.updateContentBounds(entity, items, style);

    // Calculate offsets.
    const main = this.getMainAxisOffset(space, style);
    const cross = this.getCrossAxisOffset(space, style);

    for (const child of items) {
      const view = this.roots.get(child);

      if (style.direction === FlexDirection.Row) {
        view.container.x += main;
        view.container.y += cross;
      }
      else {
        view.container.x += cross;
        view.container.y += main;
      }
    }
  }

}
