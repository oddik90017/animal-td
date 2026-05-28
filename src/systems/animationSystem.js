export function enemyAnimationState(enemy, nowSec) {
  const bob = Math.sin(nowSec * 8 + enemy.wave * 0.7) * (enemy.isBoss ? 7 : 4);
  const hitAlpha = enemy.hitFlashT > 0 ? 0.75 : 0;
  const deathAlpha = enemy.alive ? 1 : Math.max(enemy.deathFadeT / 0.35, 0);
  return { bob, hitAlpha, deathAlpha };
}
