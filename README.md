# Dungeon Delver

A 20-floor Atari-style d20 dungeon crawl. Fight monsters, solve room puzzles, spend scarce gold on upgrades, and claim the Orb of Tarmin.

**Play online:** https://iliarose.github.io/dungeon-delver/

## How to play

1. Open the game and pick a hero (or run Training first).
2. Explore each floor, clear monsters, and open side rooms for chests and gold.
3. Spend gold on upgrades between floors — you will not afford everything.
4. Reach floor 20, defeat the Shadow King, and step on the Orb to win.

Progress is saved in the browser after every floor (localStorage). Use **Continue** on the title screen to resume.

## Controls

### Keyboard

| Key | Action |
| --- | --- |
| Arrow keys / WASD | Move |
| Space / Enter | Act (bump / interact) |
| 1–9 | Cast a spell / use a card |
| E | Potion |
| Q / `.` | Wait a turn |
| B / I | Inventory |
| U | Upgrades |
| Esc | Back / title |
| Tab / G | Guide / hints (where available) |

### Touch

- On-screen D-pad to move
- **ACT**, **Spell**, **Potion**, **Wait** buttons
- Menu buttons below / beside the canvas for title, death, upgrades, and inventory

The layout flips between landscape (controls on the sides) and portrait (controls under the canvas).

## Heroes

- **Fighter** — durable melee, cleave and guard cards
- **Wizard** — fireball, frost, chain and mend; mana-limited spells
- **Rogue** — daggers, high aim, critical strikes

## The 20 floors

| Floors | Theme | Notes |
| --- | --- | --- |
| 1–4 | Dungeon | Warm stone, early monsters |
| 5–10 | Crypt | Purple halls; Dragon (5), Minotaur (8), Lich King mid-boss (10) |
| 11–15 | Ice caves | Frost Trolls and Stone Golems; Pit Demon mini-boss (15) |
| 16–20 | Ember depths | Fire Imps; Minotaur (18); Shadow King + Orb (20) |

Side rooms appear from floor 3 onward: push-block puzzles, dark rooms (light the braziers), vaults, enchant booths, and **color-wired lever rooms** (stand in front of one lever to pull it, or between two to pull both).

Gold is scarce by design — a full run affords roughly 35–45% of all upgrade tiers. Choose carefully.

## Rebuild from source

```bash
cd src
npm install
npm run build
```

That type-checks the game, bundles a minified `assets/game.js`, and rewrites `index.html`. The game imports a tiny local `shim.ts` instead of `grok/canvas`, so there is no runtime dependency on the Grok canvas host.

## Deploy (GitHub Pages)

This folder is the site root. Push it to the `gh-pages` branch (or enable Pages on the `main` branch root / `/docs`). Include `.nojekyll` so GitHub serves `assets/` as-is.

## License

Personal / hobby project. Pixel art and code authored for Dungeon Delver.
