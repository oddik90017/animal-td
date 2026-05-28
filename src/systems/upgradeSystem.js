const priceConfig = {
  attackSpeed: { base: 35, ratio: 1.58 },
  damage: { base: 45, ratio: 1.67 },
  explosive: { base: 90, ratio: 1.9 },
  poison: { base: 100, ratio: 2.02 },
  ricochet: { base: 120, ratio: 2.15 },
};

export function buildUpgradeState() {
  return {
    attackSpeedLevel: 0,
    damageLevel: 0,
    evolutionLevel: { explosive: 0, poison: 0, ricochet: 0 },
    projectileTypes: {},
  };
}

export function calcUpgradeCost(state, type) {
  if (type === "attackSpeed") {
    return Math.round(priceConfig.attackSpeed.base * Math.pow(priceConfig.attackSpeed.ratio, state.attackSpeedLevel));
  }
  if (type === "damage") {
    return Math.round(priceConfig.damage.base * Math.pow(priceConfig.damage.ratio, state.damageLevel));
  }
  const level = state.evolutionLevel[type];
  return Math.round(priceConfig[type].base * Math.pow(priceConfig[type].ratio, level));
}

export function buyUpgrade(state, goldRef, type) {
  const cost = calcUpgradeCost(state, type);
  if (goldRef.value < cost) return false;

  goldRef.value -= cost;
  if (type === "attackSpeed") {
    state.attackSpeedLevel += 1;
  } else if (type === "damage") {
    state.damageLevel += 1;
  } else {
    state.evolutionLevel[type] += 1;
    state.projectileTypes[type] = true;
  }
  return true;
}
