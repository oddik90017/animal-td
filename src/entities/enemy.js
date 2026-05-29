export class Enemy {
  constructor({
    x,
    y,
    hp,
    speed,
    damage,
    reward,
    sprite,
    wave,
    isElite = false,
    isBoss = false,
    bossMultiplier = 1,
  }) {
    this.x = x;
    this.y = y;
    this.baseHp = hp;
    this.maxHp = Math.round(hp * (isElite ? 1.5 : 1) * bossMultiplier);
    this.hp = this.maxHp;
    this.speed = speed * (isElite ? 1.12 : 1) * (isBoss ? 0.82 : 1);
    this.damage = Math.round(damage * (isElite ? 1.35 : 1) * bossMultiplier);
    this.reward = Math.round(reward * (isElite ? 1.2 : 1) * bossMultiplier);
    this.radius = isBoss ? 42 : isElite ? 26 : 20;
    this.sprite = sprite;
    this.wave = wave;
    this.isElite = isElite;
    this.isBoss = isBoss;
    this.alive = true;
    this.reachedBase = false;
    this.hitFlashT = 0;
    this.deathFadeT = 0;
    this.deathEffectPlayed = false;
    this.poisonTicks = [];
    this.knockbackVx = 0;
    this.knockbackVy = 0;
    this.knockbackT = 0;
  }

  applyDamage(amount) {
    this.hp -= amount;
    this.hitFlashT = 0.16;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.deathFadeT = 0.35;
      this.deathEffectPlayed = false;
    }
  }

  addPoison({ dps, duration }) {
    this.poisonTicks.push({ dps, remaining: duration });
  }

  update(delta, targetX, targetY, targetRadius) {
    if (!this.alive) {
      this.deathFadeT = Math.max(0, this.deathFadeT - delta);
      return;
    }

    if (this.hitFlashT > 0) {
      this.hitFlashT = Math.max(0, this.hitFlashT - delta);
    }

    if (this.poisonTicks.length) {
      let poisonDamage = 0;
      for (const tick of this.poisonTicks) {
        poisonDamage += tick.dps * delta;
        tick.remaining -= delta;
      }
      this.poisonTicks = this.poisonTicks.filter((t) => t.remaining > 0);
      this.hp -= poisonDamage;
      if (this.hp <= 0) {
        this.hp = 0;
        this.alive = false;
        this.deathFadeT = 0.35;
        this.deathEffectPlayed = false;
        return;
      }
    }

    if (this.knockbackT > 0) {
      this.x += this.knockbackVx * delta;
      this.y += this.knockbackVy * delta;
      this.knockbackT -= delta;
      return;
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= targetRadius + this.radius * 0.52) {
      this.reachedBase = true;
      if (!this.isBoss) {
        this.alive = false;
      }
      return;
    }

    this.x += (dx / dist) * this.speed * delta;
    this.y += (dy / dist) * this.speed * delta;
  }
}
