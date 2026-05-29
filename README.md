# 🐾 Animal TD — Tower Defense

Защищай Землю от волн врагов! Башня в центре автоматически стреляет.
Улучшения покупаются за золото, кристаллы за волны тратятся в магазине.
Доступно ускорение x2 и режим «Обнаглел» (враги ×10 HP, ×4 размер).

## ▶️ GitHub Pages

➡ **https://oddik90017.github.io/animal-td/**

## 💻 Локальный запуск

Проект использует ES-модули — нужен HTTP-сервер (открытие `index.html` через `file://` не сработает).

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Или открой папку в VS Code → ПКМ на `index.html` → **Open with Live Server**.

## 🎮 Управление

| Клавиша | Действие |
|---|---|
| **Q** | Купить скорость атаки |
| **W** | Купить урон |
| **1** | Купить взрывчатку |
| **2** | Купить яд |
| **3** | Купить рикошет |
| **4** | Купить вампиризм |
| **R** | Рестарт / Выйти в меню |

Кнопка **⏩** (правый верхний угол) — ускорение x2.
В диалоге **«Обнаглел»** — враги получают ×10 HP и ×4 размер до конца попытки.

## 🛠 Структура

```
index.html              — точка входа
src/
  evilTowerGame.js      — основная логика и рендер
  entities/tower.js     — башня (стрельба, урон)
  entities/enemy.js     — враги (HP, poison, смерть)
  entities/projectile.js — снаряды
  systems/combatSystem.js — взрыв, яд, рикошет, вампиризм
  systems/upgradeSystem.js — улучшения и цены
  systems/animationSystem.js — анимации врагов
  data/assetManifest.js — пути к спрайтам
  data/waves.js         — волны и статы врагов
asets/                  — спрайты (Kenney Asset Pack)
styles.css              — стили
```
