import { Line } from './line';
import { Rect } from './rect';
import { Sides } from './sides';
import { AlignContent, FlexBasisContent } from './style';
import { Option } from './types';


export const FLEX_BASIS_CONTENT: FlexBasisContent = 'content';

/**
 * Caches intermediate computations during layout computation. This class is considered
 * internal and should not be manually edited.
 */
export class Constants {

  public baseSize = 0;
  public innerBaseSize = 0;

  /**
   * Definite initial free space along the main axis before flex factors are applied to
   * its flex items.
   */
  public initialFreeSpace = 0;


  public align = AlignContent.Start;
  public baseline = 0;
  public justify = AlignContent.Start;
  public isRow = true;
  public frozen = false;

  public readonly lines: Line[] = [];

  public readonly margin = new Sides();
  public readonly padding = new Sides();

  public hypotheticalInnerSize = new Rect(0, 0);
  public hypotheticalOuterSize = new Rect(0, 0);


  public measure = Rect.option();

  /**
   * Computed definite outer node size. This is the computed {@link size} with margins
   * applied.
   */
  public readonly outerSize = new Rect(0, 0);

  public readonly targetSize = new Rect(0, 0);

  /**
   * Computed definite node size. When both the main and cross size are determined, the
   * computation for this node is complete.
   */
  public readonly size = new Rect<Option<number>>(undefined, undefined);


  public readonly space = new Rect(0, 0);
  public wrap = false;

}

