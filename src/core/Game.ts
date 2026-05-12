import { SceneRoot } from '../scene/SceneRoot.js';
import { Arena } from '../scene/Arena.js';
import { Skybox } from '../scene/Skybox.js';
import { DeathBurstSystem } from '../fx/DeathBurst.js';
import { ImpactSparksSystem } from '../fx/ImpactSparks.js';
import { CameraShake } from '../fx/CameraShake.js';
import { ExplosionRingSystem } from '../fx/ExplosionRing.js';
import { BossBar } from '../ui/BossBar.js';
import { SfxSystem } from '../audio/SfxSystem.js';
import { loadMeta, saveMeta, computeRunEssence, type MetaData } from '../progression/Meta.js';
import { WEAPON_SPECS } from '../weapon/AutoWeaponSpec.js';
import { ENEMY_TYPES } from '../enemy/EnemyTypes.js';
import { Input } from './Input.js';
import { Time } from './Time.js';
import { PlayerController } from '../player/PlayerController.js';
import { PlayerHealth } from '../player/PlayerHealth.js';
import { ProjectilePool } from '../weapon/Projectile.js';
import { MainGun } from '../weapon/MainGun.js';
import { AutoWeaponManager } from '../weapon/AutoWeaponManager.js';
import { LightningSystem } from '../weapon/LightningSystem.js';
import { PoisonCloudSystem } from '../weapon/PoisonCloud.js';
import { ELEMENT_DATA } from '../weapon/Elements.js';
import { EnemyManager } from '../enemy/EnemyManager.js';
import { EnemyProjectilePool } from '../enemy/EnemyProjectile.js';
import { XpOrbPool } from '../progression/XpOrb.js';
import { PickupSystem } from '../progression/Pickup.js';
import { LevelSystem } from '../progression/LevelSystem.js';
import { pickThree } from '../progression/UpgradeCards.js';
import { Hud } from '../ui/Hud.js';
import { UpgradePanel } from '../ui/UpgradePanel.js';
import { PausePanel } from '../ui/PausePanel.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import type { UpgradeCard } from '../progression/UpgradeCards.js';

export class Game {
  readonly root: SceneRoot;
  private arena: Arena;
  private input: Input;
  readonly time = new Time();
  readonly player: PlayerController;
  readonly health = new PlayerHealth();
  readonly projectiles: ProjectilePool;
  readonly gun: MainGun;
  readonly weapons: AutoWeaponManager;
  readonly enemies: EnemyManager;
  readonly enemyProjectiles: EnemyProjectilePool;
  readonly xpOrbs: XpOrbPool;
  readonly pickups: PickupSystem;
  readonly lightning: LightningSystem;
  readonly poison: PoisonCloudSystem;
  readonly deathBursts: DeathBurstSystem;
  readonly impactSparks: ImpactSparksSystem;
  readonly explosionRings: ExplosionRingSystem;
  readonly cameraShake = new CameraShake();
  readonly sfx = new SfxSystem();
  private bossBar: BossBar;
  readonly level = new LevelSystem();
  lightningChance = 0;
  lightningStormChance = 0;
  chainArcChance = 0;
  xpBonusPerOrb = 0;
  private hud: Hud;
  private upgradePanel: UpgradePanel;
  private pausePanel: PausePanel;
  private inventoryPanel: InventoryPanel;
  readonly pickedCards = new Map<string, { card: UpgradeCard; count: number }>();
  private dead = false;
  private paused = false;
  private pauseSource: 'upgrade' | 'esc' | null = null;
  private gameTime = 0;

