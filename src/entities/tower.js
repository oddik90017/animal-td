import { Projectile } from "./projectile.js";

export class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 230;
    this.baseCooldown = 0.72;
    this.cooldown = 0;
  }

  update(delta, ctx) {
    this.cooldown = Math.max(0, this.cooldown - delta);
    if (this.cooldown > 0) return;

    const target = ctx.enemies
      .filter((e) => e.alive)
      .sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y))
      .find((enemy) => Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.range);

    if (!target) return;

    const fireRateMultiplier = 1 + ctx.upgrades.attackSpeedLevel * 0.50;
    this.cooldown = this.baseCooldown / fireRateMultiplier;

    const damage = 24 * (1 + ctx.upgrades.damageLevel * 1.00);
    const activeTypes = Object.keys(ctx.upgrades.projectileTypes).filter((t) => ctx.upgrades.projectileTypes[t]);
    const projectileType = activeTypes.length > 0 ? activeTypes : ["normal"];
    const projectile = new Projectile({
      x: this.x,
      y: this.y,
      target,
      speed: 420,
      damage,
      type: projectileType,
      image: ctx.projectileImage,
    });
    ctx.projectiles.push(projectile);
  }
}
