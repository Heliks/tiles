import { Container } from '../drawable';
import { depthSort } from './depth';
import { Layer } from './layer';

/** Manages the layer hiararchy. */
export class Layers {

  /**
   * @param container Container in which layers should be placed.
   */
  constructor(private readonly container: Container<Layer>) {}

  /**
   * Adds a new layer and returns its index. If `sortable` is set to true the children
   * of this layer will be depth-sorted before they are rendered.
   */
  public add(sortable = false): number {
    this.container.addChild(new Layer(sortable));

    return this.container.children.length - 1;
  }

  /**
   * Returns the layer at the given `index`. Throws an error if no layer at that index
   * exists.
   */
  public get(index: number): Layer {
    const layer = this.container.children[index];

    if (!layer) {
      throw new Error(`No layer exists at index ${index}`);
    }

    return layer;
  }

  /**
   * Takes care of depth-sorting layers that are marked as `sortable`. Should be called
   * once on each frame.
   */
  public update(): void {
    for (const layer of this.container.children) {
      if (layer.sortable) {
        depthSort(layer.children);
      }
    }
  }

}
