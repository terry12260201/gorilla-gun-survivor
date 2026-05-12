import { Game } from './core/Game.js';
import { MetaMenu } from './ui/MetaMenu.js';
import { loadMeta } from './progression/Meta.js';

const mount = document.getElementById('app');
const hint = document.getElementById('lock-hint');
if (!mount || !hint) throw new Error('missing #app or #lock-hint');

const game = new Game(mount, hint);
game.start();

hint.classList.add('hidden');
const menu = new MetaMenu(document.body);
menu.show(loadMeta(), () => {
  game.applyMetaUpgrades(loadMeta());
  hint.classList.remove('hidden');
});

// debug handle
(window as unknown as { __game: Game }).__game = game;
