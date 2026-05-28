export class Projectile {
  constructor({ x, y, target, speed, damage, type, image }) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = speed;
    this.damage = damage;
    this.type = type;
    this.image = image;
    this.radius = 10;
    this.alive = true;
    this.bounceLeft = type.includes("ricochet") ? 2 : 0;
  }

  update(delta, enemies) {
    if (!this.alive || !this.target || !this.target.alive) {
      this.alive = false;
      return null;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < this.target.radius * 0.65 + 4) {
      return { hit: true, enemy: this.target };
    }

    const vx = (dx / dist) * this.speed * delta;
    const vy = (dy / dist) * this.speed * delta;
    this.x += vx;
    this.y += vy;

    if (this.x < -20 || this.y < -20 || this.x > 1240 || this.y > 740) {
      this.alive = false;
    }
    return null;
  }

  retargetAfterBounce(fromEnemy, enemies) {
    if (this.bounceLeft <= 0) {
      this.alive = false;
      return false;
    }

    const candidate = enemies
      .filter((e) => e.alive && e !== fromEnemy)
      .sort((a, b) => Math.hypot(a.x - fromEnemy.x, a.y - fromEnemy.y) - Math.hypot(b.x - fromEnemy.x, b.y - fromEnemy.y))[0];

    if (!candidate) {
      this.alive = false;
      return false;
    }

    this.target = candidate;
    this.damage *= 0.72;
    this.bounceLeft -= 1;
    this.x = fromEnemy.x;
    this.y = fromEnemy.y;
    return true;
  }
}