  constructor(mount: HTMLElement, hint: HTMLElement) {
    this.root = new SceneRoot(mount);
    new Skybox(this.root.scene);
    this.arena = new Arena(80);
    this.root.scene.add(this.arena.group);
    this.root.scene.add(this.root.camera);

    // Wrap spawn around obstacles (push player out of any pillar it overlaps).
    // resolveCircle runs anyway each frame via PlayerController.

    this.input = new Input(this.root.renderer.domElement, hint);
    this.player = new PlayerController(this.root.camera, this.input);
    this.projectiles = new ProjectilePool(this.root.scene);
    this.gun = new MainGun(this.root.camera, this.projectiles, this.input, '/assets/arms/basegun_a.glb');
    this.gun.onFire = () => this.sfx.gunshot();
    this.weapons = new AutoWeaponManager(this.root.scene);
    this.weapons.onWeaponAdded = (w) => { w.onFire = () => this.sfx.autoFire(); };
    this.enemies = new EnemyManager(this.root.scene, this.arena.size, this.arena);
    this.enemyProjectiles = new EnemyProjectilePool(this.root.scene);
    this.enemies.onBossSpawn = () => this.bossBar.flashWarning();
    this.enemies.onRusherBeep = (urgencyK) => this.sfx.rusherBeep(urgencyK);
    this.enemies.onRusherContact = (pos) => {
      this.deathBursts.burst(pos, [1.0, 0.4, 0.1]);
      this.impactSparks.burst(pos, [1.0, 0.85, 0.4], 20);
      this.impactSparks.burst(pos, [1.0, 0.3, 0.1], 14);
      this.sfx.rusherBoom();
      this.cameraShake.trigger(0.15, 0.15);
    };
    this.enemies.onEnemyExplosion = ({ pos, radius, damage }) => {
      const dx = this.player.position.x - pos.x;
      const dz = this.player.position.z - pos.z;
      const playerDist = Math.hypot(dx, dz);
      if (playerDist < radius) {
        this.health.takeDamage(damage);
        this.hud.flashHit();
        this.sfx.playerHit();
        if (this.health.dead) this.handleDeath();
      }
      this.explosionRings.spawn(pos, radius, 0xff7722);
      this.deathBursts.burst(pos, [1.0, 0.5, 0.1]);
      this.impactSparks.burst(pos, [1.0, 0.7, 0.2], 18);
      this.impactSparks.burst(pos, [1.0, 0.35, 0.08], 12);
      this.sfx.bomberBoom();
      if (playerDist < radius) {
        this.cameraShake.trigger(0.28, 0.22);
      } else if (playerDist < radius * 1.8) {
        this.cameraShake.trigger(0.15, 0.08);
      }
    };
    this.enemies.onRangedFire = (data, origin, dir) => {
      if (!data.ranged) return;
      this.enemyProjectiles.spawn(
        origin, dir,
        data.ranged.projectileSpeed,
        data.ranged.projectileDamage * this.enemies.rangedDamageMul,
        data.ranged.projectileColor,
        data.ranged.projectileSize,
      );
    };
    this.xpOrbs = new XpOrbPool(this.root.scene);
    this.pickups = new PickupSystem(this.root.scene);
    this.lightning = new LightningSystem(this.root.scene);
    this.poison = new PoisonCloudSystem(this.root.scene);
    this.deathBursts = new DeathBurstSystem(this.root.scene);
    this.impactSparks = new ImpactSparksSystem(this.root.scene);
    this.explosionRings = new ExplosionRingSystem(this.root.scene);
    this.hud = new Hud(document.body);
    this.bossBar = new BossBar(document.body);
    this.upgradePanel = new UpgradePanel(document.body);
    this.pausePanel = new PausePanel(document.body);
    this.inventoryPanel = new InventoryPanel(document.body);

    this.input.onEscape = () => this.togglePause();
    this.input.onStart = () => this.sfx.init();
    this.input.onTabDown = () => {
      if (!this.paused && !this.dead) this.inventoryPanel.show(this.pickedCards);
    };
    this.input.onTabUp = () => this.inventoryPanel.hide();
  }

  private togglePause(): void {
    if (this.dead) return;
    if (this.pauseSource === 'upgrade') return; // upgrade panel is its own pause
    if (this.paused && this.pauseSource === 'esc') {
      this.resumeFromPause();
    } else if (!this.paused) {
      this.paused = true;
      this.pauseSource = 'esc';
      this.inventoryPanel.hide();
      document.exitPointerLock?.();
      this.pausePanel.show(() => this.resumeFromPause());
    }
  }

  private resumeFromPause(): void {
    this.pausePanel.hide();
    this.paused = false;
    this.pauseSource = null;
    this.input.requestLock();
  }

