export function resolveProjectileHit(projectile, hitEnemy, enemies, effects, game) {
  const damage = projectile.damage;
  hitEnemy.applyDamage(damage);

  for (const type of projectile.type) {
    if (type === "explosive") {
      const radius = 70;
      for (const enemy of enemies) {
        if (!enemy.alive || enemy === hitEnemy) continue;
        const dist = Math.hypot(enemy.x - hitEnemy.x, enemy.y - hitEnemy.y);
        if (dist <= radius) enemy.applyDamage(damage * 0.45);
      }
      effects.push({ x: hitEnemy.x, y: hitEnemy.y, frames: game?.effectsExplosion, size: 80, t: 0.25, maxT: 0.25 });
    } else if (type === "poison") {
      hitEnemy.addPoison({ dps: damage * 0.28, duration: 2.4 });
      effects.push({ x: hitEnemy.x, y: hitEnemy.y, frames: game?.effectsPuff, size: 50, t: 0.3, maxT: 0.3 });
    } else if (type === "lifesteal" && game) {
      const heal = Math.round(damage * 0.12);
      game.baseHp = Math.min(1000, game.baseHp + heal);
    }
  }
  effects.push({ x: hitEnemy.x, y: hitEnemy.y, frames: game?.effectsFlash, size: 40, t: 0.15, maxT: 0.15 });
}
