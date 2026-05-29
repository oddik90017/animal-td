import { assetManifest, loadAssetBundle } from "./data/assetManifest.js";
import { buildWaves, scaledEnemyStats } from "./data/waves.js";
import { Enemy } from "./entities/enemy.js";
import { Tower } from "./entities/tower.js";
import { resolveProjectileHit } from "./systems/combatSystem.js";
import { enemyAnimationState } from "./systems/animationSystem.js";
import { buildUpgradeState, buyUpgrade, calcUpgradeCost } from "./systems/upgradeSystem.js";

export function runEvilTowerGame(canvas, ctx) {
  const game = {
    scene: "menu",
    time: 0,
    assets: null,
    waves: buildWaves(),
    currentWaveIndex: 0,
    waveActive: false,
    waveSpawnTimer: 0,
    waveSpawned: 0,
    waveAnnounceT: 0,
    enemies: [],
    projectiles: [],
    effects: [],
    centerTower: null,
    centerX: canvas.width / 2,
    centerY: canvas.height / 2 - 30,
    coreRadius: 62,
    baseHp: 1000,
    gold: 200,
    incomePerWave: 42,
    upgrades: buildUpgradeState(),
    gameOver: false,
    win: false,
    uiNotice: "",
    uiNoticeT: 0,
    hoveredButton: null,
    waveCurrency: 0,
    shopUpgrades: { extraGold: 0, attackSpeed: 0, damage: 0, explosive: false, poison: false, ricochet: false, lifesteal: false },
    speedUnlocked: false,
    speedActive: false,
    showSpeedDialog: false,
    insultMode: false,
  };

  function saveToDisk() {
    try {
      localStorage.setItem("evilTower_save", JSON.stringify({
        waveCurrency: game.waveCurrency,
        shopUpgrades: game.shopUpgrades,
      }));
    } catch (_) {}
  }

  function loadFromDisk() {
    try {
      const raw = localStorage.getItem("evilTower_save");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.waveCurrency === "number") game.waveCurrency = data.waveCurrency;
      if (data.shopUpgrades && typeof data.shopUpgrades === "object") {
        for (const key of Object.keys(game.shopUpgrades)) {
          if (key in data.shopUpgrades) game.shopUpgrades[key] = data.shopUpgrades[key];
        }
      }
    } catch (_) {}
  }

  loadFromDisk();

  const menuButtons = [
    { id: "play", label: "Играть", x: 470, y: 240, w: 260, h: 70, fill: "#d4a741" },
    { id: "shop", label: "Магазин", x: 470, y: 330, w: 260, h: 70, fill: "#3fa38f" },
  ];

  const shopItems = [
    { id: "extraGold", label: "+50 золота на старте", cost: 5, max: 5 },
    { id: "attackSpeed", label: "+1 ур. скорости атаки", cost: 8, max: 3 },
    { id: "damage", label: "+1 ур. урона", cost: 8, max: 3 },
    { id: "explosive", label: "Взрывчатка на старте", cost: 15, max: 1 },
    { id: "poison", label: "Яд на старте", cost: 15, max: 1 },
    { id: "ricochet", label: "Рикошет на старте", cost: 15, max: 1 },
    { id: "lifesteal", label: "Вампиризм на старте", cost: 15, max: 1 },
  ];

  const upgradeButtons = [
    { id: "attackSpeed", label: "ASPD", x: 50,  y: 612, w: 170, h: 44 },
    { id: "damage",      label: "DMG",  x: 230, y: 612, w: 170, h: 44 },
    { id: "explosive",   label: "Explosive", x: 410, y: 612, w: 170, h: 44 },
    { id: "poison",      label: "Poison",    x: 590, y: 612, w: 170, h: 44 },
    { id: "ricochet",    label: "Ricochet",  x: 770, y: 612, w: 170, h: 44 },
    { id: "lifesteal",   label: "Lifesteal", x: 950, y: 612, w: 170, h: 44 },
  ];

  function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function pickEnemySprite(index) {
    if (!game.assets) return null;
    const pngCandidates = assetManifest.enemyPng
      .map((path) => game.assets.imageMap.get(path))
      .filter(Boolean);
    if (pngCandidates.length > 0) {
      return pngCandidates[Math.floor(Math.random() * pngCandidates.length)];
    }
    const path = assetManifest.enemies[index % assetManifest.enemies.length];
    return game.assets.imageMap.get(path) || null;
  }

  function pickProjectileSprite() {
    if (!game.assets) return null;
    return game.assets.imageMap.get(assetManifest.projectileVariants[6]) || game.assets.imageMap.get(assetManifest.projectileVariants[0]) || null;
  }

  function pickCoreSprite() {
    if (!game.assets) return null;
    return game.assets.imageMap.get(assetManifest.towers[0]) || null;
  }

  function randomBorderPoint() {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: Math.random() * canvas.width, y: -30 };
    if (side === 1) return { x: canvas.width + 30, y: Math.random() * canvas.height };
    if (side === 2) return { x: Math.random() * canvas.width, y: canvas.height + 30 };
    return { x: -30, y: Math.random() * canvas.height };
  }

  function spawnEnemy(spec) {
    const stats = scaledEnemyStats(spec.wave);
    const isBoss = spec.isBossWave && game.waveSpawned === 0;
    const isElite = !isBoss && Math.random() < spec.eliteChance;
    const spawn = randomBorderPoint();
    const insultHp = game.insultMode ? 10 : 1;
    game.enemies.push(
      new Enemy({
        x: spawn.x,
        y: spawn.y,
        hp: stats.hp * insultHp,
        speed: stats.speed,
        damage: stats.damage,
        reward: stats.reward,
        sprite: pickEnemySprite((game.waveSpawned + spec.wave) % assetManifest.enemies.length),
        wave: spec.wave,
        isElite,
        isBoss,
        bossMultiplier: isBoss ? spec.bossMultiplier : 1,
      }),
    );
    if (game.insultMode) {
      const e = game.enemies[game.enemies.length - 1];
      e.radius *= 4;
    }
  }

  function startLevel() {
    game.scene = "level";
    game.currentWaveIndex = 0;
    game.waveActive = true;
    game.waveSpawnTimer = 0;
    game.waveSpawned = 0;
    game.waveAnnounceT = 2;
    game.baseHp = 1000;
    game.gold = 200;
    game.upgrades = buildUpgradeState();
    game.enemies = [];
    game.projectiles = [];
    game.effects = [];
    game.gameOver = false;
    game.win = false;
    game.uiNotice = "";
    // Применяем покупки из магазина
    game.gold += game.shopUpgrades.extraGold * 50;
    game.upgrades.attackSpeedLevel += game.shopUpgrades.attackSpeed;
    game.upgrades.damageLevel += game.shopUpgrades.damage;
    if (game.shopUpgrades.explosive) {
      game.upgrades.evolutionLevel.explosive = 1;
      game.upgrades.projectileTypes.explosive = true;
    }
    if (game.shopUpgrades.poison) {
      game.upgrades.evolutionLevel.poison = 1;
      game.upgrades.projectileTypes.poison = true;
    }
    if (game.shopUpgrades.ricochet) {
      game.upgrades.evolutionLevel.ricochet = 1;
      game.upgrades.projectileTypes.ricochet = true;
    }
    if (game.shopUpgrades.lifesteal) {
      game.upgrades.evolutionLevel.lifesteal = 1;
      game.upgrades.projectileTypes.lifesteal = true;
    }
    game.centerTower = new Tower(game.centerX, game.centerY);
    game.centerTower.range = 380;
  }

  function restartToMenu() {
    game.scene = "menu";
    game.waveActive = false;
    game.enemies = [];
    game.projectiles = [];
    game.effects = [];
    game.gameOver = false;
    game.win = false;
    game.uiNotice = "";
  }

  function canAfford(type) {
    return game.gold >= calcUpgradeCost(game.upgrades, type);
  }

  function tryBuy(type) {
    const goldRef = { value: game.gold };
    const ok = buyUpgrade(game.upgrades, goldRef, type);
    game.gold = goldRef.value;
    return ok;
  }

  function advanceWaveIfDone() {
    if (!game.waveActive) return;
    const wave = game.waves[game.currentWaveIndex];
    if (!wave) return;
    const waveDone = game.waveSpawned >= wave.count && game.enemies.every((e) => !e.alive && e.deathFadeT <= 0);
    if (!waveDone) return;

    game.currentWaveIndex += 1;
    if (game.currentWaveIndex >= game.waves.length) {
      game.waveActive = false;
      game.win = true;
      return;
    }

    game.gold += game.incomePerWave + Math.round(12 * Math.pow(1.1, game.currentWaveIndex));
    game.waveCurrency += 3 + Math.floor(game.currentWaveIndex / 3);
    saveToDisk();
    game.waveSpawned = 0;
    game.waveSpawnTimer = 0.3;
    game.waveAnnounceT = 1.3;
  }

  function updateWaves(delta) {
    if (!game.waveActive || game.gameOver || game.win) return;
    const wave = game.waves[game.currentWaveIndex];
    if (!wave) return;
    game.waveSpawnTimer -= delta;
    if (game.waveSpawned < wave.count && game.waveSpawnTimer <= 0) {
      spawnEnemy(wave);
      game.waveSpawned += 1;
      game.waveSpawnTimer = wave.spawnInterval;
    }
    game.waveAnnounceT = Math.max(0, game.waveAnnounceT - delta);
  }

  function updateGame(delta) {
    if (game.scene !== "level" || game.gameOver || game.win) return;
    updateWaves(delta);

    for (const enemy of game.enemies) {
      enemy.update(delta, game.centerX, game.centerY, game.coreRadius);
      if (enemy.reachedBase) {
        game.baseHp -= enemy.damage;
        game.effects.push({ x: enemy.x, y: enemy.y, frames: game.effectsExplosion, size: enemy.radius * 3, t: 0.35, maxT: 0.35 });
        enemy.reachedBase = false;
        if (enemy.isBoss) {
          const dx = enemy.x - game.centerX;
          const dy = enemy.y - game.centerY;
          const dist = Math.hypot(dx, dy) || 1;
          const knockDist = 180;
          enemy.knockbackVx = (dx / dist) * knockDist / 0.4;
          enemy.knockbackVy = (dy / dist) * knockDist / 0.4;
          enemy.knockbackT = 0.4;
        } else {
          enemy.deathFadeT = 0;
        }
      } else if (!enemy.alive && !enemy.deathEffectPlayed) {
        enemy.deathEffectPlayed = true;
        game.effects.push({ x: enemy.x, y: enemy.y, frames: game.effectsPuff, size: enemy.radius * 2, t: 0.3, maxT: 0.3 });
      }
    }

    game.enemies = game.enemies.filter((enemy) => enemy.alive || enemy.deathFadeT > 0);

    const projectileImage = pickProjectileSprite();
    game.centerTower.update(delta, {
      enemies: game.enemies,
      projectiles: game.projectiles,
      upgrades: game.upgrades,
      projectileImage,
    });

    for (const projectile of game.projectiles) {
      const result = projectile.update(delta, game.enemies);
      if (!result?.hit) continue;
      resolveProjectileHit(projectile, result.enemy, game.enemies, game.effects, game);
      if (projectile.type.includes("ricochet") && projectile.retargetAfterBounce(result.enemy, game.enemies)) continue;
      projectile.alive = false;
    }
    game.projectiles = game.projectiles.filter((p) => p.alive);

    for (const enemy of game.enemies) {
      if (!enemy.alive && enemy.deathFadeT > 0.34) {
        game.gold += enemy.reward * 2;
        enemy.deathFadeT = 0.339;
      }
    }

    for (const effect of game.effects) effect.t -= delta;
    game.effects = game.effects.filter((effect) => effect.t > 0);

    advanceWaveIfDone();
    if (game.baseHp <= 0) game.gameOver = true;
  }

  function drawSpaceBackground(levelMode) {
    const t = game.time;
    const base = levelMode ? "#080f22" : "#060b1a";
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 120; i += 1) {
      const sx = (i * 97 + Math.sin(t * 0.12 + i) * 80 + t * 10 * (1 + (i % 3) * 0.12)) % (canvas.width + 120) - 60;
      const sy = (i * 59 + Math.cos(t * 0.11 + i * 0.5) * 50) % (canvas.height + 100) - 50;
      const r = 0.8 + (i % 3) * 0.6;
      ctx.fillStyle = `rgba(205,225,255,${0.25 + (i % 5) * 0.1})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let n = 0; n < 4; n += 1) {
      const nx = canvas.width * (0.2 + n * 0.22) + Math.sin(t * 0.2 + n) * 30;
      const ny = canvas.height * (0.3 + ((n + 1) % 3) * 0.17) + Math.cos(t * 0.16 + n) * 20;
      const grad = ctx.createRadialGradient(nx, ny, 20, nx, ny, 170);
      grad.addColorStop(0, `rgba(${80 + n * 30},${110 + n * 20},255,0.22)`);
      grad.addColorStop(1, "rgba(30,40,90,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nx, ny, 170, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMenu() {
    drawSpaceBackground(false);
    ctx.fillStyle = "rgba(8,13,35,0.72)";
    ctx.fillRect(250, 100, 700, 440);

    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 52px Arial";
    ctx.fillText("Evil Tower: Earth Core", 285, 175);
    ctx.font = "20px Arial";
    ctx.fillText("Защищай Землю в центре от волн со всех сторон", 335, 215);

    ctx.fillStyle = "#ffd966";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Кристаллы: " + game.waveCurrency, 470, 490);

    for (const button of menuButtons) {
      ctx.fillStyle = button.fill;
      ctx.fillRect(button.x, button.y, button.w, button.h);
      if (game.hoveredButton === button.id) {
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(button.x, button.y, button.w, button.h);
      }
      ctx.fillStyle = "#1e1f24";
      ctx.font = "bold 34px Arial";
      ctx.fillText(button.label, button.x + 74, button.y + 45);
    }
  }

  function drawShop() {
    drawSpaceBackground(false);
    ctx.fillStyle = "rgba(8,13,35,0.78)";
    ctx.fillRect(160, 60, 880, 540);

    ctx.fillStyle = "#ffd966";
    ctx.font = "bold 26px Arial";
    ctx.fillText("Кристаллы: " + game.waveCurrency, 360, 105);

    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 38px Arial";
    ctx.fillText("Магазин", 420, 155);

    const cols = 2, itemW = 340, itemH = 65, gapX = 40, gapY = 16;
    const startX = 200, startY = 190;

    for (let i = 0; i < shopItems.length; i++) {
      const item = shopItems[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ix = startX + col * (itemW + gapX);
      const iy = startY + row * (itemH + gapY);

      const owned = item.max > 1 ? game.shopUpgrades[item.id] : game.shopUpgrades[item.id] ? 1 : 0;
      const maxed = owned >= item.max;
      const canBuy = !maxed && game.waveCurrency >= item.cost;

      ctx.fillStyle = maxed ? "#3a3a3a" : canBuy ? "#2a4a3a" : "#2a2a3a";
      ctx.fillRect(ix, iy, itemW, itemH);
      if (game.hoveredButton === "shop_" + item.id) {
        ctx.strokeStyle = canBuy ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(ix, iy, itemW, itemH);
      }

      ctx.fillStyle = maxed ? "#777" : "#e7eeff";
      ctx.font = "15px Arial";
      ctx.fillText(item.label, ix + 12, iy + 24);

      if (maxed) {
        ctx.fillStyle = "#999";
        ctx.font = "13px Arial";
        ctx.fillText("MAX", ix + itemW - 60, iy + 42);
      } else {
        ctx.fillStyle = "#ffd966";
        ctx.font = "14px Arial";
        ctx.fillText("✦ " + item.cost, ix + 12, iy + 50);
        ctx.fillStyle = "#8af";
        ctx.font = "13px Arial";
        if (item.max > 1) ctx.fillText((owned) + "/" + item.max, ix + itemW - 50, iy + 50);
      }
    }

    // Кнопка назад
    const bx = 420, by = 530, bw = 220, bh = 50;
    const backHover = game.hoveredButton === "shop_back";
    ctx.fillStyle = backHover ? "#5a6a8a" : "#3a4a6a";
    ctx.fillRect(bx, by, bw, bh);
    if (backHover) {
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
    }
    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Назад", bx + 78, by + 33);

    if (game.uiNoticeT > 0 && game.uiNotice) {
      ctx.fillStyle = "rgba(255,230,160,0.9)";
      ctx.font = "17px Arial";
      ctx.fillText(game.uiNotice, 360, 615);
    }
  }

  function drawCoreEarth() {
    const coreSprite = pickCoreSprite();
    if (coreSprite) {
      const size = game.coreRadius * 2.2;
      ctx.drawImage(coreSprite, game.centerX - size / 2, game.centerY - size / 2, size, size);
      return;
    }
    ctx.fillStyle = "#65a6e0";
    ctx.beginPath();
    ctx.arc(game.centerX, game.centerY, game.coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEnemies() {
    for (const enemy of game.enemies) {
      const a = enemyAnimationState(enemy, game.time);
      if (a.deathAlpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = a.deathAlpha;
      const size = enemy.radius * 2;

      if (!enemy.alive && enemy.deathFadeT > 0 && enemy.deathFadeT < 0.34) {
        const splitOffset = (0.35 - enemy.deathFadeT) * 60;
        if (enemy.sprite) {
          const sw = Math.floor(enemy.sprite.width / 2);
          ctx.drawImage(enemy.sprite, 0, 0, sw, enemy.sprite.height,
            enemy.x - size / 2 - splitOffset, enemy.y - size / 2 + a.bob, size / 2, size);
          ctx.drawImage(enemy.sprite, sw, 0, enemy.sprite.width - sw, enemy.sprite.height,
            enemy.x + splitOffset, enemy.y - size / 2 + a.bob, size / 2, size);
        } else {
          ctx.fillStyle = enemy.isBoss ? "#ff7a7a" : enemy.isElite ? "#ffc266" : "#84ffba";
          ctx.beginPath();
          ctx.arc(enemy.x - splitOffset, enemy.y + a.bob, enemy.radius, Math.PI / 2, 3 * Math.PI / 2);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(enemy.x + splitOffset, enemy.y + a.bob, enemy.radius, -Math.PI / 2, Math.PI / 2);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        if (enemy.sprite) {
          ctx.drawImage(enemy.sprite, enemy.x - size / 2, enemy.y - size / 2 + a.bob, size, size);
        } else {
          ctx.fillStyle = enemy.isBoss ? "#ff7a7a" : enemy.isElite ? "#ffc266" : "#84ffba";
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y + a.bob, enemy.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (a.hitAlpha > 0) {
        ctx.fillStyle = `rgba(255,255,255,${a.hitAlpha})`;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y + a.bob, enemy.radius + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const barW = enemy.radius * 2;
      const hpRatio = Math.max(enemy.hp, 0) / enemy.maxHp;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 13, barW, 6);
      ctx.fillStyle = "#5efe76";
      ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 13, barW * hpRatio, 6);
    }
  }

  function drawProjectilesAndEffects() {
    for (const projectile of game.projectiles) {
      const targetRadius = projectile.target?.radius ?? 22;
      const size = Math.max(10, targetRadius * 0.25);
      if (projectile.image) {
        const typedSize = projectile.type.includes("ricochet") ? size * 1.1 : size;
        ctx.drawImage(projectile.image, projectile.x - typedSize / 2, projectile.y - typedSize / 2, typedSize, typedSize);
      } else {
        ctx.fillStyle = projectile.type.includes("explosive") ? "#ff875b" : projectile.type.includes("poison") ? "#6bff63" : "#d5e8ff";
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const effect of game.effects) {
      if (effect.frames && effect.frames.length > 0) {
        const progress = 1 - effect.t / effect.maxT;
        const idx = Math.min(Math.floor(progress * effect.frames.length), effect.frames.length - 1);
        const img = effect.frames[idx];
        if (img) {
          const s = effect.size || 60;
          ctx.globalAlpha = Math.min(1, (effect.t / effect.maxT) * 2);
          ctx.drawImage(img, effect.x - s / 2, effect.y - s / 2, s, s);
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        const maxT = effect.maxT || 0.25;
        const scale = effect.grow ? (1 - effect.t / maxT) : (effect.t / maxT);
        ctx.arc(effect.x, effect.y, effect.r * Math.max(0, scale), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawUpgradePanel() {
    ctx.fillStyle = "rgba(6,12,33,0.86)";
    ctx.fillRect(0, 600, canvas.width, 100);

    for (const button of upgradeButtons) {
      const cost = calcUpgradeCost(game.upgrades, button.id);
      const affordable = canAfford(button.id);
      const activeType =
        game.upgrades.projectileTypes[button.id] || (button.id === "attackSpeed" && game.upgrades.attackSpeedLevel > 0) || (button.id === "damage" && game.upgrades.damageLevel > 0);

      ctx.fillStyle = affordable ? "#385e9a" : "#2b3348";
      if (activeType) ctx.fillStyle = "#2e7f64";
      ctx.fillRect(button.x, button.y, button.w, button.h);
      if (game.hoveredButton === button.id) {
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.w, button.h);
      }

      ctx.fillStyle = "#e7eeff";
      ctx.font = "bold 14px Arial";
      ctx.fillText(button.label, button.x + 8, button.y + 19);
      ctx.font = "12px Arial";
      ctx.fillText(`Цена: ${cost}`, button.x + 8, button.y + 36);
      if (button.id === "attackSpeed") ctx.fillText(`Lv${game.upgrades.attackSpeedLevel}`, button.x + 125, button.y + 36);
      if (button.id === "damage") ctx.fillText(`Lv${game.upgrades.damageLevel}`, button.x + 125, button.y + 36);
      if (["explosive", "poison", "ricochet", "lifesteal"].includes(button.id)) {
        ctx.fillText(`Lv${game.upgrades.evolutionLevel[button.id]}`, button.x + 125, button.y + 36);
      }
    }
  }

  function drawHud() {
    ctx.fillStyle = "rgba(7,15,38,0.75)";
    ctx.fillRect(10, 10, 560, 110);
    ctx.fillStyle = "#deebff";
    ctx.font = "18px Arial";
    const waveText = game.currentWaveIndex < game.waves.length ? `${game.currentWaveIndex + 1}/20` : "20/20";
    ctx.fillText(`Wave: ${waveText}`, 22, 34);
    ctx.fillText(`Base HP: ${Math.max(game.baseHp, 0)}`, 22, 58);
    ctx.fillText(`Gold: ${Math.floor(game.gold)}`, 22, 82);
    const activeTypes = Object.keys(game.upgrades.projectileTypes).filter((t) => game.upgrades.projectileTypes[t]);
    ctx.fillText(`Projectile: ${activeTypes.length > 0 ? activeTypes.join("+") : "normal"}`, 210, 34);
    ctx.fillText(`Enemies: ${game.enemies.filter((e) => e.alive).length}`, 210, 58);

    if (game.waveAnnounceT > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.font = "bold 30px Arial";
      ctx.fillText(`Wave ${game.currentWaveIndex + 1}`, 525, 46);
    }

    if (game.uiNoticeT > 0 && game.uiNotice) {
      ctx.fillStyle = "rgba(255,230,160,0.9)";
      ctx.font = "17px Arial";
      ctx.fillText(game.uiNotice, 22, 106);
    }
  }

  function drawEndOverlay() {
    if (!game.gameOver && !game.win) return;
    ctx.fillStyle = "rgba(5,8,20,0.75)";
    ctx.fillRect(240, 200, 720, 260);
    const centerX = 600;

    const btnX = 470, btnW = 260, btnH = 52;
    const restartY = 235, menuY = 300;
    const restartHover = game.hoveredButton === "restart";
    const menuHover = game.hoveredButton === "toMenu";

    ctx.fillStyle = restartHover ? "#4a7abf" : "#385e9a";
    ctx.fillRect(btnX, restartY, btnW, btnH);
    if (restartHover) {
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(btnX, restartY, btnW, btnH);
    }
    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Начать заново", btnX + 48, restartY + 32);

    ctx.fillStyle = menuHover ? "#bf6b4a" : "#8f4a3a";
    ctx.fillRect(btnX, menuY, btnW, btnH);
    if (menuHover) {
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(btnX, menuY, btnW, btnH);
    }
    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Выйти в меню", btnX + 58, menuY + 32);

    ctx.fillStyle = game.win ? "#8dff89" : "#ff8f8f";
    ctx.font = "bold 46px Arial";
    ctx.textAlign = "center";
    ctx.fillText(game.win ? "Победа" : "Поражение", centerX, 420);
    ctx.textAlign = "start";
  }

  function drawSpeedButton() {
    const bx = 1100, by = 14, bw = 100, bh = 32;
    const hover = game.hoveredButton === "speedToggle";
    const icon = game.speedActive ? "⏩ x2" : "⏩";
    ctx.fillStyle = game.speedUnlocked ? (game.speedActive ? "#3d7a3a" : "#2a4a5a") : "#3a3a5a";
    ctx.fillRect(bx, by, bw, bh);
    if (hover) {
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
    }
    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 15px Arial";
    ctx.fillText(icon, bx + 22, by + 22);
    if (game.insultMode) {
      ctx.fillStyle = "#ff6a4a";
      ctx.font = "bold 13px Arial";
      ctx.fillText("⚡", bx + bw - 20, by + 22);
    }
  }

  function drawSpeedDialog() {
    if (!game.showSpeedDialog) return;
    ctx.fillStyle = "rgba(5,8,20,0.82)";
    ctx.fillRect(280, 180, 640, 220);

    ctx.fillStyle = "#ffd966";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Включить скорость x2 за плюс бал к курсовой?", 600, 235);
    ctx.textAlign = "start";

    const yesHover = game.hoveredButton === "speedYes";
    const noHover = game.hoveredButton === "speedNo";
    const bx = 390, by = 280, bw = 200, bh = 50, gap = 40;

    ctx.fillStyle = yesHover ? "#4a9a5a" : "#2a7a3a";
    ctx.fillRect(bx, by, bw, bh);
    if (yesHover) { ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh); }
    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Хорошо", bx + 56, by + 33);

    ctx.fillStyle = noHover ? "#bf4a4a" : "#8f2a2a";
    ctx.fillRect(bx + bw + gap, by, bw, bh);
    if (noHover) { ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.strokeRect(bx + bw + gap, by, bw, bh); }
    ctx.fillStyle = "#e7eeff";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Обнаглел", bx + bw + gap + 42, by + 33);
  }

  function drawLevel() {
    drawSpaceBackground(true);
    drawCoreEarth();
    drawEnemies();
    drawProjectilesAndEffects();
    drawHud();
    drawUpgradePanel();
    drawEndOverlay();
    drawSpeedButton();
    drawSpeedDialog();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (game.scene === "menu") drawMenu();
    else if (game.scene === "shop") drawShop();
    else drawLevel();
  }

  function handleMenuClick(x, y) {
    const hit = menuButtons.find((button) => x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h);
    if (!hit) return;
    if (hit.id === "play") {
      startLevel();
      return;
    }
    if (hit.id === "shop") {
      game.scene = "shop";
      return;
    }
  }

  function handleShopClick(x, y) {
    // Кнопка назад
    if (x >= 420 && x <= 640 && y >= 530 && y <= 580) {
      game.scene = "menu";
      return;
    }
    const cols = 2, itemW = 340, itemH = 65, gapX = 40, gapY = 16;
    const startX = 200, startY = 190;
    for (let i = 0; i < shopItems.length; i++) {
      const item = shopItems[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ix = startX + col * (itemW + gapX);
      const iy = startY + row * (itemH + gapY);
      if (x < ix || x > ix + itemW || y < iy || y > iy + itemH) continue;

      const owned = item.max > 1 ? game.shopUpgrades[item.id] : game.shopUpgrades[item.id] ? 1 : 0;
      if (owned >= item.max) return;
      if (game.waveCurrency < item.cost) {
        game.uiNotice = "Недостаточно кристаллов";
        game.uiNoticeT = 1.1;
        return;
      }
      game.waveCurrency -= item.cost;
      if (item.max > 1) {
        game.shopUpgrades[item.id] += 1;
      } else {
        game.shopUpgrades[item.id] = true;
      }
      saveToDisk();
      game.uiNotice = item.label + " куплено!";
      game.uiNoticeT = 1.1;
    }
  }

  function handleUpgradeClick(x, y) {
    const hit = upgradeButtons.find((button) => x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h);
    if (!hit) return false;
    const ok = tryBuy(hit.id);
    if (!ok) {
      game.uiNotice = "Недостаточно золота";
      game.uiNoticeT = 1.1;
    }
    return true;
  }

  canvas.addEventListener("mousemove", (event) => {
    const { x, y } = getMousePos(event);
    if (game.scene === "menu") {
      const menuHit = menuButtons.find((button) => x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h);
      game.hoveredButton = menuHit ? menuHit.id : null;
      return;
    }
    if (game.scene === "shop") {
      if (x >= 420 && x <= 640 && y >= 530 && y <= 580) {
        game.hoveredButton = "shop_back";
        return;
      }
      const cols = 2, itemW = 340, itemH = 65, gapX = 40, gapY = 16;
      const startX = 200, startY = 190;
      for (let i = 0; i < shopItems.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ix = startX + col * (itemW + gapX);
        const iy = startY + row * (itemH + gapY);
        if (x >= ix && x <= ix + itemW && y >= iy && y <= iy + itemH) {
          game.hoveredButton = "shop_" + shopItems[i].id;
          return;
        }
      }
      game.hoveredButton = null;
      return;
    }
    if (game.gameOver || game.win) {
      if (x >= 470 && x <= 730 && y >= 235 && y <= 287) { game.hoveredButton = "restart"; return; }
      if (x >= 470 && x <= 730 && y >= 300 && y <= 352) { game.hoveredButton = "toMenu"; return; }
      game.hoveredButton = null;
      return;
    }
    if (game.showSpeedDialog) {
      if (x >= 390 && x <= 590 && y >= 280 && y <= 330) { game.hoveredButton = "speedYes"; return; }
      if (x >= 630 && x <= 830 && y >= 280 && y <= 330) { game.hoveredButton = "speedNo"; return; }
      game.hoveredButton = null;
      return;
    }
    if (x >= 1100 && x <= 1200 && y >= 14 && y <= 46) { game.hoveredButton = "speedToggle"; return; }
    const upHit = upgradeButtons.find((button) => x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h);
    game.hoveredButton = upHit ? upHit.id : null;
  });

  canvas.addEventListener("click", (event) => {
    const { x, y } = getMousePos(event);
    if (game.scene === "menu") {
      handleMenuClick(x, y);
      return;
    }
    if (game.scene === "shop") {
      handleShopClick(x, y);
      return;
    }
    if (game.gameOver || game.win) {
      if (x >= 470 && x <= 730 && y >= 235 && y <= 287) startLevel();
      if (x >= 470 && x <= 730 && y >= 300 && y <= 352) restartToMenu();
      return;
    }
    if (game.showSpeedDialog) {
      if (x >= 390 && x <= 590 && y >= 280 && y <= 330) {
        game.speedUnlocked = true;
        game.speedActive = true;
        game.showSpeedDialog = false;
        return;
      }
      if (x >= 630 && x <= 830 && y >= 280 && y <= 330) {
        game.insultMode = true;
        game.showSpeedDialog = false;
        for (const enemy of game.enemies) {
          enemy.maxHp *= 10;
          enemy.hp *= 10;
          enemy.radius *= 4;
        }
        return;
      }
      return;
    }
    if (x >= 1100 && x <= 1200 && y >= 14 && y <= 46) {
      if (game.speedUnlocked) {
        game.speedActive = !game.speedActive;
      } else {
        game.showSpeedDialog = true;
      }
      return;
    }
    handleUpgradeClick(x, y);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") {
      if (game.scene === "level" && (game.gameOver || game.win)) restartToMenu();
      return;
    }
    if (game.scene !== "level" || game.gameOver || game.win) return;
    if (event.key.toLowerCase() === "q") tryBuy("attackSpeed");
    else if (event.key.toLowerCase() === "w") tryBuy("damage");
    else if (event.key === "1") tryBuy("explosive");
    else if (event.key === "2") tryBuy("poison");
    else if (event.key === "3") tryBuy("ricochet");
    else if (event.key === "4") tryBuy("lifesteal");
  });

  function loop(timestamp) {
    const nowSec = timestamp / 1000;
    const delta = Math.min(0.033, nowSec - game.time || 0.016);
    game.time = nowSec;
    if (game.uiNoticeT > 0) game.uiNoticeT -= delta;
    if (!game.showSpeedDialog) {
      const speed = game.speedActive ? 2 : 1;
      updateGame(delta * speed);
    }
    render();
    requestAnimationFrame(loop);
  }

  loadAssetBundle().then((bundle) => {
    game.assets = bundle;
    game.effectsExplosion = bundle.frameAnimations.explosion || [];
    game.effectsFlash = bundle.frameAnimations.flash || [];
    game.effectsPuff = bundle.frameAnimations.puff || [];
    requestAnimationFrame(loop);
  });
}
