export function scaledEnemyStats(wave) {
  const hp = Math.round(38 * Math.pow(1.18, wave - 1));
  const speed = Math.min(90 + wave * 3.2, 250);
  const damage = Math.round(4 * Math.pow(1.1, wave - 1));
  const reward = Math.round(12 * Math.pow(1.15, wave - 1));
  return { hp, speed, damage, reward };
}

export function buildWaves() {
  const waves = [];

  for (let wave = 1; wave <= 50; wave += 1) {
    if (wave === 20) {
      waves.push({
        wave: 20,
        isBossWave: true,
        count: 1,
        spawnInterval: 0.5,
        eliteChance: 1,
        bossMultiplier: 7.8,
      });
      continue;
    }

    const baseCount = 7 + Math.min(wave, 30) * 2;
    waves.push({
      wave,
      isBossWave: false,
      count: baseCount,
      spawnInterval: Math.max(0.52 - wave * 0.012, 0.12),
      eliteChance: Math.min(0.05 + wave * 0.02, 0.5),
      bossMultiplier: 1,
    });
  }

  return waves;
}
