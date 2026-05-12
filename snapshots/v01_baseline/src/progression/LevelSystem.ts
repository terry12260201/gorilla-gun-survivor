export class LevelSystem {
  level = 1;
  xp = 0;
  pendingLevelUps = 0;

  addXp(amount: number): void {
    this.xp += amount;
    while (this.xp >= this.toNext()) {
      this.xp -= this.toNext();
      this.level += 1;
      this.pendingLevelUps += 1;
    }
  }

  toNext(): number {
    return 3 * this.level;
  }

  consumeLevelUp(): boolean {
    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps -= 1;
      return true;
    }
    return false;
  }
}
