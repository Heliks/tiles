import { Style as Base } from '@heliks/tiles-ui';
import { TextStyle } from './text-style';


export interface Style extends Base {

  /** If defined, sets the styling for text in this node. */
  text?: TextStyle;

}
