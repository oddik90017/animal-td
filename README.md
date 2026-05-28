# 🐾 Animal TD — Tower Defense

Защищай Землю от волн врагов! Башня в центре автоматически стреляет, улучшения покупаются за золото, кристаллы за волны тратятся в магазине.

## ▶️ Запуск через GitHub Pages

Проект работает прямо в браузере:

➡ **https://oddik90017.github.io/animal-td/**

## 💻 Локальный запуск

Проект использует ES-модули (`import`/`export`), поэтому открытие `index.html` через `file://` **не сработает**. Нужен HTTP-сервер.

### Вариант 1 — VS Code + Live Server

1. Установи расширение **Live Server** (Ritwick Dey)
2. Открой папку проекта в VS Code
3. Правый клик на `index.html` → **Open with Live Server**

### Вариант 2 — Python

```bash
python -m http.server 8080
# Открой http://localhost:8080
```

### Вариант 3 — Node.js

```bash
npx serve .
# Открой http://localhost:3000
```

## 🎮 Управление

| Действие | Клавиша |
|---|---|
| Купить скорость атаки | **Q** |
| Купить урон | **W** |
| Купить взрывчатку | **1** |
| Купить яд | **2** |
| Купить рикошет | **3** |
| Рестарт / Выйти в меню | **R** |

Кнопка **⏩** в правом верхнем углу — ускорение x2 (после подтверждения).

## 🛠 Структура

```
index.html          — точка входа
src/
  evilTowerGame.js  — основная логика и рендер
  entities/         — Tower, Enemy, Projectile
  systems/          — combat, upgrade, animation
  data/             — assetManifest, waves
  engine/           — gameState
  ui/               — controls
asets/              — спрайты и графика
styles.css          — стили
```
