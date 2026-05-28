import { runEvilTowerGame } from "./evilTowerGame.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

runEvilTowerGame(canvas, ctx);