  start(): void {
    const loop = () => {
      this.time.tick();
      const dt = this.time.delta;

      if (this.input.started && !this.dead && !this.paused) {
        this.gameTime += dt;
        this.player.update(dt, this.arena.size, this.arena);
        this.gun.update(dt, this.root.camera);
        this.weapons.update(dt, this.player.position, this.player.yaw, this.enemies, this.projectiles);
        this.projectiles.update(dt, (pos) => {
          const n = this.enemies.findNearestEnemy(pos);
          return n ? n.root.position : null;
        });
        this.enemies.update(
          dt,
          this.player.position,
          this.projectiles,
          (dmg) => {
            this.health.takeDamage(dmg);
            this.hud.flashHit();
            this.sfx.playerHit();
            if (this.health.dead) this.handleDeath();
          },
          (pos, type) => {
            const drop = this.enemies.xpDropsFor(type);
            for (let i = 0; i < drop.count; i++) this.xpOrbs.spawn(pos, drop.tier);
            this.deathBursts.burst(pos);
            this.sfx.enemyDeath();
            const td = ENEMY_TYPES[type];
            if (td.heartDropChance && Math.random() < td.heartDropChance) {
              this.pickups.spawn('heart', pos);
              this.deathBursts.burst(pos, [1.0, 0.3, 0.35]);
            }
            if (td.chestDropChance && Math.random() < td.chestDropChance) {
              this.pickups.spawn('chest', pos);
              this.deathBursts.burst(pos, [1.0, 0.75, 0.2]);
            }
          },
          (pos) => {
            this.impactSparks.burst(pos);
            if (this.lightningChance > 0 && Math.random() < this.lightningChance) {
              this.lightning.strike(pos);
              this.sfx.lightning();
            }
            if (this.lightningStormChance > 0 && Math.random() < this.lightningStormChance) {
              this.lightning.storm(pos);
              this.sfx.lightning();
            }
            if (this.chainArcChance > 0 && Math.random() < this.chainArcChance) {
              const chain = this.enemies.findChainTargets(pos, 3, 6);
              if (chain.length > 0) {
                this.lightning.chain(pos, chain, 18);
                this.sfx.lightning();
              }
            }
          },
          (elements, enemy, hitPos) => {
            for (const { element, tier } of elements) {
              const t = ELEMENT_DATA[element].tiers[tier - 1];
              if (element === 'fire' && t.burnDps && t.burnDuration) {
                enemy.applyBurn(t.burnDps, t.burnDuration);
                this.impactSparks.burst(hitPos, [1.0, 0.5, 0.1], 4);
              } else if (element === 'ice' && t.slowMul && t.slowDuration) {
                enemy.applySlow(t.slowMul, t.slowDuration);
                this.impactSparks.burst(hitPos, [0.5, 0.9, 1.0], 4);
              } else if (element === 'poison' && t.cloudRadius && t.cloudDps && t.cloudDuration) {
                this.poison.spawn(hitPos, t.cloudRadius, t.cloudDps, t.cloudDuration);
                this.impactSparks.burst(hitPos, [0.4, 1.0, 0.3], 4);
              } else if (element === 'lightning' && t.chainTargets && t.chainDamage) {
                const targets = this.enemies.findChainTargets(hitPos, t.chainTargets, 6);
                if (targets.length > 0) {
                  this.lightning.chain(hitPos, targets, t.chainDamage);
                  this.sfx.lightning();
                }
                this.impactSparks.burst(hitPos, [0.85, 0.7, 1.0], 4);
              }
            }
          },
        );
        this.health.update(dt);
        this.lightning.update(dt, this.enemies.enemies);
        this.poison.update(dt, this.enemies.enemies);
        this.enemyProjectiles.update(dt, this.player.position, (dmg) => {
          this.health.takeDamage(dmg);
          this.hud.flashHit();
          this.sfx.playerHit();
          if (this.health.dead) this.handleDeath();
        });
        this.deathBursts.update(dt);
        this.impactSparks.update(dt);
        this.explosionRings.update(dt);
        const boss = this.enemies.enemies.find((e) => e.alive && ENEMY_TYPES[e.type].boss) ?? null;
        this.bossBar.update(boss);
        this.pickups.update(dt, this.player.position, (kind) => {
          if (kind === 'heart') {
            this.health.heal(25);
            this.sfx.heartPickup();
          } else if (kind === 'chest') {
            this.sfx.chestOpen();
            this.level.pendingLevelUps += 1;
            this.showUpgrade();
          }
        });
        this.xpOrbs.update(dt, this.player.position, (value) => {
          this.level.addXp(value + this.xpBonusPerOrb);
          this.sfx.pickup();
          if (this.level.pendingLevelUps > 0) {
            this.sfx.levelUp();
            this.showUpgrade();
          }
        });
        this.hud.update(this.health, this.enemies, this.level, this.gameTime, dt);
        this.cameraShake.apply(dt, this.root.camera);
      }

      this.root.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private showUpgrade(): void {
    if (!this.level.consumeLevelUp()) return;
    this.paused = true;
    this.pauseSource = 'upgrade';
    document.exitPointerLock?.();
    const cards = pickThree(this);
    this.upgradePanel.show(cards, (card) => {
      card.apply(this);
      const entry = this.pickedCards.get(card.id);
      if (entry) entry.count += 1;
      else this.pickedCards.set(card.id, { card, count: 1 });
      this.upgradePanel.hide();
      if (this.level.pendingLevelUps > 0) {
        this.showUpgrade();
      } else {
        this.paused = false;
        this.pauseSource = null;
        this.input.requestLock();
      }
    });
  }

  applyMetaUpgrades(meta: MetaData): void {
    const lv = meta.upgrades;
    if (lv.hp > 0) {
      const bonus = 15 * lv.hp;
      this.health.max += bonus;
      this.health.hp = this.health.max;
    }
    if (lv.damage > 0) {
      this.projectiles.damage += 3 * lv.damage;
    }
    if (lv.xp > 0) {
      this.xpBonusPerOrb = lv.xp;
    }
    if (lv.weapon > 0) {
      const spec = WEAPON_SPECS[Math.floor(Math.random() * WEAPON_SPECS.length)];
      this.weapons.addWeapon(spec);
    }
  }

  private handleDeath(): void {
    this.dead = true;
    const meta = loadMeta();
    const earned = computeRunEssence(this.enemies.kills, this.level.level, this.gameTime);
    const prevBestTime = meta.bestTimeSec;
    const prevBestKills = meta.bestKills;
    meta.essence += earned;
    meta.runsCompleted += 1;
    meta.bestTimeSec = Math.max(meta.bestTimeSec, this.gameTime);
    meta.bestKills = Math.max(meta.bestKills, this.enemies.kills);
    saveMeta(meta);
    this.hud.showGameOver({
      kills: this.enemies.kills,
      elapsed: this.gameTime,
      level: this.level.level,
      essenceEarned: earned,
      meta,
      weapons: this.weapons,
      pickedCards: this.pickedCards,
      prevBestTime,
      prevBestKills,
    });
    document.exitPointerLock?.();
  }
}
