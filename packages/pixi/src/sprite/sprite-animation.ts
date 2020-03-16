export class SpriteAnimation {

  public frame = 0;
  public speed = 100;
  public elapsedTime = -1;

  constructor(public readonly frames: number[]) {}

}