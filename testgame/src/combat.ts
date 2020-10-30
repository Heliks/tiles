import { contains, Injectable, ProcessingSystem, Ticker, World } from '@heliks/tiles-engine';

export class Combat {
  public meleeAttackComboCounter = 0;
  public meleeAttackComboRemainingTime = 0;
  public meleeAttackSwingTimer = 0;
}

// Melee attack combos.

/** Updates the combo counter for `combat`. */
function updateComboCounter(combat: Combat, delta: number): void {
  if (combat.meleeAttackComboRemainingTime <= 0) {
    return;
  }

  combat.meleeAttackComboRemainingTime -= delta;

  // If the remaining time of the melee cooldown is over we reset the combo
  // counter back to `0`.
  if (combat.meleeAttackComboRemainingTime <= 0) {
    combat.meleeAttackComboCounter = 0;
  }
}

@Injectable()
export class CombatSystem extends ProcessingSystem {

  constructor(private readonly ticker: Ticker) {
    super(contains(
      Combat
    ));
  }

  /** @inheritDoc */
  public update(world: World): void {
    const combats = world.storage(Combat);

    for (const entity of this.group.entities) {
      const combat = combats.get(entity);

      updateComboCounter(combat, this.ticker.delta);

      if (combat.meleeAttackSwingTimer > 0) {
        combat.meleeAttackSwingTimer -= this.ticker.delta;
      }
    }
  }

}
