const SHIELD_REGEN_PER_SEC = 10;
const SHIELD_REGEN_DELAY = 2.0;

export class PlayerHealth {
  max = 100;
  hp = 100;
  shieldMax = 50;
  shield = 50;
  private regenCooldown = 0;

  heal(amount: number): void {
    this.hp = Math.min(this.max, this.hp + amount);
  }

  takeDamage(amount: number): void {
    this.regenCooldown = SHIELD_REGEN_DELAY;
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
    }
    if (amount > 0) {
      this.hp = Math.max(0, this.hp - amount);
    }
  }

  update(dt: number): void {
    if (this.regenCooldown > 0) {
      this.regenCooldown = Math.max(0, this.regenCooldown - dt);
      return;
    }
    if (this.shield < this.shieldMax) {
      this.shield = Math.min(this.shieldMax, this.shield + SHIELD_REGEN_PER_SEC * dt);
    }
  }

  get dead(): boolean { return this.hp <= 0; }
}
