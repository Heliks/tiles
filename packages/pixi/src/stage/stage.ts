import { Entity, Injectable, World } from '@heliks/tiles-engine';
import { Container, Drawable } from '../drawable';
import { RenderGroup } from '../render-group';


/**
 * Contains all game objects.
 *
 * Everything rendered here is scaled appropriately according to resolution and zoom
 * factor, which means that if we have a 200x200px screen with 100x100px resolution a
 * 20x20px `Drawable` would be scaled to the appropriate size of `40x40px`.
 *
 * @see Overlay
 * @see Renderer
 */
@Injectable()
export class Stage extends Container {

  /**
   * Contains render groups that are added to this stage, mapped to the entity to which
   * the component is assigned to.
   *
   * Do not modify this directly, as the render system takes care of managing stage
   * groups automatically.
   */
  public readonly groups = new Map<Entity, RenderGroup>();

  /** @inheritDoc */
  public sortableChildren = true;

  /**
   * Inserts a `drawable` into the stage. If a render `group` is given as a parent, the
   * drawable will be added as child of that group.
   *
   * Throws if the group is not a part of this stage.
   */
  public insert(drawable: Drawable, group?: Entity): void {
    if (group !== undefined) {
      const component = this.groups.get(group);

      if (! component) {
        throw new Error(`Invalid render group ${group}`);
      }

      component.container.add(drawable);
    }
    else {
      this.add(drawable);
    }
  }

}


