import { TmxHasPropertyData } from './utils';


/** TMX JSON format for shapes. */
export interface TmxGeometryData extends TmxHasPropertyData {
  ellipse?: boolean;
  height: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}
