export interface AsepriteSize {
  h: number;
  w: number;
}

export interface AsepriteRectangleData extends AsepriteSize {
  x: number;
  y: number;
}

export interface AsepriteFrameTagData {
  name: string;
  from: number;
  to: number;
}

export interface AsepriteFrameData {
  duration: number;
  frame: AsepriteRectangleData;
  spriteSourceSize: AsepriteRectangleData;
  sourceSize: AsepriteSize;
}

export interface AsepriteMetaData {
  image: string;
  frameTags: AsepriteFrameTagData[];
}

export interface AsepriteFramesMap {
  [name: string]: AsepriteFrameData;
}

export interface AsepriteData {
  frames: AsepriteFrameData[] | AsepriteFramesMap;
  meta: AsepriteMetaData;
}
