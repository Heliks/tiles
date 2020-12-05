import { Material } from "@heliks/tiles-physics";

export enum CollisionGroups {
  Terrain = 1,
  Player = 2,
  Enemy = 4
}

export const MATERIAL_ORGANIC = new Material(120, 0);
export const MATERIAL_WOOD = new Material(250, 0);

export const enum MaterialType {
  ORGANIC,
  WOOD
}
