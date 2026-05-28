export function resolveProjectileHit(projectile, hitEnemy, enemies, effects) {
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
      effects.push({ x: hitEnemy.x, y: hitEnemy.y, r: radius, t: 0.2, maxT: 0.2, color: "rgba(255,100,180,0.45)" });
    } else if (type === "poison") {
      hitEnemy.addPoison({ dps: damage * 0.28, duration: 2.4 });
      effects.push({ x: hitEnemy.x, y: hitEnemy.y, r: 26, t: 0.25, maxT: 0.25, color: "rgba(90,235,90,0.45)" });
    }
  }
  effects.push({ x: hitEnemy.x, y: hitEnemy.y, r: 20, t: 0.14, maxT: 0.14, color: "rgba(255,255,255,0.3)" });
}
