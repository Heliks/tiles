import { Injectable, isDefined } from '@heliks/tiles-engine';
import { Drawable } from '../drawable';
import { Layers } from './layers';
import { LayerId } from './layer';


/**
 * The stage is a utility API that allows the insertion of {@link Drawable drawables}
 * into the appropriate renderer {@link Layers layers}. If no layers are specified,
 * the stage will place drawables into the first one available.
 */
@Injectable()
export class Stage {

  /**
   * @param layers {@see Layers}
   */
  constructor(private readonly layers: Layers) {}

  /** Adds a {@link Drawable drawable}. */
  public add(drawable: Drawable, layerId?: LayerId): this {
    const layer = isDefined(layerId)
      ? this.layers.get(layerId)
      : this.layers.getAt(0);

    layer.add(drawable);

    return this;
  }

  /** Removes a {@link Drawable drawable}. */
  public remove(drawable: Drawable): this {
    drawable.parent?.removeChild(drawable);

    return this;
  }

}


