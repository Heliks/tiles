import { Entity, entityId, entityVersion, World } from '@heliks/tiles-engine';
import { AssetLoader, Handle } from '@heliks/tiles-assets';
import { SPRITE_SHEET_STORAGE, SpriteSheet, SpriteSheetFromTexture } from '@heliks/tiles-pixi';
import { AsepriteFormat } from '@heliks/tiles-aseprite';

/** @internal */
export function lookupEntity(world: World, entity: Entity): void {
  const isAlive = world.alive(entity);
  const version = entityVersion(entity);

  console.group(`Entity ${entity} ${isAlive ? '(Alive)' : '(Dead)'}`);

  // If the version is "0" this warrants a special warning, because the entity most likely
  // never was alive in the first place.
  if (!isAlive && version === 0) {
    console.log('(!) Entity does not exist.');
  }

  // Entity parts.
  console.log(`id (index):\t${entityId(entity)}`);
  console.log(`version:\t${version}`);

  // Components that belong to this entity.
  for (const storage of world.getStorages()) {
    if (storage.has(entity)) {
      console.log('Component:', storage.get(entity));
    }
  }

  console.groupEnd();
}

export function loadSpriteSheet(world: World, path: string, cols: number, rows: number): Handle<SpriteSheet> {
  return world.get(AssetLoader).load(
    path,
    // Todo: Make sprite size configurable.
    new SpriteSheetFromTexture(cols, rows, 16, 16),
    world.get(SPRITE_SHEET_STORAGE)
  );
}

