import { useRef, useEffect, useState, useGrokTheme } from "./shim";
import type { PointerEvent, KeyboardEvent, CSSProperties } from "./shim";

type Any = any;
type Cv = HTMLCanvasElement;
type Ctx = CanvasRenderingContext2D;
const mem: Record<string, string> = {};
const LS = {
  get(k: string): string | null { try { const v = window.localStorage.getItem(k); return v === null ? (mem[k] ?? null) : v; } catch { return mem[k] ?? null; } },
  set(k: string, v: string): void { mem[k] = v; try { window.localStorage.setItem(k, v); } catch { /* memory only */ } },
  del(k: string): void { delete mem[k]; try { window.localStorage.removeItem(k); } catch { /* memory only */ } },
};

const PC: Record<string, string> = { k: "#2a1a1f", x: "#1a1018", s: "#f2c49b", S: "#c98b6b", w: "#eef3f6", g: "#a7b4c0", G: "#6a7a8c", n: "#3e4a5c", r: "#e0583c", R: "#9c2f2f", y: "#ffd84a", Y: "#e0a030", o: "#b8661f", b: "#7fd0f0", B: "#3b7fc4", N: "#2a4a8c", p: "#b88ae0", P: "#6e4a9e", q: "#3f2a66", l: "#a6e06a", L: "#6ab04c", m: "#3f7a3a", M: "#24502c", h: "#c99058", H: "#8a5a32", j: "#5a3a22", W: "#fff6e0", t: "#6be0cf", T: "#2a8f8a", e: "#f1e8d2", E: "#b9ae94", f: "#ff9a3c", F: "#e05a20", c: "#e0583c", C: "#9c2f2f" };

const ART: Record<string, string[]> = {
  fighter: ["................", "......GGG.......", ".....GwwgG....w.", ".....GgggG....w.", ".....GnnnG....g.", ".....GssSG....g.", "...RRGggGGRR..g.", "..BBBgwgggGR.yYy", "..BbBgwgggGs..o.", "..BbyBgggGG.....", "..BbBRRrRRR.....", "..BBBgggggG.....", "...B.gG..gG.....", ".....gG..gG.....", "....jjH..jjH....", "................"],
  wizard: [".......P........", "......PpP...t...", "......PpP..tWt..", ".....PppPP..t...", "....PPpppPP.H...", "...yyyyyyyyyH...", ".....sxsxs..H...", ".....sssss..H...", ".....eEEEe.sH...", "....PpeEePPpH...", "...PppPeppPPH...", "...PpppPpppPH...", "...PPpppppPPH...", "...PPPPPPPPPH...", "....jj...jj.H...", "................"],
  rogue: ["................", "......MMM.......", ".....MmmmM......", "....MmLLmmM.....", "....MmxsxmM.....", "....MmsssmM.....", "....MMmSmMM.....", "...jHHMMMHHj....", "..sjHhHHHhHjs...", "..s.jHhhhHj.sw..", "....jHHyHHj.Gw..", "....jHHHHHj..w..", ".....HH.HH......", ".....HH.HH......", "....jjj.jjj.....", "................"],
  gob: ["................", "................", "................", ".L....LLL....L..", ".LL..LlllL..LL..", "..LLLlrllrLLL...", "....LlllllL.....", "....LlWWWlL..H..", ".....LLLLL..Hh..", "...jjLhhhLjjH...", "..Ll.jhhhj.lL...", "....jhhhhhj.....", ".....LL.LL......", ".....LL.LL......", "....MM...MM.....", "................"],
  skel: ["................", ".....eeeee......", "....eWWWWWe.....", "....eWxWxWe.....", "....eWWWWWe.....", ".....eWeWe......", "......eEe.......", "...eeeeeeeee....", "..e..eEeEe..e...", "..e..eeeee..e...", ".....eEeEe......", "......eee.......", ".....e...e......", ".....e...e......", "....ee...ee.....", "................"],
  orc: ["................", ".....mmmmm......", "....mLLLLLm.....", "...mLrLLLrLm....", "...mLLLLLLLm..G.", "...mLWLLLWLm.Ggw", "....mmLLLmm..Ggw", "..jjHmmmmmHjj.H.", ".mLjHhhhhhHjLmH.", ".mL.jhhhhhj.LmH.", ".mm.jHHHHHj.mm..", "....jhhohhj.....", "....LLm.mLL.....", "....LLm.mLL.....", "...jjj...jjj....", "................"],
  drag: ["................", ".R..........R...", ".RR..rrrr..RR...", ".RrR.rrxrr.RrR..", ".RrrRrrrrrRrrR..", "..RrrRryyfRrR...", "...RRrrrrrrR....", "....rFFFFrrr....", "...rrFyFyFrrr...", "..rrrFFFFFrrrr..", "..r.rrFFFrrr.r..", ".....rrrrrr.....", "....rr.rr.rr....", "....RR.RR.RR....", "...yy..yy..yy...", "................"],
  pot: ["", "", "......jjjj......", "......HhhH......", ".......ee.......", ".......We.......", "......eWWe......", ".....eRrrRe.....", "....eRrWrrRe....", "....eRrrrrRe....", "....eRrrrrRe....", ".....eRRRRe.....", "......eeee......"],
  key: ["", "", "", "", "...ccc..........", "..cWccc.........", "..cc.cccccccccc.", "..ccccc...C.C.C.", "...CCC.........."],
  gold: ["", "", "", "", "", "", ".......yy.......", ".....yyWyy......", "....yYyyyYy.....", "...yyyWyYyyy....", "..yYyyyyyyyYy...", "..YyYYyYYyYYo...", "...ooooooooo...."],
  orb: ["", "", "......bbbb......", "....bbWWbbbb....", "...bbWWbbbbbB...", "...bWbbbtbbbB...", "..bbbbbtttbbBB..", "..bbbbbbtbbbBB..", "..BbbbbbbbbBBB..", "...BBbbbbBBBB...", "....BBBBBBBB....", ".....yyyyyy.....", "....YyyyyyyY....", "....oooooooo...."],
  sword: ["", "............ww..", "...........wgw..", "..........wgw...", ".........wgw....", "........wgw.....", ".......wgw......", "...yy.wgw.......", "....yygw........", "....oyy.........", "...jo.yy........", "..jj....y.......", ".jj............."],
  fire: ["", "", ".......f........", "......ffy.......", "......fyf.......", ".....ffyff......", "....ffyWyff.....", "...ffyWWWyff....", "...fFyWWyyFf....", "...FfyyyyfFF....", "....FFffffF.....", ".....FFFFF......"],
  shield: ["", "", "...BBBBBBBBBB...", "...BbbbyybbbB...", "...BbbbyybbbB...", "...ByyyyyyyyB...", "...BbbbyybbbB...", "....BbbyybbB....", ".....BbyybB.....", "......BbbB......", ".......BB......."],
  hour: ["", "", "....hhhhhhh.....", ".....eWWWe......", ".....eyyye......", "......eye.......", ".......y........", "......e.e.......", ".....e.y.e......", ".....eyyye......", "....hhhhhhh....."],
  coin: ["", "", "", "", "......yyy.......", ".....yWyyY......", ".....yyYyY......", ".....yyyyY......", "......YYY......."],
};
const KEYC = [{ c: "#e0583c", C: "#9c2f2f" }, { c: "#5aa8e8", C: "#2a5a9c" }, { c: "#ffd84a", C: "#b8801f" }];
const DOORC = [["#d9533b", "#8c2a2a", "#f08a6a"], ["#4f9be0", "#2a5a9c", "#9fd8f8"], ["#f0c23b", "#a8761c", "#ffe88a"]];
const KNAME = ["RED", "BLUE", "YELLOW"];
const THEMES = [
  { f: ["#a8743f", "#b98349", "#8f5f32", "#6f4526"], w: ["#9a8f86", "#c4b9aa", "#6e6470", "#463c56"], deco: 0 },
  { f: ["#767c8a", "#8a909e", "#626775", "#4a4e5e"], w: ["#646b80", "#949cb2", "#454a62", "#2a2d44"], deco: 1 },
  { f: ["#53406a", "#634e7c", "#463659", "#33274a"], w: ["#4a3373", "#7a5aae", "#33245a", "#1c1236"], deco: 2 },
  { f: ["#6f93a8", "#86aabd", "#5a7d92", "#3f5f74"], w: ["#8fb8cc", "#cfe8f2", "#5a7f99", "#2f4a63"], deco: 1 },
  { f: ["#6a3a30", "#7c463a", "#542c26", "#3a1c1a"], w: ["#5a2a2a", "#8a4a3a", "#3a1a1c", "#1c0c10"], deco: 2 },
];

function mkCv(w: number, h: number): Cv { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function cx(c: Cv): Ctx { return c.getContext("2d") as Ctx; }
function rows16(rows: string[]): string[] { const r: string[] = []; for (let j = 0; j < 16; j++) r.push(((rows[j] || "") + "................").slice(0, 16)); return r; }
function buildSprite(src: string[], sub?: Record<string, string>): Cv {
  const rows = rows16(src); const c = mkCv(16, 16); const x = cx(c);
  const op = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < 16 && j < 16 && rows[j][i] !== ".";
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
    const ch = rows[j][i];
    if (ch !== ".") { x.fillStyle = (sub && sub[ch]) || PC[ch] || "#f0f"; x.fillRect(i, j, 1, 1); }
    else if (op(i - 1, j) || op(i + 1, j) || op(i, j - 1) || op(i, j + 1)) { x.fillStyle = PC.k; x.fillRect(i, j, 1, 1); }
  }
  return c;
}
function frames(src: string[], sub?: Record<string, string>): Cv[] {
  const r = rows16(src); const bob = [r[0]].concat(r.slice(0, 10)).concat(r.slice(11));
  return [buildSprite(r, sub), buildSprite(bob, sub)];
}
function rng(seed: number): () => number { let a = seed >>> 0; return (): number => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function px(x: Ctx, c: string, i: number, j: number, w = 1, h = 1): void { x.fillStyle = c; x.fillRect(i, j, w, h); }
function buildTheme(th: Any, ti: number): Any {
  const R = rng(ti * 977 + 13);
  const floor: Cv[] = [];
  for (let v = 0; v < 8; v++) {
    const c = mkCv(16, 16), x = cx(c);
    px(x, th.f[0], 0, 0, 16, 16);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const r = R(); if (r < 0.1) px(x, th.f[1], i, j); else if (r < 0.2) px(x, th.f[2], i, j); else if (r < 0.23 && (i + j) % 2 === 0) px(x, th.f[3], i, j); }
    x.globalAlpha = 0.45; px(x, th.f[3], 0, 15, 16, 1); px(x, th.f[3], 15, 0, 1, 16); x.globalAlpha = 1;
    if (v === 1 || v === 7) { let a = 3 + Math.floor(R() * 8), b = 3 + Math.floor(R() * 6); for (let k = 0; k < 6; k++) { px(x, th.f[3], a, b); a += R() < 0.5 ? 1 : 0; b += 1; } }
    if (v === 2 || v === 5) { const a = 2 + Math.floor(R() * 10), b = 2 + Math.floor(R() * 10); px(x, th.w[2], a, b + 1, 3, 2); px(x, th.w[0], a, b, 3, 2); px(x, th.w[1], a, b, 1, 1); px(x, th.f[3], a, b + 2, 3, 1); }
    if (th.deco === 0 && (v === 3 || v === 4)) { for (let k = 0; k < 2; k++) { const a = 2 + Math.floor(R() * 11), b = 4 + Math.floor(R() * 9); px(x, PC.m, a, b + 2, 3, 1); px(x, PC.L, a, b, 1, 2); px(x, PC.l, a + 1, b - 1, 1, 3); px(x, PC.L, a + 2, b + 1, 1, 1); } }
    if (th.deco === 0 && v === 6) { const fl = [["#f4a3b5", "#ffd84a"], ["#fff6e0", "#e0a030"]]; for (let k = 0; k < 2; k++) { const a = 3 + Math.floor(R() * 9), b = 3 + Math.floor(R() * 9), q = fl[k]; px(x, PC.L, a + 1, b + 2, 1, 2); px(x, q[0], a, b + 1); px(x, q[0], a + 2, b + 1); px(x, q[0], a + 1, b); px(x, q[0], a + 1, b + 2); px(x, q[1], a + 1, b + 1); } }
    if (th.deco === 1 && (v === 3 || v === 6)) { for (let k = 0; k < 3; k++) { const a = 1 + Math.floor(R() * 13), b = 1 + Math.floor(R() * 13); px(x, th.w[2], a, b, 2, 1); px(x, th.w[1], a, b - 1 < 0 ? 0 : b - 1, 1, 1); } }
    if (th.deco === 2 && (v === 3 || v === 6)) { const a = 4 + Math.floor(R() * 8), b = 5 + Math.floor(R() * 6); px(x, PC.k, a - 1, b - 3, 5, 7); px(x, PC.T, a, b - 2, 3, 6); px(x, PC.t, a + 1, b - 3, 1, 6); px(x, PC.W, a + 1, b - 2, 1, 1); }
    floor.push(c);
  }
  const wallFace: Cv[] = [];
  for (let v = 0; v < 3; v++) {
    const c = mkCv(16, 16), x = cx(c);
    px(x, th.w[0], 0, 0, 16, 16); px(x, th.w[1], 0, 0, 16, 3); px(x, th.w[0], 0, 3, 16, 1);
    for (let b = 4; b < 15; b += 5) {
      px(x, th.w[3], 0, b, 16, 1);
      const off = ((b / 5) | 0) % 2 === 0 ? [4, 12] : [0, 8];
      for (const o of off) px(x, th.w[3], o, b, 1, 5);
      x.globalAlpha = 0.6; px(x, th.w[1], 0, b + 1, 16, 1); x.globalAlpha = 1; px(x, th.w[2], 0, b + 4 > 14 ? 14 : b + 4, 16, 1);
    }
    for (let k = 0; k < 14; k++) px(x, R() < 0.5 ? th.w[2] : th.w[1], Math.floor(R() * 16), 4 + Math.floor(R() * 10));
    px(x, th.w[3], 0, 15, 16, 1);
    if (th.deco === 0 && v === 1) for (let k = 0; k < 7; k++) px(x, k % 2 ? PC.L : PC.m, 1 + Math.floor(R() * 14), 2 + Math.floor(R() * 3));
    if (th.deco === 2 && v === 2) { px(x, PC.T, 6, 6, 2, 4); px(x, PC.t, 7, 5, 1, 4); }
    wallFace.push(c);
  }
  const wallTop: Cv[] = [];
  for (let v = 0; v < 3; v++) {
    const c = mkCv(16, 16), x = cx(c); px(x, th.w[3], 0, 0, 16, 16);
    for (let k = 0; k < 40; k++) px(x, R() < 0.7 ? th.w[2] : th.w[0], Math.floor(R() * 16), Math.floor(R() * 16));
    wallTop.push(c);
  }
  const door: Cv[] = DOORC.map((dc: string[]): Cv => {
    const c = mkCv(16, 16), x = cx(c); x.drawImage(wallFace[0], 0, 0);
    px(x, PC.k, 2, 1, 12, 15); px(x, dc[0], 3, 2, 10, 14); px(x, dc[2], 4, 2, 1, 14);
    for (const o of [6, 9]) px(x, dc[1], o, 2, 1, 14);
    px(x, "#3e4a5c", 3, 5, 10, 1); px(x, "#3e4a5c", 3, 12, 10, 1);
    px(x, PC.y, 10, 8, 2, 3); px(x, PC.o, 11, 9, 1, 1);
    return c;
  });
  const stair = mkCv(16, 16); { const x = cx(stair); x.drawImage(floor[0], 0, 0); px(x, PC.k, 1, 1, 14, 14); px(x, "#1a1018", 2, 2, 12, 12); px(x, th.w[1], 2, 2, 12, 1); px(x, th.f[1], 3, 4, 10, 2); px(x, th.f[0], 4, 7, 8, 2); px(x, th.f[2], 5, 10, 6, 2); px(x, th.f[3], 6, 12, 4, 1); }
  return { floor, wallFace, wallTop, door, stair };
}

const CL = [
  { n: "FIGHTER", hp: 30, atk: 5, ac: 16, dmg: 10, crit: 20, spell: 0, sp: "BRACE", art: "fighter" },
  { n: "WIZARD", hp: 22, atk: 3, ac: 11, dmg: 10, crit: 20, spell: 1, sp: "FIREBALL", art: "wizard" },
  { n: "ROGUE", hp: 20, atk: 6, ac: 13, dmg: 8, crit: 18, spell: 0, sp: "CRIT 18+", art: "rogue" },
];
const MON: Record<string, Any> = {
  gob: { n: "GOBLIN", hp: 6, atk: 2, ac: 11, dmg: 5, xp: 5 },
  skel: { n: "SKELETON", hp: 10, atk: 3, ac: 12, dmg: 6, xp: 8 },
  orc: { n: "ORC", hp: 16, atk: 4, ac: 13, dmg: 8, xp: 12 },
  mage: { n: "DARK MAGE", hp: 12, atk: 5, ac: 12, dmg: 7, xp: 15 },
  ogre: { n: "OGRE", hp: 24, atk: 5, ac: 13, dmg: 9, xp: 20 },
  drag: { n: "DRAGON", hp: 45, atk: 6, ac: 14, dmg: 10, xp: 100, boss: 1 },
  ghoul: { n: "GHOUL", hp: 15, atk: 5, ac: 12, dmg: 8, xp: 22 },
  spider: { n: "GIANT SPIDER", hp: 11, atk: 6, ac: 13, dmg: 6, xp: 20, psn: 1 },
  wraith: { n: "WRAITH", hp: 13, atk: 6, ac: 14, dmg: 8, xp: 26 },
  mino: { n: "MINOTAUR", hp: 62, atk: 7, ac: 15, dmg: 11, xp: 150, boss: 1 },
  lich: { n: "LICH KING", hp: 85, atk: 8, ac: 15, dmg: 12, xp: 300, boss: 1 },
  yeti: { n: "FROST TROLL", hp: 28, atk: 6, ac: 14, dmg: 9, xp: 30 },
  golem: { n: "STONE GOLEM", hp: 34, atk: 6, ac: 15, dmg: 10, xp: 34 },
  imp: { n: "FIRE IMP", hp: 16, atk: 7, ac: 14, dmg: 8, xp: 28 },
  demon: { n: "PIT DEMON", hp: 110, atk: 9, ac: 16, dmg: 13, xp: 400, boss: 1 },
  dlord: { n: "SHADOW KING", hp: 150, atk: 10, ac: 16, dmg: 14, xp: 600, boss: 1 },
};
const MAXF = 20;
const BOSS: Record<number, string> = { 5: "drag", 8: "mino", 10: "lich", 13: "drag", 15: "demon", 18: "mino", 20: "dlord" };
const BOSSG: Record<string, number> = { drag: 25, mino: 30, lich: 40, demon: 45, dlord: 0 };
const POOLS: string[][] = [["gob"], ["gob", "gob", "skel"], ["gob", "skel", "skel", "orc"], ["skel", "orc", "mage"], ["orc", "mage", "ogre"], ["orc", "mage", "ogre", "ghoul"], ["mage", "ogre", "ghoul", "spider"], ["ogre", "ghoul", "spider", "wraith"], ["ghoul", "spider", "wraith", "wraith"], ["ghoul", "wraith", "spider", "ogre"], ["ghoul", "wraith", "yeti"], ["wraith", "yeti", "spider", "yeti"], ["yeti", "wraith", "golem"], ["yeti", "golem", "spider", "wraith"], ["golem", "yeti", "wraith", "golem"], ["golem", "imp", "wraith"], ["imp", "golem", "yeti", "imp"], ["imp", "golem", "wraith", "spider"], ["imp", "golem", "yeti", "imp"], ["imp", "golem", "imp", "wraith"]];
const DIFF = (f0: number): Any => { const f = f0 <= 10 ? f0 : 10 + (f0 - 10) * 0.5; return { count: f === 4 ? 4 : f >= 5 ? 5 + Math.floor((f - 5) / 2) : Math.min(12, 1 + f), hpMul: f === 4 ? 1.3 : f >= 5 ? 1.35 + (f - 5) * 0.07 : 1 + (f - 1) * 0.12, atk: Math.floor((f - 1) / 2), ac: Math.floor((f - 1) / 3), dmg: Math.floor((f - 1) / 3), traps: Math.max(0, Math.min(6, f - 2)), trapDmg: 2 + Math.round(f), pots: f === 4 ? 3 : 1 + Math.floor((f + 1) / 3), rest: Math.max(0.15, 0.9 - (f - 1) * 0.18), gold: 2 + (f0 >= 4 ? 1 : 0) }; };
// ECONOMY - every gold source in one place. Gold is meant to be scarce: a full run affords ~40% of all upgrade tiers.
const ECON = { start: 50, lvl: 5, floorBonus: (f: number): number => 5 + 3 * Math.min(f, 5), pile: (f: number): number => 3 + Math.min(f, 12), kill: (f: number): number => Math.floor(f / 4), scrap: [2, 4, 8, 15] };
const GP = 25, START_GOLD = ECON.start;
const W = 32, H = 22, TS = 16, MANA = 3;
type Item = { k: string; n: string; r: number; b: number; en: string[] };
const RAR: { n: string; c: string }[] = [{ n: "COMMON", c: "#8a7a64" }, { n: "MAGIC", c: "#3b7fc4" }, { n: "RARE", c: "#c8901a" }, { n: "EPIC", c: "#a050d0" }];
const ENCH: Record<string, { n: string; c: string; k: string; d: string }> = {
  flame: { n: "FLAME", c: "#ff9a3c", k: "w", d: "+1-4 FIRE DAMAGE ON EVERY HIT" },
  frost: { n: "FROST", c: "#7fd0f0", k: "w", d: "25% CHANCE A HIT FREEZES THE FOE FOR 1 TURN" },
  vamp: { n: "VAMPIRIC", c: "#e0583c", k: "w", d: "HEAL 1 HP ON EVERY HIT" },
  swift: { n: "SWIFT", c: "#a6e06a", k: "w", d: "20% CHANCE TO STRIKE TWICE" },
  thorns: { n: "THORNS", c: "#6ab04c", k: "a", d: "MONSTERS THAT HIT YOU TAKE 2 DAMAGE" },
  ward: { n: "WARDING", c: "#cfe8ff", k: "a", d: "+1 AC AND TRAPS DEAL 2 LESS" },
};
const SLOTN: Record<string, string> = { w: "WEAPON", a: "ARMOR", t: "TRINKET" };
// Side-room templates: # wall . floor D entrance G iron gate a/b/c lever-wired gates C chest B block P plate L lever Z brazier M guard T trap A enchanter's anvil.
// Every push layout is checked by a breadth-first solver (edit/pz.py) and again in the harness.
const SPT: Record<string, string[][]> = {
  push: [["#######", "#C#...#", "#.G.B.#", "###.P.#", "###...#", "###D###"],
    ["#########", "#C#.....#", "#.G.B.B.#", "###.##..#", "###P..P.#", "#####D###"],
    ["#########", "#C#.....#", "#.G..B..#", "###.#.#.#", "###.B.P.#", "###P....#", "####D####"]],
  vault: [["#########", "#...C...#", "#.T.M.T.#", "#...T...#", "####D####"], ["#######", "#..C..#", "#T.M.T#", "#..T..#", "#.T...#", "###D###"]],
  booth: [["#######", "#.....#", "#..A..#", "#.....#", "###D###"]],
  dark: [["#########", "#Z.....Z#", "#..#G#..#", "#..#C#..#", "#Z..#..Z#", "##D######"]],
  lever: [["###########", "#C###L.L.L#", "#.abc.....#", "######D####"]],
};
const SPECS: Record<number, string[]> = { 3: ["booth", "push"], 4: ["vault", "lever"], 5: ["dark", "booth", "push"], 6: ["vault", "lever", "push"], 7: ["booth", "dark", "vault"], 8: ["push", "lever", "vault"], 9: ["booth", "dark", "push"], 10: ["vault", "lever", "booth"],
  11: ["lever", "push", "dark"], 12: ["vault", "booth", "lever"], 13: ["push", "dark", "vault"], 14: ["lever", "booth", "push"], 15: ["vault", "dark", "lever"], 16: ["booth", "push", "vault"], 17: ["lever", "dark", "push"], 18: ["vault", "booth", "lever"], 19: ["push", "dark", "vault"], 20: ["lever", "booth", "vault"] };
const LCOL = ["#e0583c", "#5aa8e8", "#ffd84a"], LNAME = ["RED", "BLUE", "GOLD"];
const orient = (t: string[], o: number): string[] => {
  let g = t.map((row: string): string[] => row.split(""));
  if (o & 1) g = g.reverse();
  if (o & 2) g = g.map((row: string[]): string[] => row.slice().reverse());
  if (o & 4) g = g[0].map((_: string, x: number): string[] => g.map((row: string[]): string => row[x]));
  return g.map((row: string[]): string => row.join(""));
};
type Card = { id: string; n: string; ic: string; max: number; c0: number; cls: number[]; eq?: boolean; fx: (t: number, c: number) => string };
const ALLC = [0, 1, 2];
const fbR = (t: number): number => 3 + (t >= 1 ? 1 : 0) + (t >= 3 ? 1 : 0);
const BR: { n: string; s: string; ic: string; col: string; cards: Card[] }[] = [
  { n: "HEALTH", s: "HP", ic: "u:heart", col: "#c0392b", cards: [
    { id: "vit", n: "VITALITY", ic: "u:heart", max: 5, c0: 0, cls: ALLC, fx: (t: number): string => "+" + 4 * t + " MAX HP" },
    { id: "mend", n: "MENDING", ic: "u:potion", max: 3, c0: 0, cls: ALLC, fx: (t: number): string => t ? "POTIONS +" + 2 * t + " HP, CAMPFIRES HEAL " + (50 + 10 * t) + "%" : "NORMAL HEALING" },
  ] },
  { n: "DEFENSE", s: "DEF", ic: "u:shield", col: "#2a6fb4", cards: [
    { id: "arm", n: "ARMOR", ic: "u:shield", max: 4, c0: 0, cls: ALLC, fx: (t: number): string => "+" + t + " AC" },
    { id: "ward", n: "TRAP WARD", ic: "u:boot", max: 3, c0: 0, cls: ALLC, fx: (t: number): string => t ? "TRAP DAMAGE -" + 2 * t : "FULL TRAP DAMAGE" },
    { id: "guard", n: "IRON GUARD", ic: "u:brace", max: 3, c0: 0, cls: [0, 2], fx: (t: number): string => "BRACE GIVES +" + (4 + 2 * t) + " AC" },
  ] },
  { n: "OFFENSE", s: "ATK", ic: "u:sword", col: "#9c2f2f", cards: [
    { id: "aim", n: "PRECISION", ic: "u:aim", max: 4, c0: 0, cls: ALLC, fx: (t: number): string => "+" + t + " TO HIT" },
    { id: "might", n: "MIGHT", ic: "u:sword", max: 4, c0: 0, cls: ALLC, fx: (t: number): string => "+" + t + " DAMAGE" },
    { id: "crit", n: "KEEN EDGE", ic: "u:star", max: 3, c0: 0, cls: ALLC, fx: (t: number, c: number): string => "CRIT ON " + (CL[c].crit - t) + "-20" },
  ] },
  { n: "WEAPONS", s: "WPN", ic: "w:axe", col: "#b8661f", cards: [
    { id: "wpn", n: "BLADE", ic: "w:flame", max: 3, c0: 0, cls: [0], fx: (t: number): string => ["SWORD 1-10", "WAR AXE 1-12", "FLAMING BLADE 1-12 +1-4 FIRE", "INFERNO BLADE 1-12 +1-6 FIRE, +1 HIT"][t] },
    { id: "cleave", n: "CLEAVE", ic: "w:cleave", max: 3, c0: 0, cls: [0], fx: (t: number): string => t ? "HITS SPLASH " + 25 * t + "% ONTO OTHER ADJACENT FOES" : "LOCKED - SPLASH DAMAGE" },
    { id: "fb", n: "FIREBALL", ic: "w:fire", max: 4, c0: 0, cls: [1], eq: true, fx: (t: number): string => "RANGE " + fbR(t) + ", DAMAGE 1-8" + (t ? "+" + 2 * t : "") + ", 1 MANA" },
    { id: "frost", n: "FROST NOVA", ic: "w:frost", max: 3, c0: 1, cls: [1], eq: true, fx: (t: number): string => t ? "FREEZE FOES WITHIN " + (t >= 3 ? 2 : 1) + " FOR " + Math.min(2, t) + " TURN" + (t > 1 ? "S" : "") + ", 1-" + (t >= 3 ? 8 : 6) + " DMG, 1 MANA" : "LOCKED - FREEZE NEARBY FOES" },
    { id: "chain", n: "LIGHTNING", ic: "w:bolt", max: 3, c0: 1, cls: [1], eq: true, fx: (t: number): string => t ? "ZAP NEAREST FOE + " + t + " MORE, 1-10" + (t >= 3 ? "+2" : "") + ", 2 MANA" : "LOCKED - CHAIN LIGHTNING" },
    { id: "dag", n: "DAGGERS", ic: "w:twin", max: 3, c0: 0, cls: [2], fx: (t: number): string => ["DAGGER 1-8", "POISONED DAGGER: POISON 2/TURN", "TWIN BLADES: 2 STRIKES + POISON", "VENOM TWINS: POISON 3/TURN, +1 HIT"][t] },
    { id: "knife", n: "KNIVES", ic: "w:knife", max: 3, c0: 0, cls: [2], fx: (t: number): string => t ? "THROW: " + (1 + t) + " PER FLOOR, RANGE " + (3 + t) + ", 1-6" + (t > 1 ? "+" + (t - 1) : "") : "LOCKED - RANGED THROW" },
  ] },
  { n: "UTILITY", s: "UTIL", ic: "u:torch", col: "#3f7a3a", cards: [
    { id: "mana", n: "ARCANE", ic: "u:mana", max: 3, c0: 0, cls: [1], fx: (t: number): string => "MAX MANA " + (MANA + t) + (t ? ", +1 MANA EVERY " + (10 - 2 * t) + " TURNS" : "") },
    { id: "belt", n: "POTION BELT", ic: "u:belt", max: 3, c0: 0, cls: ALLC, fx: (t: number): string => t ? "+1 POTION PER TIER, START FLOORS WITH " + (1 + t) + "+" : "NO BONUS" },
    { id: "gold", n: "TREASURE", ic: "u:coin", max: 3, c0: 0, cls: ALLC, fx: (t: number): string => "+" + 25 * t + "% GOLD FOUND" },
    { id: "relic", n: "MERCHANT RELIC", ic: "u:star", max: 3, c0: 4, cls: ALLC, fx: (t: number): string => t ? "+" + 3 * t + " MAX HP, +" + t + " TO HIT (MERCHANT, FLOOR 6+)" : "MERCHANT SELLS FROM FLOOR 6" },
    { id: "torch", n: "TORCHLIGHT", ic: "u:torch", max: 3, c0: 0, cls: ALLC, fx: (t: number): string => "SEE " + (5 + t) + " TILES" },
  ] },
];
const cost = (c: Card, t: number): number => GP * (t + 1 + c.c0) + 10 * t * t;
const SPELLS: { id: string; n: string; ic: string; mc: number; rg: (t: number) => number }[] = [
  { id: "fb", n: "FIRE", ic: "w:fire", mc: 1, rg: (t: number): number => fbR(t) },
  { id: "frost", n: "FROST", ic: "w:frost", mc: 1, rg: (t: number): number => (t >= 3 ? 2 : 1) },
  { id: "chain", n: "BOLT", ic: "w:bolt", mc: 2, rg: (): number => 6 },
];
const R = (n: number): number => Math.floor(Math.random() * n);
const d = (n: number): number => 1 + R(n);
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const FONT = (s: number): string => `bold ${s}px ui-monospace, Menlo, Consolas, monospace`;

type SpellUi = { id: string; l: string; on: boolean; ok: boolean };
type UiState = { mode: string; saved: boolean; tut: boolean; cls: number; sel: number; floor: number; gold: number; from: string; sp: string; spells: SpellUi[] };
type Api = { resize: (w: number, h: number, k: number) => void; key: (k: string) => void; guide: (dir: number) => void; train: () => void; startSel: () => void; retry: () => void; load: () => void; setTut: (on: boolean) => void; skipTut: () => void; select: (i: number) => void; stop: () => void; retryFloor: () => void; newGame: () => void };

const GUIDE: { t: string; e: [string, string][] }[] = [
  { t: "HEROES", e: [
    ["fighter", "Fighter - HP 30, AC 16, attack +5, damage 1-10. Special: BRACE (+4 AC for one monster turn). Best for new players."],
    ["wizard", "Wizard - HP 22, AC 11, attack +3, damage 1-10. Special: FIREBALL. 3 mana, 1 per cast. +1 mana per kill, full refill each floor."],
    ["rogue", "Rogue - HP 20, AC 13, attack +6, damage 1-8. Crits on 18-20 for double damage. Can BRACE like the Fighter."],
    ["", "HP = hit points (0 and you perish). AC = armor: a monster's roll must reach it to hit you. Attack = bonus added to your d20."],
  ] },
  { t: "THE SCREEN", e: [
    ["bars", "Bottom-right bars: HP (green, turns yellow then red when low) and XP (blue). A full XP bar means level up: +5 gold and a full heal."],
    ["clock", "Top-right panel: floor, level and gold. The dial fills as you get closer to floor 20, where the Orb waits."],
    ["hotbar", "Hotbar: your weapon (Act), each spell you own (Wizard) or Brace/Throw, Potion, Wait, your red, blue and yellow keys, then the star: UPGRADES. Tap a slot (or press 1-9, U) to use it."],
    ["portrait", "Dialogue box: the Guide's hints during the tutorial floors, and the combat log with every dice roll."],
  ] },
  { t: "TILES", e: [
    ["floor", "Floor - walk here. Grass, pebbles and crystals are just decoration."],
    ["wall", "Wall - solid rock. Torches on walls are decoration too."],
    ["doors", "Locked doors - red, blue or yellow. Walk into one while holding the same color key to open it."],
    ["stair", "Stairs - step on them to go down a floor. The game saves on every new floor and every turn."],
    ["fog", "Fog: dim tiles were seen before but are out of sight. Black is unexplored. You see about 5 tiles around you."],
  ] },
  { t: "MONSTERS", e: [
    ["gob", "Goblin - HP 6, AC 11, hits +2 for 1-5. Weak but common. 5 XP."],
    ["skel", "Skeleton - HP 10, AC 12, hits +3 for 1-6. 8 XP."],
    ["orc", "Orc - HP 16, AC 13, hits +4 for 1-8. A heavy hitter. 12 XP."],
    ["mage", "Dark Mage - HP 12, AC 12, hits +5 for 1-7. Appears from floor 4. 15 XP."],
    ["ogre", "Ogre - HP 24, AC 13, hits +5 for 1-9. Appears from floor 5. 20 XP."],
    ["drag", "Dragon (mid-boss) - HP 45, AC 14, hits +7 for 1-10. Guards the stairs on floors 5 and 13. 100 XP, +25 gold."],
    ["ghoul", "Ghoul - from floor 6. Tough and hits hard. 22 XP."],
    ["spider", "Giant Spider - from floor 7. Its bite poisons you for 2 turns. 20 XP."],
    ["wraith", "Wraith - from floor 8. Hard to hit (AC 14+). 26 XP."],
    ["mino", "Minotaur (mini-boss) - HP 62, AC 15. Guards the stairs on floors 8 and 18. 150 XP, +30 gold."],
    ["lich", "Lich King (mid-game boss) - HP 85, AC 15, hits +9 for 1-12. Guards the stairs on floor 10. Beat him and the dungeon goes deeper!"],
    ["yeti", "Frost Troll - from floor 11 in the ice caves. HP 28, AC 14. 30 XP."],
    ["golem", "Stone Golem - from floor 13. Very hard to hit (AC 15+). 34 XP."],
    ["imp", "Fire Imp - from floor 16 in the ember depths. Fast, accurate biter. 28 XP."],
    ["demon", "Pit Demon (mini-boss) - HP 110, AC 16. Guards the stairs on floor 15. 400 XP, +45 gold."],
    ["dlord", "Shadow King (final boss) - HP 150, AC 16, hits +10 for 1-14. Guards the Orb on floor 20."],
    ["", "Each floor adds monsters. Monsters gain 12% HP per floor (half as fast after floor 10), +1 to hit every 2 floors and +1 AC and damage every 3. The skulls on the floor banner show the danger."],
  ] },
  { t: "ITEMS", e: [
    ["pot", "Potion - heals 5-12 HP. Every hero starts with 2. Drink with Q or the Potion button."],
    ["key", "Key - opens every door of its own color on that floor. Your keys show in the hotbar."],
    ["gold", "Gold - your score. Slain monsters drop some too. Deeper floors hold more."],
    ["rest", "Campfire - step on it to rest and heal half your max HP (once). Floors 4+ always have one; boss floors (5, 8, 10, 13, 15, 18, 20) have two, one near the boss."],
    ["trap", "Spike trap - from floor 3. Hidden until you are close; stepping on one hurts (more on deeper floors). Walk around them!"],
    ["orb", "Orb of Tarmin - on floor 20, behind the locked door. Slay the Shadow King, then step on the Orb to win! Floors 1-4 dungeon, 5-10 crypt, 11-15 ice caves, 16-20 ember depths. Your progress is saved every floor."],
  ] },
  { t: "COMBAT", e: [
    ["sword", "Walk into a monster (or tap Act) to attack: d20 + attack bonus (+ Precision upgrades). Reach its AC to hit. A 20 always hits, a 1 always misses."],
    ["gob", "Example: a Fighter rolls 7: 7 + 5 = 12 vs Goblin AC 11, a hit! The log shows it as D20:7+5=12 vs AC 11 HIT."],
    ["rogue", "Crit: a 20 (18+ for the Rogue) doubles damage. Damage = your weapon die + Might upgrades. Levels no longer add stats - spend gold on UPGRADES instead."],
    ["skel", "Monsters roll d20 + their hit bonus against your AC. The screen shakes when you are hit."],
  ] },
  { t: "ACTIONS", e: [
    ["fire", "Spells (Wizard): every spell you own is ready at once. FIRE (1 mana, range 3+), FROST (1 mana, freezes adjacent foes), BOLT (2 mana, chains, range 6). Tap a spell button to select it, then CAST - or tap its hotbar slot, or press F / G / H."],
    ["w:knife", "Throw (Rogue, after the KNIVES upgrade): replaces Brace on the button - hits the nearest foe in range. B still braces."],
    ["shield", "Brace (Fighter, Rogue): +4 AC until the monsters finish their next move. Uses your turn."],
    ["pot", "Potion: heals 5-12 HP, up to your max. Uses your turn."],
    ["hour", "Wait: skip a turn. Monsters only move when you act, so think before each step."],
  ] },
  { t: "CONTROLS", e: [
    ["", "Touch: the D-pad (left) moves - hold to keep walking - or swipe on the map. Buttons on the right: Act, Cast/Brace, Potion, Wait. Wizards pick a spell with the buttons under the D-pad."],
    ["", "Keyboard: arrows or WASD move. Space or E: Act. F: Fireball (or Brace/Throw), G: Frost Nova, H: Lightning. Q: potion. Enter: wait. 1-9: hotbar. U: upgrades. R: retry the floor after death, N: new game."],
    ["", "Died? RETRY FLOOR restarts the same floor with full HP and mana, and the level, gold and items you had when you arrived."],
    ["", "Tap Continue on the title screen to resume your run from the start of your current floor."],
  ] },
  { t: "ROOMS & LOOT", e: [
    ["o:chest", "From floor 3, side rooms branch off the halls. Each puzzle room or vault holds a CHEST with gear: weapons, armor and trinkets in COMMON, MAGIC, RARE and EPIC."],
    ["o:bag", "Open the BAG (hotbar bag slot, BAG button or I key) to equip gear and read its enchantments. Scrap spare items for a little gold."],
    ["o:booth", "ENCHANTER'S BOOTH: step on the anvil to enchant your weapon (FLAME, FROST, VAMPIRIC, SWIFT). Each enchant costs more than the last; with 2 enchants you reroll one."],
    ["o:blk", "PUSH ROOMS: walk into a block to shove it. Cover every plate to open the iron gate. Stuck? UNDO (Z) or RESET (X) - both appear in the hotbar."],
    ["o:lever", "LEVER ROOMS: each lever opens the iron gate of ITS color. Bump a lever to pull it; stand BETWEEN two levers and both flip. Turn every lever green to reach the chest."],
    ["o:braz", "DARK ROOMS: you see 1 tile without a TORCH (find one on the floor). Light all 4 braziers to open the gate."],
    ["o:gate", "VAULTS have traps and a glowing GUARD. Slay it to open the chest. Armor can roll THORNS (hurt attackers) or WARDING (+1 AC, less trap damage)."],
  ] },
  { t: "UPGRADES", e: [
    ["u:coin", "Upgrades cost GOLD. Gold is SCARCE. You start with 50 and earn small amounts from gold piles, deeper monsters, every level (+5), every floor cleared (+8 to +20) and the bosses. You can afford well under half of all tiers in a full run - choose carefully! From floor 6 a MERCHANT RELIC (UTILITY) is for sale."],
    ["u:heart", "Open UPGRADES from the star hotbar slot, the UPGRADES button or the U key. It also opens on every floor-clear screen."],
    ["u:shield", "Five branches: HEALTH, DEFENSE, OFFENSE, WEAPONS (your hero's own weapons and spells) and UTILITY. Tap a big tab, tap a card, then the one BUY button (green when you can afford it)."],
    ["w:fire", "Tiers get pricier: 25, 60, 115, 190, 285 gold (new spells cost 25 more). Spells you buy are added - all your spells stay ready."],
    ["u:coin", "REFUND ALL gives all the gold back between floors - try another build! Upgrades you buy are kept when you Retry Floor."],
  ] },
  { t: "PRACTICE ROOM", e: [
    ["hero", "Next comes a safe practice room with your chosen hero and a training dummy that never hits back."],
    ["portrait", "Follow the Guide's hints in the dialogue box, grab the key, open the door, then take the stairs."],
    ["", "Tap Next to begin."],
  ] },
];

function makeGame(C: Cv, onUi: (s: UiState) => void, initSel: number, initTut: boolean): Api {
  const X = cx(C);
  let LW = 256, LH = 192, K = 2;
  let mode = "title", G: Any = null, map: number[][] = [], seen: number[][] = [], ents: Any[] = [], log: string[] = [];
  let sel = initSel, tutOn = initTut, gp = 0, pages: Any[] = [], pagesKey = "";
  let anim = 0, shake = 0, flash = 0, niceT = 0, raf = 0, curHint = "", lastHint = "", hintFloor = -1, selA = "act", bumpX = 0, bumpY = 0;
  let bannerT = 0, snap = "", runD = 0;
  let ub = 0, uc = 0, ufrom = "play", uMsg = "", clearSum: Any = null;
  let iSel = 0, iBooth = false, iMsg = "", invR: { slots: number[][]; btn: Any[] } = { slots: [], btn: [] }, pzStack: Any[] = [];
  const uR: Any = { tabs: [], cards: [], buy: null, eq: null };
  let parts: Any[] = [], floats: Any[] = [], hotRects: Any[] = [], cardRects: Any[] = [], dlgRect: number[] = [0, 0, 0, 0];
  const SP: Record<string, Cv[]> = {};
  for (const k of ["fighter", "wizard", "rogue", "gob", "skel", "orc", "drag"]) SP[k] = frames(ART[k]);
  SP.dummy = frames(ART.gob, { L: "#d9b560", l: "#f2d68a", m: "#a8762c", M: "#7a5420", r: "#5a3a22", W: "#8a5a32" });
  SP.sage = frames(ART.wizard, { P: "#2a8f8a", p: "#6be0cf", y: "#ffd84a" });
  SP.mage = frames(ART.wizard, { P: "#2a1f3a", p: "#4a3a6a", y: "#e0583c", s: "#a7b4c0", e: "#6a7a8c", E: "#3e4a5c", t: "#e0583c", W: "#ffd84a" });
  SP.ogre = frames(ART.orc, { L: "#c99058", l: "#e0b080", m: "#8a5a32", r: "#ffd84a" });
  SP.ghoul = frames(ART.orc, { L: "#7a8c6a", l: "#a7b48a", m: "#4a5a3a", r: "#e0583c", G: "#3a4a2a", g: "#5a6a4a" });
  SP.wraith = frames(ART.skel, { W: "#cfe8ff", e: "#3b4a7a", E: "#6a7ab4", x: "#7fd0f0" });
  SP.mino = frames(ART.orc, { L: "#8a5a32", l: "#b8763c", m: "#5a3a22", r: "#e0583c", G: "#3b2212", g: "#6a4a2a" });
  SP.lich = frames(ART.wizard, { P: "#1c1424", p: "#3a2a4a", y: "#6ae06a", s: "#cfe8d0", e: "#6a7a8c", E: "#3e4a5c", t: "#6ae06a", W: "#a6e06a" });
  SP.yeti = frames(ART.orc, { L: "#cfe8f2", l: "#ffffff", m: "#7fa8c0", r: "#3b7fc4", G: "#5a7f99", g: "#8fb8cc" });
  SP.golem = frames(ART.orc, { L: "#8a8f98", l: "#b4bac2", m: "#5a5f68", r: "#ff9a3c", G: "#4a4e56", g: "#6a7078" });
  SP.imp = frames(ART.gob, { L: "#e05a20", l: "#ff9a3c", m: "#9c2f2f", M: "#5a1a1a" });
  SP.demon = frames(ART.orc, { L: "#9c2f2f", l: "#e0583c", m: "#5a1a1a", r: "#ffd84a", G: "#3a1010", g: "#6a2a2a" });
  SP.dlord = frames(ART.wizard, { P: "#100a18", p: "#2a1a3a", y: "#e0583c", s: "#b88ae0", e: "#3a2a4a", E: "#1c1424", t: "#e0583c", W: "#ff9a3c" });
  SP.spider = frames(["................", "................", "..l..........l..", "...l..kkkk..l...", "....l.kkkk.l....", "..lllkkkkkklll..", ".l...kkrrkk...l.", "....kkkkkkkk....", "..lllkkkkkklll..", ".l...kkkkkk...l.", "....l.kkkk.l....", "...l..kkkk..l...", "..l...kmmk...l..", ".......kk.......", "................", "................"], { k: "#2a1f3a", r: "#e0583c", l: "#4a3a6a", m: "#a6305a" });
  for (const k of ["pot", "gold", "orb", "sword", "fire", "shield", "hour", "coin"]) SP[k] = [buildSprite(ART[k])];
  SP.key = KEYC.map((s: Record<string, string>): Cv => buildSprite(ART.key, s));
  const TH: Any[] = THEMES.map((t: Any, i: number): Any => buildTheme(t, i));
  const shadow = mkCv(16, 4); { const x = cx(shadow); for (let j = 0; j < 4; j++) for (let i = 0; i < 16; i++) { const dx = (i - 7.5) / 6.5, dy = (j - 1.5) / 1.8; if (dx * dx + dy * dy < 1 && (i + j) % 2 === 0) px(x, "rgba(20,10,24,0.55)", i, j); } }

  let ac: AudioContext | null = null;
  const beep = (f: number, t: number, type: OscillatorType = "square"): void => {
    try {
      if (!ac) { const A = (window as Any).AudioContext || (window as Any).webkitAudioContext; if (!A) return; ac = new A() as AudioContext; }
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.value = 0.04;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + t);
    } catch { /* no audio */ }
  };
  const vib = (ms: number): void => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* none */ } };
  const T = (id: string): number => (G && G.upg && G.upg[id]) || 0;
  const mpMax = (): number => MANA + T("mana");
  const sight = (): number => { const q = G && G.sr ? roomAt(G.x, G.y) : null; return q && q.k === "dark" && !q.lit && !G.torchI ? 1.5 : 5.5 + T("torch"); };
  const lampNear = (x: number, y: number): boolean => ents.some((o: Any): boolean => o.t === "braz" && o.lit && Math.hypot(o.x - x, o.y - y) <= 2.5);
  const newInv = (c: number): Any => ({ w: { k: "w", n: ["SWORD", "STAFF", "DAGGER"][c], r: 0, b: 0, en: [] }, a: null, t: null, bag: [] });
  const eqI = (): Item[] => (G && G.inv ? [G.inv.w, G.inv.a, G.inv.t].filter((i: Item | null): boolean => !!i) : []) as Item[];
  const enc = (id: string): number => eqI().reduce((n: number, i: Item): number => n + i.en.filter((e: string): boolean => e === id).length, 0);
  const iB = (k: string): number => (G && G.inv && G.inv[k] ? (G.inv[k] as Item).b : 0);
  const fmtB = (i: Item): string => i.k === "w" ? "+" + i.b + " DAMAGE" : i.k === "a" ? "+" + i.b + " AC" : "+" + i.b + " TO HIT";
  const scrapV = (i: Item): number => ECON.scrap[i.r];
  const enchCost = (): number => 40 + 25 * (G.ench || 0);
  const solidAt = (x: number, y: number): boolean => ents.some((o: Any): boolean => o.x === x && o.y === y && (o.t === "blk" || o.t === "braz" || o.t === "lever"));
  const roomAt = (x: number, y: number): Any => (G && G.sr ? G.sr.find((q: Any): boolean => x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h) : null);
  function rollItem(minR: number, boost: number): Item {
    const f = G.floor, p = Math.random(); let rr0 = p < 0.03 + 0.015 * f + boost ? 3 : p < 0.15 + 0.03 * f + boost ? 2 : p < 0.6 ? 1 : 0; rr0 = Math.max(minR, rr0);
    const k = ["w", "a", "t"][R(3)], pool = Object.keys(ENCH).filter((e: string): boolean => k === "t" || ENCH[e].k === k), en: string[] = [];
    for (let j = 0; j < (rr0 >= 3 ? 2 : rr0 >= 1 ? 1 : 0); j++) en.push(pool[R(pool.length)]);
    const b = k === "w" ? rr0 : k === "a" ? (rr0 ? Math.ceil(rr0 / 1.5) : 1) : Math.max(1, Math.floor((rr0 + 1) / 2));
    const base = k === "w" ? ["SWORD", "STAFF", "DAGGER"][G.cls] : k === "a" ? ["LEATHER", "CHAIN MAIL", "SCALE MAIL", "PLATE"][rr0] : ["CHARM", "RING", "AMULET", "IDOL"][rr0];
    return { k, n: (en.length ? ENCH[en[0]].n + " " : "") + base + (en.length > 1 ? " OF " + ENCH[en[1]].n : ""), r: rr0, b, en };
  }
  const heroAC = (): number => CL[G.cls].ac + T("arm") + (G.brace ? 4 + 2 * T("guard") : 0) + iB("a") + enc("ward");
  const myCards = (b: number): Card[] => BR[b].cards.filter((c: Card): boolean => c.cls.includes(G ? G.cls : sel));
  const owned = (): typeof SPELLS => SPELLS.filter((p: typeof SPELLS[number]): boolean => p.id === "fb" || T(p.id) > 0);
  const curSp = (): string => (owned().some((p: typeof SPELLS[number]): boolean => p.id === G.eq) ? G.eq : "fb");
  const weaponIc = (): string => G.cls === 0 ? ["w:sword", "w:axe", "w:flame", "w:flame"][T("wpn")] : G.cls === 1 ? "w:staff" : ["w:dagger", "w:pdag", "w:twin", "w:twin"][T("dag")];
  const spellsUi = (): SpellUi[] => !G || !CL[G.cls].spell ? [] : owned().map((p: typeof SPELLS[number]): SpellUi => ({ id: p.id, l: p.n + " " + p.mc + "◆ R" + p.rg(T(p.id)), on: p.id === curSp(), ok: G.mp >= p.mc }));
  const ui = (): void => onUi({ mode, saved: !!LS.get("dndF"), tut: !!(G && G.tut && !G.train && mode === "play" && G.floor <= 3), cls: G ? G.cls : sel, sel, floor: G ? G.floor : 1, gold: G ? G.gold || 0 : 0, spells: spellsUi(), from: ufrom, sp: !G || CL[G.cls].spell ? "CAST " + (G ? SPELLS.find((p: typeof SPELLS[number]): boolean => p.id === curSp())?.n || "FIRE" : "FIRE") : G.cls === 2 && T("knife") ? "THROW" : "BRACE" });
  const say = (s: string): void => { log.unshift(s); if (log.length > 30) log.pop(); };
  const grid = (v: number): number[][] => Array.from({ length: H }, (): number[] => new Array(W).fill(v));
  const carve = (x1: number, y1: number, x2: number, y2: number): void => { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) map[y][x] = 0; };
  const entAt = (x: number, y: number, t?: string): Any => ents.find((e: Any): boolean => e.x === x && e.y === y && (!t || e.t === t));
  const mk = (n: string, x: number, y: number, dummy = false): Any => {
    const b = MON[n]; const f = G ? G.floor : 1;
    const D = DIFF(dummy ? 1 : f);
    const bs = !!b.boss, hp = bs ? b.hp : Math.max(1, Math.round(b.hp * D.hpMul));
    return { t: "mon", n, x, y, hp, mx: hp, dummy, fl: 0, boss: bs ? 1 : 0, atk: b.atk + (bs ? Math.min(D.atk, 1) : D.atk), ac: b.ac + (bs ? 0 : D.ac), dmg: b.dmg + (bs ? 0 : D.dmg) };
  };
  const theme = (): Any => TH[!G || G.train || G.floor <= 2 ? 0 : G.floor <= 4 ? 1 : G.floor <= 10 ? 2 : G.floor <= 15 ? 3 : 4];
  const hash = (x: number, y: number): number => { let h = (x * 374761393 + y * 668265263 + (G ? G.floor : 0) * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
  const reveal = (): void => { const sr = sight(), n = Math.ceil(sr); for (let y = G.y - n; y <= G.y + n; y++) for (let x = G.x - n; x <= G.x + n; x++) if (x >= 0 && y >= 0 && x < W && y < H && Math.hypot(x - G.x, y - G.y) <= sr) seen[y][x] = 1;
    for (const o of ents) if (o.t === "braz" && o.lit) for (let y = o.y - 2; y <= o.y + 2; y++) for (let x = o.x - 2; x <= o.x + 2; x++) if (x >= 0 && y >= 0 && x < W && y < H) seen[y][x] = 1; };
  const near = (x: number, y: number): boolean => Math.hypot(x - G.x, y - G.y) <= sight() || lampNear(x, y);

  function newBase(c: number): void {
    const k = CL[c];
    G = { cls: c, hp: k.hp, mx: k.hp, lv: 1, xp: 0, gold: START_GOLD, pot: 2, keys: [0, 0, 0], floor: 1, x: 2, y: 2, rx: 2, ry: 2, face: 0, tut: tutOn ? 1 : 0, train: 0, moves: 0, mp: k.spell ? MANA : 0, brace: 0, drank: 0, f3: 0, hideHint: "", up: 0, upg: {}, eq: "fb", kn: 0, tc: 0, fx: 0, fg: 0, fu: 0, upSeen: 0, kills: 0, dth: 0, inv: newInv(c), ench: 0, torchI: 0, sr: [] };
    ents = []; log = []; parts = []; floats = []; lastHint = ""; hintFloor = -1; niceT = 0; selA = "act"; runD = 0;
  }
  function placeHero(x: number, y: number): void { G.x = x; G.y = y; G.rx = x; G.ry = y; }
  function bfs(sx: number, sy: number): number[][] {
    const out: number[][] = []; const vis = grid(0); const q: number[][] = [[sx, sy]]; vis[sy][sx] = 1;
    while (q.length) { const c = q.shift() as number[]; out.push(c); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = c[0] + dx, ny = c[1] + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || vis[ny][nx] || map[ny][nx] !== 0) continue; vis[ny][nx] = 1; q.push([nx, ny]); } }
    return out;
  }
  function procGen(): void {
    let rooms: Any[] = [];
    for (let att = 0; att < 60 && rooms.length < 3; att++) {
      map = grid(1); rooms = [];
      for (let t = 0; t < 120 && rooms.length < (G.floor >= 3 ? 5 + R(2) : 8); t++) {
        const w = 4 + R(6), h = 3 + R(4), x = 1 + R(W - w - 2), y = 1 + R(H - h - 2);
        if (rooms.some((r: Any): boolean => x <= r.x + r.w + 1 && x + w + 1 >= r.x && y <= r.y + r.h + 1 && y + h + 1 >= r.y)) continue;
        rooms.push({ x, y, w, h });
      }
    }
    if (rooms.length < 3) { map = grid(1); rooms = [{ x: 2, y: 2, w: 6, h: 5 }, { x: 13, y: 8, w: 6, h: 5 }, { x: 24, y: 14, w: 6, h: 5 }]; }
    for (const r of rooms) carve(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);
    const ctr = (r: Any): number[] => [r.x + (r.w >> 1), r.y + (r.h >> 1)];
    for (let i = 1; i < rooms.length; i++) {
      const [ax, ay] = ctr(rooms[i - 1]), [bx, by] = ctr(rooms[i]);
      if (R(2)) { carve(ax, ay, bx, ay); carve(bx, ay, bx, by); } else { carve(ax, ay, ax, by); carve(ax, by, bx, by); }
    }
    const last = rooms[rooms.length - 1], dc = (G.floor - 1) % 3;
    const inR = (r: Any, x: number, y: number): boolean => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
    for (let i = last.x; i < last.x + last.w; i++) for (const j of [last.y - 1, last.y + last.h]) if (map[j][i] === 0) map[j][i] = 10 + dc;
    for (let j = last.y; j < last.y + last.h; j++) for (const i of [last.x - 1, last.x + last.w]) if (map[j][i] === 0) map[j][i] = 10 + dc;
    const [sx, sy] = ctr(rooms[0]); placeHero(sx, sy);
    const reach = bfs(sx, sy).filter((c: number[]): boolean => !inR(last, c[0], c[1]) && (c[0] !== sx || c[1] !== sy));
    let kc = reach.filter((c: number[]): boolean => rooms.slice(1, -1).some((r: Any): boolean => inR(r, c[0], c[1])));
    if (!kc.length) kc = reach.filter((c: number[]): boolean => Math.abs(c[0] - sx) + Math.abs(c[1] - sy) >= 2);
    if (!kc.length) kc = reach.length ? reach : [[sx + 1, sy]];
    const kp = kc[R(kc.length)]; ents.push({ t: "key", c: dc, x: kp[0], y: kp[1] });
    const free = (r: Any): number[] | null => { for (let t = 0; t < 40; t++) { const x = r.x + R(r.w), y = r.y + R(r.h); if (map[y][x] === 0 && !entAt(x, y) && (x !== G.x || y !== G.y)) return [x, y]; } return null; };
    const lc = ctr(last);
    ents.push({ t: G.floor >= MAXF ? "orb" : "stair", x: lc[0], y: lc[1] });
    if (BOSS[G.floor]) { const p = free(last); if (p) ents.push(mk(BOSS[G.floor], p[0], p[1])); }
    const D = DIFF(G.floor), pool = POOLS[Math.min(G.floor, POOLS.length) - 1];
    for (let k = 0; k < D.count; k++) { const p = free(rooms[1 + (k % (rooms.length - 1))]); if (p) ents.push(mk(pool[R(pool.length)], p[0], p[1])); }
    for (let k = 0; k < D.pots; k++) { const p = free(rooms[1 + R(rooms.length - 1)]); if (p) ents.push({ t: "pot", x: p[0], y: p[1] }); }
    for (let k = 0; k < D.gold; k++) { const p = free(rooms[R(rooms.length)]); if (p) ents.push({ t: "gold", v: d(4) + ECON.pile(G.floor), x: p[0], y: p[1] }); }
    const open = (): number[][] => bfs(sx, sy).filter((c: number[]): boolean => !inR(last, c[0], c[1]) && !entAt(c[0], c[1]) && (c[0] !== sx || c[1] !== sy) && Math.abs(c[0] - sx) + Math.abs(c[1] - sy) >= 3);
    const camp = (nearLair: boolean): void => {
      let cs = open(); if (!cs.length) return;
      if (nearLair) { cs.sort((a: number[], b: number[]): number => Math.abs(a[0] - lc[0]) + Math.abs(a[1] - lc[1]) - Math.abs(b[0] - lc[0]) - Math.abs(b[1] - lc[1])); cs = cs.slice(0, Math.min(6, cs.length)); }
      else { const mid = cs.filter((c: number[]): boolean => rooms.slice(1, -1).some((r: Any): boolean => inR(r, c[0], c[1]))); if (mid.length) cs = mid; }
      const c = cs[R(cs.length)]; ents.push({ t: "rest", x: c[0], y: c[1] });
    };
    const guar = BOSS[G.floor] ? 2 : G.floor >= 4 ? 1 : 0;
    for (let k = 0; k < guar; k++) camp(!!BOSS[G.floor] && k === 1);
    if (guar === 0 && Math.random() < D.rest) camp(false);
    else if (G.floor >= 6 && Math.random() < D.rest) camp(false);
    const corr = bfs(sx, sy).filter((c: number[]): boolean => !rooms.some((r: Any): boolean => inR(r, c[0], c[1])) && !entAt(c[0], c[1]));
    for (let k = 0; k < D.traps; k++) { if (Math.random() < 0.5 && corr.length) { const c = corr.splice(R(corr.length), 1)[0]; ents.push({ t: "trap", x: c[0], y: c[1] }); } else { const p = free(rooms[1 + R(rooms.length - 1)]); if (p) ents.push({ t: "trap", x: p[0], y: p[1] }); } }
    G.sr = []; G.torchI = 0;
    for (const kind of SPECS[G.floor] || []) {
      const ok = new Set<number>(bfs(sx, sy).filter((c: number[]): boolean => !inR(last, c[0], c[1]) && !roomAt(c[0], c[1])).map((c: number[]): number => c[1] * W + c[0]));
      if (placeSpecial(kind, ok, pool) && kind === "dark") {
        const tc = bfs(sx, sy).filter((c: number[]): boolean => !inR(last, c[0], c[1]) && !roomAt(c[0], c[1]) && !entAt(c[0], c[1]) && (c[0] !== sx || c[1] !== sy));
        if (tc.length) { const c = tc[R(tc.length)]; ents.push({ t: "torch", x: c[0], y: c[1] }); }
      }
    }
  }
  function placeSpecial(kind: string, ok: Set<number>, pool: string[]): boolean {
    const set = SPT[kind];
    for (let tries = 0; tries < 10; tries++) {
      const t = orient(set[R(set.length)], R(8)), th = t.length, tw = t[0].length;
      let ex = 0, ey = 0; t.forEach((row: string, y: number): void => { const i = row.indexOf("D"); if (i >= 0) { ex = i; ey = y; } });
      const dir = ey === th - 1 ? [0, 1] : ey === 0 ? [0, -1] : ex === 0 ? [-1, 0] : [1, 0];
      const cands: Any[] = [];
      for (let oy = 0; oy + th <= H; oy++) for (let ox = 0; ox + tw <= W; ox++) {
        let bad = false;
        for (let y = oy - 1; y <= oy + th && !bad; y++) for (let x = ox - 1; x <= ox + tw; x++) if (x >= 0 && y >= 0 && x < W && y < H && map[y][x] !== 1) { bad = true; break; }
        if (bad) continue;
        const path: number[][] = []; let cx = ox + ex + dir[0], cy = oy + ey + dir[1], hit = false;
        for (let n = 0; n < 18; n++) {
          if (cx < 1 || cy < 1 || cx >= W - 1 || cy >= H - 1) break;
          if (map[cy][cx] === 0) { hit = ok.has(cy * W + cx); break; }
          if (map[cy][cx] !== 1) break;
          const p1 = map[cy + dir[0]] ? map[cy + dir[0]][cx + dir[1]] : 1, p2 = map[cy - dir[0]] ? map[cy - dir[0]][cx - dir[1]] : 1;
          if (p1 !== 1 || p2 !== 1) break;
          path.push([cx, cy]); cx += dir[0]; cy += dir[1];
        }
        if (hit) cands.push([ox, oy, path]);
      }
      if (!cands.length) continue;
      const [ox, oy, path] = cands[R(cands.length)], sid = G.sr.length;
      for (const [x, y] of path) map[y][x] = 0;
      const lv: Any[] = [];
      t.forEach((row: string, y: number): void => { for (let x = 0; x < tw; x++) {
        const ch = row[x], X0 = ox + x, Y0 = oy + y; if (ch === "#") continue;
        map[Y0][X0] = ch === "G" || ch === "a" || ch === "b" || ch === "c" ? 2 : 0;
        if (ch === "a" || ch === "b" || ch === "c") ents.push({ t: "lgate", x: X0, y: Y0, c: ch.charCodeAt(0) - 97, sid });
        if (ch === "B") ents.push({ t: "blk", x: X0, y: Y0, ox: X0, oy: Y0, sid });
        else if (ch === "P") ents.push({ t: "plate", x: X0, y: Y0, sid });
        else if (ch === "C") ents.push({ t: "chest", x: X0, y: Y0, sid });
        else if (ch === "Z") ents.push({ t: "braz", x: X0, y: Y0, lit: 0, sid });
        else if (ch === "L") { const o = { t: "lever", x: X0, y: Y0, on: 0, sid, i: 0 }; lv.push(o); ents.push(o); }
        else if (ch === "T") ents.push({ t: "trap", x: X0, y: Y0 });
        else if (ch === "A") ents.push({ t: "booth", x: X0, y: Y0, sid });
        else if (ch === "M") { const m = mk(pool[pool.length - 1], X0, Y0); m.hp = m.mx = Math.round(m.hp * 1.4); m.guard = 1; m.sid = sid; ents.push(m); }
      } });
      if (lv.length) { lv.sort((a: Any, b: Any): number => a.x - b.x || a.y - b.y); const pm = [0, 1, 2].sort((): number => Math.random() - 0.5), st = R(7); lv.forEach((o: Any, i: number): void => { o.i = i; o.c = pm[i % 3]; o.on = (st >> i) & 1; }); syncGates(sid); }
      G.sr.push({ k: kind, x: ox, y: oy, w: tw, h: th, ex: ox + ex, ey: oy + ey, done: kind === "booth" || kind === "vault" ? 1 : 0, lit: 0, seen: 0 });
      return true;
    }
    return false;
  }
  function syncGates(sid: number): void {
    for (const g of ents) if (g.t === "lgate" && g.sid === sid) {
      const l = ents.find((o: Any): boolean => o.t === "lever" && o.sid === sid && o.c === g.c), open = !!(l && l.on);
      if (open) map[g.y][g.x] = 0; else if (!ents.some((o: Any): boolean => o.t === "mon" && o.x === g.x && o.y === g.y) && !(G.x === g.x && G.y === g.y)) map[g.y][g.x] = 2;
    }
  }
  function tutGen(): void {
    map = grid(1); const f = G.floor;
    if (f === 1) { carve(2, 6, 9, 10); carve(14, 6, 20, 10); carve(9, 8, 14, 8); placeHero(3, 8); ents.push({ t: "pot", x: 6, y: 6 }, mk("gob", 16, 8, true), { t: "stair", x: 19, y: 9 }); }
    else if (f === 2) { carve(2, 5, 8, 11); carve(15, 5, 22, 11); carve(8, 8, 15, 8); map[8][14] = 10; placeHero(3, 8); ents.push({ t: "key", c: 0, x: 4, y: 6 }, mk("skel", 7, 10), { t: "gold", v: 15, x: 18, y: 6 }, { t: "stair", x: 21, y: 8 }); }
    else { carve(2, 3, 8, 9); carve(2, 15, 10, 19); carve(20, 14, 28, 19); carve(5, 9, 5, 15); carve(10, 17, 20, 17); map[17][19] = 11; placeHero(4, 5); ents.push({ t: "key", c: 1, x: 3, y: 18 }, mk("orc", 9, 16), { t: "pot", x: 7, y: 4 }, { t: "gold", v: 20, x: 24, y: 15 }, { t: "stair", x: 27, y: 17 }); }
  }
  function gen(): void {
    ents = []; parts = [];
    if (G.tut && G.floor <= 3) tutGen(); else { for (let a = 0; a < 12; a++) { ents = []; procGen(); if (G.sr.length >= (SPECS[G.floor] || []).length) break; } }
    pzStack = []; G.fx = 0; G.fg = 0; G.fu = 0; G.kn = T("knife") ? 1 + T("knife") : 0; if (T("belt")) G.pot = Math.max(G.pot, 1 + T("belt"));
    seen = grid(0); if (CL[G.cls].spell) G.mp = mpMax(); reveal();
    bannerT = 110;
    snap = JSON.stringify({ G, map, ents }); LS.set("dndF", snap);
  }
  function restoreFloor(s: string): boolean {
    try {
      const o = JSON.parse(s); G = o.G; map = o.map; ents = o.ents; G.upg = G.upg || {}; if (G.up) { G.gold = (G.gold || 0) + G.up * GP; G.up = 0; } G.dth = Math.max(G.dth || 0, runD); if (!G.eq) G.eq = "fb"; if (!G.inv) G.inv = newInv(G.cls); if (!G.sr) G.sr = []; pzStack = []; G.hp = G.mx; if (CL[G.cls].spell) G.mp = mpMax(); G.brace = 0; G.rx = G.x; G.ry = G.y; sel = G.cls;
      seen = grid(0); reveal(); parts = []; floats = []; lastHint = ""; hintFloor = G.floor; niceT = 0; selA = "act"; bannerT = 110; snap = s; mode = "play"; return true;
    } catch { return false; }
  }
  function retryFloor(): void {
    const s = snap || LS.get("dndF"); if (!s || !restoreFloor(s)) { start(G ? G.cls : sel); return; }
    log = []; say("YOU RISE AGAIN AT THE START OF FLOOR " + G.floor + " - FULL HP"); beep(440, 0.15, "triangle"); save(); ui();
  }
  function save(): void { /* progress is checkpointed at the start of each floor (dndF) */ }
  function start(c: number): void {
    sel = c; LS.set("dndLast", String(c)); newBase(c);
    if (G.tut) G.hp = G.mx - 6;
    say("WELCOME, " + CL[c].n + "! FIND THE ORB ON FLOOR " + MAXF + ".");
    gen(); mode = "play"; save(); beep(440, 0.15); ui();
  }
  function train(): void {
    newBase(sel); snap = ""; G.train = 1; G.tut = 1; map = grid(1);
    carve(2, 5, 11, 11); carve(14, 5, 20, 11); carve(12, 8, 13, 8); map[8][13] = 10; placeHero(3, 8);
    ents.push(mk("gob", 7, 8, true), { t: "key", c: 0, x: 9, y: 6 }, { t: "pot", x: 4, y: 10 }, { t: "gold", v: 10, x: 17, y: 6 }, { t: "stair", x: 19, y: 8 });
    ents[0].hp = ents[0].mx = 12;
    seen = grid(0); reveal(); say("PRACTICE ROOM - NOTHING HERE CAN HURT YOU."); mode = "play"; bannerT = 0; ui();
  }
  function load(): void {
    const s = LS.get("dndF"); if (!s) return;
    if (restoreFloor(s)) { log = []; say("WELCOME BACK! RESUMING FLOOR " + G.floor); } else LS.del("dndF");
    ui();
  }

  const fx = (x: number, y: number, n: number, cols: string[], sp: number, glow: boolean, g = 0.05): void => {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = sp * (0.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, l: 18 + R(14), ml: 32, c: cols[R(cols.length)], s: 1 + R(2), glow, g }); }
  };
  const flt = (x: number, y: number, t: string, c: string): void => { floats.push({ x: x * TS + 8, y: y * TS, t, c, l: 40 }); };
  function levelCheck(): void {
    while (G.xp >= G.lv * 20) { G.xp -= G.lv * 20; G.lv++; if (!G.train) { G.gold += ECON.lvl; G.fg = (G.fg || 0) + ECON.lvl; } G.hp = G.mx; say("LEVEL UP! NOW LEVEL " + G.lv + " - FULL HEAL, +" + ECON.lvl + " GOLD"); flt(G.x, G.y, "LEVEL UP! +" + ECON.lvl + " GOLD", "#ffd84a"); fx(G.x * TS + 8, G.y * TS + 8, 24, ["#ffd84a", "#fff6e0", "#6be0cf"], 1.6, true); beep(660, 0.1); beep(880, 0.25, "triangle"); }
  }
  function kill(e: Any, how: string): void {
    ents = ents.filter((o: Any): boolean => o !== e);
    const b = MON[e.n]; const xp = G.train ? 0 : b.xp; const gl = G.train ? 0 : Math.floor((R(3) + ECON.kill(G.floor)) * (1 + 0.25 * T("gold")));
    G.kills = (G.kills || 0) + (e.dummy ? 0 : 1); G.xp += xp; G.gold += gl; G.fx = (G.fx || 0) + xp; G.fg = (G.fg || 0) + gl; if (CL[G.cls].spell && G.mp < mpMax()) G.mp++;
    if (BOSSG[e.n]) { const bg = BOSSG[e.n]; G.gold += bg; G.fg = (G.fg || 0) + bg; say(e.n === "lich" ? "THE LICH KING FALLS! +" + bg + " GOLD - BUT THE DUNGEON GOES DEEPER. TAKE THE STAIRS TO CONTINUE" : "THE " + b.n + " FALLS! +" + bg + " GOLD - THE STAIRS ARE FREE"); flt(e.x, e.y, "+" + bg + " GOLD", "#ffd84a"); }
    say((e.dummy ? "DUMMY" : b.n) + " SLAIN" + how + "! +" + xp + " XP +" + gl + " GOLD");
    fx(e.x * TS + 8, e.y * TS + 8, 16, ["#b9ae94", "#f1e8d2", "#6a7a8c"], 1.1, false, 0.02); beep(180, 0.2, "sawtooth");
    levelCheck();
  }
  function attack(e: Any): void {
    const k = CL[G.cls]; bumpX = (e.x - G.x) * 5; bumpY = (e.y - G.y) * 5;
    const wb = (G.cls === 0 && T("wpn") >= 3) || (G.cls === 2 && T("dag") >= 3) ? 1 : 0;
    const r = d(20), bon = k.atk + (T("aim") + T("relic")) + wb + iB("t"), tot = r + bon, ac2 = e.ac ?? MON[e.n].ac;
    const hit = r === 20 || (r !== 1 && tot >= ac2);
    if (hit) {
      let dm = d(G.cls === 0 && T("wpn") >= 1 ? 12 : k.dmg) + T("might") + iB("w"); for (let j = 0; j < enc("flame"); j++) dm += d(4); const crit = r >= k.crit - T("crit"); if (crit) dm *= 2;
      if (G.cls === 0 && T("wpn") >= 2) { const f2 = d(T("wpn") >= 3 ? 6 : 4); dm += f2; fx(e.x * TS + 8, e.y * TS + 8, 10, ["#ff9a3c", "#e05a20", "#ffd84a"], 1.3, true); }
      if (G.cls === 2 && T("dag") >= 1) { e.psn = 3; e.pd = T("dag") >= 3 ? 3 : 2; }
      if (G.cls === 0 && T("cleave")) for (const o of ents.filter((q: Any): boolean => q.t === "mon" && q !== e && Math.abs(q.x - G.x) + Math.abs(q.y - G.y) === 1)) { const sd = Math.max(1, Math.floor(dm * 0.25 * T("cleave"))); o.hp -= sd; o.fl = 8; flt(o.x, o.y, "" + sd, "#ffd84a"); if (o.hp <= 0) kill(o, " BY CLEAVE"); }
      e.hp -= dm; e.fl = 10; fx(e.x * TS + 8, e.y * TS + 8, crit ? 16 : 9, ["#ffd84a", "#fff6e0", "#ff9a3c"], crit ? 2 : 1.4, true);
      flt(e.x, e.y, (crit ? "CRIT " : "") + dm, crit ? "#ffd84a" : "#fff6e0"); beep(crit ? 520 : 330, 0.08);
      say("D20:" + r + "+" + bon + "=" + tot + " VS AC " + ac2 + (crit ? " CRIT! " : " HIT ") + dm + " DMG");
      if (enc("vamp") && G.hp < G.mx) { const vh = Math.min(G.mx - G.hp, enc("vamp")); G.hp += vh; flt(G.x, G.y, "+" + vh, "#e0583c"); }
      if (enc("frost") && e.hp > 0 && Math.random() < 0.25 * enc("frost")) { e.frz = Math.max(e.frz || 0, 1); flt(e.x, e.y - 0.5, "FROZEN", "#7fd0f0"); }
      if (e.hp <= 0) kill(e, "");
    } else { say("D20:" + r + "+" + bon + "=" + tot + " VS AC " + ac2 + " MISS"); flt(e.x, e.y, "MISS", "#a7b4c0"); beep(140, 0.08); }
  }
  function strike(m: Any): void { attack(m); if (G.cls === 2 && T("dag") >= 2 && ents.includes(m)) attack(m); if (enc("swift") && ents.includes(m) && Math.random() < 0.2 * enc("swift")) { say("SWIFT! A BONUS STRIKE"); attack(m); } }
  const zap = (x0: number, y0: number, x1: number, y1: number, cols: string[]): void => { for (let i = 0; i <= 14; i++) { const f = i / 14; parts.push({ x: x0 * TS + 8 + (x1 - x0) * TS * f + R(3) - 1, y: y0 * TS + 8 + (y1 - y0) * TS * f + R(3) - 1, vx: 0, vy: 0, l: 14 + R(6), ml: 20, c: cols[R(cols.length)], s: 1 + R(2), glow: true, g: 0 }); } };
  function monTurn(): void {
    const ac2 = heroAC();
    for (const e of ents) {
      if (e.t !== "mon" || e.dummy) continue;
      if (e.psn > 0) { e.psn--; e.hp -= e.pd; e.fl = 6; flt(e.x, e.y, "" + e.pd, "#a6e06a"); if (e.hp <= 0) { kill(e, " BY POISON"); continue; } }
      if (e.guard) { const q = roomAt(G.x, G.y); if (!q || G.sr.indexOf(q) !== e.sid) continue; }
      if (e.frz > 0) { e.frz--; continue; }
      const dx = G.x - e.x, dy = G.y - e.y, b = MON[e.n];
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        const r = d(20);
        if (r === 20 || (r !== 1 && r + (e.atk ?? b.atk) >= ac2)) { const dm = d(e.dmg ?? b.dmg); G.hp -= dm; if (b.psn) G.psn = 2; shake = 8; vib(60); flt(G.x, G.y, "-" + dm, "#e0583c"); fx(G.x * TS + 8, G.y * TS + 8, 8, ["#e0583c", "#9c2f2f"], 1.2, false); beep(110, 0.15, "sawtooth"); say(b.n + " HITS YOU FOR " + dm + (G.brace ? " (BRACED)" : "")); if (enc("thorns")) { const td = 2 * enc("thorns"); e.hp -= td; e.fl = 8; flt(e.x, e.y, td + " THORNS", "#6ab04c"); if (e.hp <= 0) { kill(e, " BY THORNS"); continue; } } }
        else say(b.n + " MISSES" + (G.brace ? " - YOUR BRACE HELD" : ""));
      } else if (Math.max(Math.abs(dx), Math.abs(dy)) <= 6 && seen[e.y][e.x]) {
        const opts = Math.abs(dx) > Math.abs(dy) ? [[Math.sign(dx), 0], [0, Math.sign(dy)]] : [[0, Math.sign(dy)], [Math.sign(dx), 0]];
        for (const [mx, my] of opts) { if (!mx && !my) continue; const nx = e.x + mx, ny = e.y + my; if (map[ny][nx] === 0 && !solidAt(nx, ny) && !ents.some((o: Any): boolean => o.t === "mon" && o.x === nx && o.y === ny) && (nx !== G.x || ny !== G.y)) { e.x = nx; e.y = ny; break; } }
      }
    }
    G.brace = 0;
  }
  function turn(): void {
    monTurn(); reveal();
    if (G.psn > 0) { G.psn--; G.hp -= 1; flt(G.x, G.y, "-1 POISON", "#a6e06a"); say("SPIDER POISON: -1 HP"); }
    G.tc = (G.tc || 0) + 1; if (CL[G.cls].spell && T("mana") && G.tc % (10 - 2 * T("mana")) === 0 && G.mp < mpMax()) { G.mp++; flt(G.x, G.y, "+1 MANA", "#7fd0f0"); }
    if (!G.campSeen && !G.train) { const cf = ents.find((o: Any): boolean => o.t === "rest" && seen[o.y][o.x] === 1 && Math.hypot(o.x - G.x, o.y - G.y) <= 5.5); if (cf) { G.campSeen = 1; say("CAMPFIRE heals half your HP - step on it to rest!"); flt(cf.x, cf.y, "CAMPFIRE", "#ffd84a"); } }
    if (G.hp <= 0) { G.hp = 0; G.dth = (G.dth || 0) + 1; runD = G.dth; mode = "dead"; say("YOU HAVE PERISHED ON FLOOR " + G.floor); beep(90, 0.6, "sawtooth"); ui(); return; }
    save();
  }
  function nextFloor(): void {
    if (G.train) { G.train = 0; mode = "trained"; beep(660, 0.3, "triangle"); ui(); return; }
    const fb2 = ECON.floorBonus(G.floor); G.gold += fb2; G.fg = (G.fg || 0) + fb2; clearSum = { f: G.floor, xp: G.fx || 0, gold: G.fg || 0, bonus: fb2 };
    say("FLOOR " + G.floor + " CLEARED! +" + fb2 + " GOLD BONUS"); beep(523, 0.12, "triangle"); beep(784, 0.25, "triangle");
    openUpg("clear");
  }
  function descend(): void {
    G.floor++; say("YOU DESCEND TO FLOOR " + G.floor + (CL[G.cls].spell ? " - MANA REFILLED" : "")); beep(330, 0.1); beep(220, 0.2);
    gen(); mode = "play"; save(); ui();
  }
  function openInv(booth: boolean): void { iBooth = booth; mode = "inv"; G.newI = 0; iMsg = booth ? "ENCHANT OR REROLL YOUR EQUIPPED WEAPON" : ""; iSel = clamp(iSel, 0, 10); ui(); }
  function closeInv(): void { mode = "play"; iBooth = false; ui(); }
  const selItem = (): Item | null => iSel < 3 ? G.inv[["w", "a", "t"][iSel]] : G.inv.bag[iSel - 3] || null;
  function invAct(a: string): void {
    const it = selItem();
    if (a === "equip" && it && iSel >= 3) { const old = G.inv[it.k]; G.inv[it.k] = it; G.inv.bag.splice(iSel - 3, 1); if (old) G.inv.bag.push(old); iSel = ["w", "a", "t"].indexOf(it.k); iMsg = it.n + " EQUIPPED"; beep(660, 0.08); }
    else if (a === "unequip" && it && iSel < 3) { if (G.inv.bag.length >= 8) { iMsg = "BAG FULL - SCRAP SOMETHING FIRST"; beep(100, 0.1); } else if (it.k === "w") { iMsg = "KEEP A WEAPON EQUIPPED - EQUIP ANOTHER INSTEAD"; beep(100, 0.1); } else { G.inv.bag.push(it); G.inv[it.k] = null; iMsg = it.n + " MOVED TO BAG"; beep(500, 0.06); } }
    else if (a === "scrap" && it && iSel >= 3) { const v = scrapV(it); G.inv.bag.splice(iSel - 3, 1); G.gold += v; iMsg = "SCRAPPED FOR " + v + " GOLD"; beep(880, 0.06, "triangle"); }
    else if (a === "ench" && iBooth) {
      const w = G.inv.w as Item, k = enchCost(); if (G.gold < k) { iMsg = "NEED " + k + " GOLD - YOU HAVE " + G.gold; beep(100, 0.1); return; }
      const pool = Object.keys(ENCH).filter((e: string): boolean => ENCH[e].k === "w"); let ne = pool[R(pool.length)];
      G.gold -= k; G.ench = (G.ench || 0) + 1;
      if (w.en.length < 2) { w.en.push(ne); iMsg = "ENCHANTED WITH " + ENCH[ne].n + "!"; }
      else { const j = R(2), old = w.en[j]; while (ne === old) ne = pool[R(pool.length)]; w.en[j] = ne; iMsg = ENCH[old].n + " REROLLED INTO " + ENCH[ne].n + "!"; }
      w.r = Math.max(w.r, w.en.length >= 2 ? 2 : 1); w.n = ENCH[w.en[0]].n + " " + ["SWORD", "STAFF", "DAGGER"][G.cls] + (w.en.length > 1 ? " OF " + ENCH[w.en[1]].n : "");
      iSel = 0; beep(523, 0.1, "triangle"); beep(1046, 0.2, "triangle");
    }
    ui();
  }
  function openUpg(from: string): void { ufrom = from; mode = "upg"; G.upSeen = 1; uc = 0; uMsg = from === "play" ? "REFUND ALL IS FREE BETWEEN FLOORS" : ""; ui(); }
  function closeUpg(): void {
    if (ufrom === "clear") { descend(); return; }
    if (ufrom === "title") { snap = JSON.stringify({ G, map, ents }); LS.set("dndF", snap); }
    mode = "play"; ui();
  }
  function curCard(): Card | null { const cs = myCards(ub); return cs.length ? cs[clamp(uc, 0, cs.length - 1)] : null; }
  function buy(): void {
    const c = curCard(); if (!c) return; const t = T(c.id);
    if (t >= c.max) { uMsg = c.n + " IS MAXED OUT"; beep(100, 0.1); return; }
    if (c.id === "relic" && G.floor < 6) { uMsg = "THE MERCHANT ARRIVES ON FLOOR 6"; beep(100, 0.1); return; }
    const k = cost(c, t); if (G.gold < k) { uMsg = "NEED " + k + " GOLD - YOU HAVE " + G.gold; beep(100, 0.1); return; }
    G.gold -= k; G.upg[c.id] = t + 1;
    if (c.id === "vit" || c.id === "relic") { const a = c.id === "vit" ? 4 : 3; G.mx += a; G.hp += a; } else if (c.id === "belt") G.pot++; else if (c.id === "knife") G.kn = 1 + T("knife"); else if (c.id === "mana") G.mp = Math.min(mpMax(), G.mp + 1);
    keepSnap(c.id);
    uMsg = c.n + " TIER " + (t + 1) + " BOUGHT!"; beep(660, 0.08); beep(990, 0.15, "triangle"); ui();
  }
  function keepSnap(id: string): void {
    if (!snap || ufrom === "clear") return;
    try { const o = JSON.parse(snap); o.G.upg = { ...G.upg }; o.G.gold = G.gold; o.G.up = 0; o.G.eq = G.eq; if (id === "vit") o.G.mx += 4; if (id === "belt") o.G.pot++; snap = JSON.stringify(o); LS.set("dndF", snap); } catch { /* ignore */ }
  }
  function equip(): void { const c = curCard(); if (!c || !c.eq || (c.id !== "fb" && !T(c.id))) return; G.eq = c.id; uMsg = c.n + " SELECTED FOR CAST"; beep(500, 0.08); ui(); }
  function refundAll(): void {
    if (ufrom === "play") { uMsg = "REFUND ALL ONLY BETWEEN FLOORS"; beep(100, 0.1); return; }
    let back = 0; for (const b of BR) for (const c of b.cards) { const t = T(c.id); for (let i = 0; i < t; i++) back += cost(c, i); }
    if (!back) { uMsg = "NOTHING TO REFUND"; return; }
    G.mx -= 4 * T("vit") + 3 * T("relic"); G.hp = Math.max(1, Math.min(G.hp, G.mx)); G.pot = Math.max(0, G.pot - T("belt"));
    G.gold += back; G.upg = {}; G.eq = "fb"; G.kn = 0; G.mp = Math.min(G.mp, mpMax());
    uMsg = "REFUNDED " + back + " GOLD - SPEND IT AGAIN"; beep(440, 0.1, "triangle"); ui();
  }
  function pickup(): void {
    for (const e of ents.slice()) {
      if (e.x !== G.x || e.y !== G.y) continue;
      if (e.t === "key") { G.keys[e.c]++; ents = ents.filter((o: Any): boolean => o !== e); say("GOT THE " + KNAME[e.c] + " KEY"); flt(G.x, G.y, "KEY!", "#ffd84a"); beep(880, 0.12, "triangle"); }
      else if (e.t === "pot") { G.pot++; ents = ents.filter((o: Any): boolean => o !== e); say("GOT A POTION (" + G.pot + ")"); flt(G.x, G.y, "+POTION", "#e0583c"); beep(700, 0.1, "triangle"); }
      else if (e.t === "gold") { e.v = Math.floor(e.v * (1 + 0.25 * T("gold"))); G.gold += e.v; G.fg = (G.fg || 0) + e.v; ents = ents.filter((o: Any): boolean => o !== e); say("FOUND " + e.v + " GOLD"); flt(G.x, G.y, "+" + e.v, "#ffd84a"); fx(G.x * TS + 8, G.y * TS + 8, 8, ["#ffd84a", "#fff6e0"], 1, true); beep(990, 0.08, "triangle"); }
      else if (e.t === "rest" && G.hp >= G.mx) say("YOU ARE AT FULL HP - THE CAMPFIRE WILL KEEP FOR LATER");
      else if (e.t === "rest") { const h = Math.max(1, Math.min(G.mx - G.hp, Math.ceil(G.mx * (0.5 + 0.1 * T("mend"))))); G.hp += h; ents = ents.filter((o: Any): boolean => o !== e); say("YOU REST BY THE CAMPFIRE: +" + h + " HP"); flt(G.x, G.y, "+" + h, "#a6e06a"); fx(G.x * TS + 8, G.y * TS + 8, 14, ["#ff9a3c", "#ffd84a", "#a6e06a"], 1, true); beep(520, 0.2, "triangle"); }
      else if (e.t === "trap") { const dm = Math.max(0, d(DIFF(G.floor).trapDmg) - 2 * T("ward") - 2 * enc("ward")); G.hp -= dm; e.sprung = 1; e.t = "sprung"; shake = 6; vib(80); flt(G.x, G.y, "-" + dm, "#e0583c"); fx(G.x * TS + 8, G.y * TS + 8, 10, ["#a7b4c0", "#e0583c"], 1.2, false); beep(120, 0.2, "sawtooth"); say("A SPIKE TRAP! -" + dm + " HP"); }
      else if (e.t === "torch") { G.torchI = 1; ents = ents.filter((o: Any): boolean => o !== e); say("GOT A TORCH! DARK ROOMS ON THIS FLOOR ARE LIT FOR YOU"); flt(G.x, G.y, "TORCH!", "#ffd84a"); beep(660, 0.1, "triangle"); }
      else if (e.t === "chest") {
        if (ents.some((o: Any): boolean => o.t === "mon" && o.guard && o.sid === e.sid)) { say("THE VAULT GUARD WATCHES THE CHEST - SLAY IT FIRST!"); flt(G.x, G.y, "GUARDED!", "#e0583c"); continue; }
        const q = G.sr[e.sid], it = rollItem(1, q && q.k === "vault" ? 0.1 : 0.04); ents = ents.filter((o: Any): boolean => o !== e);
        fx(G.x * TS + 8, G.y * TS + 8, 18, ["#ffd84a", "#fff6e0", RAR[it.r].c], 1.4, true); beep(784, 0.1, "triangle"); beep(1046, 0.2, "triangle");
        if (G.inv.bag.length < 8) { G.inv.bag.push(it); G.newI = 1; say("CHEST: " + RAR[it.r].n + " " + it.n + "! OPEN THE BAG (I) TO EQUIP IT"); flt(G.x, G.y, RAR[it.r].n + "!", RAR[it.r].c); }
        else { const v = scrapV(it); G.gold += v; G.fg = (G.fg || 0) + v; say("BAG FULL - " + it.n + " SOLD FOR " + v + " GOLD"); flt(G.x, G.y, "+" + v, "#ffd84a"); }
      }
      else if (e.t === "booth") { openInv(true); return; }
      else if (e.t === "stair") { const bo = ents.find((o: Any): boolean => o.t === "mon" && o.boss); if (bo) { say("THE " + MON[bo.n].n + " GUARDS THE STAIRS! SLAY IT FIRST."); flt(G.x, G.y, "GUARDED!", "#e0583c"); } else { nextFloor(); return; } }
      else if (e.t === "orb") {
        if (ents.some((o: Any): boolean => o.t === "mon" && o.boss)) { say("THE SHADOW KING GUARDS THE ORB! SLAY IT FIRST."); }
        else { mode = "win"; LS.del("dndF"); say("YOU HOLD THE ORB OF TARMIN!"); beep(523, 0.2, "triangle"); beep(784, 0.5, "triangle"); ui(); return; }
      }
    }
  }
  function move(dx: number, dy: number): void {
    if (dx) G.face = dx < 0 ? 1 : 0;
    const nx = G.x + dx, ny = G.y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
    const m = ents.find((e: Any): boolean => e.t === "mon" && e.x === nx && e.y === ny);
    if (m) { selA = "act"; strike(m); turn(); return; }
    const ob = ents.find((e: Any): boolean => e.x === nx && e.y === ny && (e.t === "blk" || e.t === "braz" || e.t === "lever"));
    if (ob) { interact(ob, dx, dy); return; }
    const t = map[ny][nx];
    if (t === 2) { const lg = ents.find((o: Any): boolean => o.t === "lgate" && o.x === nx && o.y === ny); say(lg ? "THE " + LNAME[lg.c] + " GATE - PULL THE " + LNAME[lg.c] + " LEVER TO OPEN IT" : "AN IRON GATE - SOLVE THIS ROOM'S PUZZLE TO OPEN IT"); bumpX = dx * 2; bumpY = dy * 2; beep(100, 0.1); return; }
    if (t >= 10) {
      const c = t - 10;
      if (G.keys[c] > 0) { G.keys[c]--; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (map[y][x] === t) map[y][x] = 0; say("UNLOCKED THE " + KNAME[c] + " DOOR"); fx(nx * TS + 8, ny * TS + 8, 14, ["#ffd84a", "#fff6e0"], 1.3, true); beep(600, 0.15, "triangle"); turn(); }
      else { say("LOCKED! YOU NEED THE " + KNAME[c] + " KEY"); bumpX = dx * 3; bumpY = dy * 3; beep(100, 0.1); }
      return;
    }
    if (t !== 0) { bumpX = dx * 2; bumpY = dy * 2; return; }
    G.x = nx; G.y = ny; G.moves++; if (G.floor === 3 && G.y >= 10) G.f3 = 1; roomMsg();
    const fl = G.floor; pickup(); if (mode !== "play" || G.floor !== fl) return; turn();
  }
  function roomMsg(): void {
    const q = roomAt(G.x, G.y); if (!q || q.seen) return; q.seen = 1;
    const m: Record<string, string> = { push: "PUSH ROOM: SHOVE EVERY BLOCK ONTO A PLATE TO OPEN THE GATE. STUCK? UNDO (Z) OR RESET (X) - SEE THE HOTBAR",
      lever: "LEVER ROOM: EACH LEVER OPENS THE GATE OF ITS COLOR. STAND BETWEEN TWO LEVERS TO PULL BOTH. MAKE THEM ALL GREEN",
      vault: "A GUARDED VAULT! MIND THE TRAPS - SLAY THE GUARD TO OPEN THE CHEST",
      dark: G.torchI ? "A DARK ROOM - YOUR TORCH LIGHTS THE WAY. LIGHT ALL 4 BRAZIERS" : "PITCH DARK! FIND THE TORCH ON THIS FLOOR, OR FEEL YOUR WAY AND LIGHT ALL 4 BRAZIERS",
      booth: "THE ENCHANTER'S BOOTH - STEP ON THE ANVIL TO ENCHANT YOUR WEAPON" };
    say(m[q.k]); flt(G.x, G.y, q.k === "booth" ? "ENCHANTER" : q.k === "vault" ? "VAULT" : "PUZZLE", "#ffd84a");
  }
  function solveRoom(sid: number): void {
    const q = G.sr[sid]; if (!q || q.done) return; q.done = 1; q.lit = 1;
    for (let y = q.y; y < q.y + q.h; y++) for (let x = q.x; x < q.x + q.w; x++) if (map[y][x] === 2) { map[y][x] = 0; fx(x * TS + 8, y * TS + 8, 14, ["#ffd84a", "#fff6e0"], 1.3, true); }
    pzStack = pzStack.filter((p: Any): boolean => p.sid !== sid);
    for (const o of ents) if (o.t === "plate" && o.sid === sid) o.on = 1;
    ents = ents.filter((o: Any): boolean => !(o.t === "blk" && o.sid === sid)); // blocks sink into their plates so they never trap you
    say("CLICK! THE IRON GATE SWINGS OPEN - CLAIM THE CHEST"); beep(523, 0.1, "triangle"); beep(784, 0.2, "triangle"); flt(G.x, G.y, "SOLVED!", "#a6e06a");
  }
  function interact(ob: Any, dx: number, dy: number): void {
    if (dx) G.face = dx < 0 ? 1 : 0;
    if (ob.t === "blk") {
      const bx = ob.x + dx, by = ob.y + dy;
      if (bx < 0 || by < 0 || bx >= W || by >= H || map[by][bx] !== 0 || ents.some((o: Any): boolean => o.x === bx && o.y === by && o.t !== "plate")) { say("THE BLOCK WON'T BUDGE - TRY UNDO (Z) OR RESET (X)"); bumpX = dx * 2; bumpY = dy * 2; beep(90, 0.08); return; }
      pzStack.push({ b: ob, x: ob.x, y: ob.y, hx: G.x, hy: G.y, sid: ob.sid }); ob.x = bx; ob.y = by; G.x += dx; G.y += dy; G.moves++; beep(160, 0.06, "square");
      const pl = ents.filter((o: Any): boolean => o.t === "plate" && o.sid === ob.sid);
      if (pl.every((p: Any): boolean => ents.some((o: Any): boolean => o.t === "blk" && o.x === p.x && o.y === p.y))) solveRoom(ob.sid);
      else if (pl.some((p: Any): boolean => p.x === bx && p.y === by)) { flt(bx, by, "CLUNK", "#ffd84a"); beep(400, 0.06, "triangle"); }
      turn(); return;
    }
    if (ob.t === "braz") {
      if (ob.lit) { say("THIS BRAZIER IS ALREADY LIT"); return; }
      ob.lit = 1; fx(ob.x * TS + 8, ob.y * TS + 6, 14, ["#ff9a3c", "#ffd84a"], 1.2, true); beep(300, 0.12, "triangle");
      const bz = ents.filter((o: Any): boolean => o.t === "braz" && o.sid === ob.sid), n = bz.filter((o: Any): boolean => o.lit).length;
      say("BRAZIER LIT (" + n + "/" + bz.length + ")"); if (n === bz.length) solveRoom(ob.sid); reveal(); turn(); return;
    }
    if (ob.t === "lever") {
      const q = G.sr[ob.sid]; if (q && q.done) { say("THE LEVERS ARE LOCKED IN PLACE - THE GATE IS OPEN"); return; }
      // Pull every lever of this room touching the hero: one lever in front = just that one; standing between two = both.
      const pulled = ents.filter((o: Any): boolean => o.t === "lever" && o.sid === ob.sid && Math.abs(o.x - G.x) + Math.abs(o.y - G.y) === 1);
      if (!pulled.includes(ob)) pulled.push(ob);
      for (const o of pulled) { o.on = o.on ? 0 : 1; flt(o.x, o.y, LNAME[o.c] + (o.on ? " OPEN" : " SHUT"), LCOL[o.c]); }
      syncGates(ob.sid); beep(220, 0.06, "square"); const lv = ents.filter((o: Any): boolean => o.t === "lever" && o.sid === ob.sid);
      say("CLACK! " + pulled.map((o: Any): string => LNAME[o.c] + " GATE " + (o.on ? "OPEN" : "SHUT")).join(", "));
      if (lv.every((o: Any): boolean => o.on)) solveRoom(ob.sid); turn();
    }
  }
  const pzRoom = (): Any => { const q = roomAt(G.x, G.y); return q && q.k === "push" && !q.done ? q : null; };
  function undoPush(): void {
    const q = pzRoom(), sid = q ? G.sr.indexOf(q) : -1, i = pzStack.map((p: Any): number => p.sid).lastIndexOf(sid);
    if (i < 0) { say("NOTHING TO UNDO HERE"); beep(100, 0.08); return; }
    const p = pzStack.splice(i, 1)[0]; p.b.x = p.x; p.b.y = p.y; G.x = p.hx; G.y = p.hy; say("UNDO - BLOCK MOVED BACK"); beep(330, 0.05);
  }
  function resetRoom(): void {
    const q = pzRoom(); if (!q) { say("RESET WORKS INSIDE AN UNSOLVED PUSH ROOM"); return; }
    const sid = G.sr.indexOf(q); for (const o of ents) if (o.t === "blk" && o.sid === sid) { o.x = o.ox; o.y = o.oy; }
    pzStack = pzStack.filter((p: Any): boolean => p.sid !== sid); G.x = q.ex; G.y = q.ey; say("ROOM RESET - BLOCKS ARE BACK WHERE THEY STARTED"); beep(260, 0.1, "triangle"); reveal();
  }
  function act(): void {
    selA = "act";
    const dirs = [[G.face ? -1 : 1, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dy] of dirs) { const m = ents.find((e: Any): boolean => e.t === "mon" && e.x === G.x + dx && e.y === G.y + dy); if (m) { if (dx) G.face = dx < 0 ? 1 : 0; strike(m); turn(); return; } }
    say("NOTHING TO HIT - YOU WAIT"); turn();
  }
  function brace(): void { selA = "alt"; G.brace = 1; say("YOU BRACE: +" + (4 + 2 * T("guard")) + " AC UNTIL THE MONSTERS MOVE"); flt(G.x, G.y, "BRACE", "#7fd0f0"); beep(260, 0.1, "triangle"); turn(); }
  function selSpell(id: string): void {
    const p = SPELLS.find((q: typeof SPELLS[number]): boolean => q.id === id); if (!G || !CL[G.cls].spell || !p) return;
    if (!owned().includes(p)) { say(p.n + " IS NOT LEARNED YET - BUY IT IN UPGRADES"); beep(100, 0.1); ui(); return; }
    G.eq = id; selA = "sp:" + id; say(p.n + " SELECTED - CAST USES " + p.mc + " MANA, RANGE " + p.rg(T(id))); beep(520, 0.05); ui();
  }
  function spell(id?: string): void {
    if (!CL[G.cls].spell) { if (G.cls === 2 && T("knife")) throwKnife(); else brace(); return; }
    if (id) { const p = SPELLS.find((q: typeof SPELLS[number]): boolean => q.id === id); if (!p || !owned().includes(p)) { say((p ? p.n : "THAT SPELL") + " IS NOT LEARNED YET - BUY IT IN UPGRADES"); beep(100, 0.1); return; } G.eq = id; }
    const sp = curSp(), mc = sp === "chain" ? 2 : 1; selA = "sp:" + sp;
    if (G.mp < mc) { say("NOT ENOUGH MANA (" + mc + " NEEDED). A KILL GIVES 1, A NEW FLOOR REFILLS"); beep(100, 0.1); return; }
    G.mp -= mc; const cx0 = G.x * TS + 8, cy0 = G.y * TS + 8;
    if (sp === "frost") {
      const t = T("frost"), rad = t >= 3 ? 2 : 1; shake = 3; beep(900, 0.2, "triangle"); beep(1200, 0.25, "sine");
      for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, v = 0.5 + Math.random() * 1.8 * rad; parts.push({ x: cx0, y: cy0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 18 + R(14), ml: 32, c: ["#7fd0f0", "#cfe8f0", "#fff6e0", "#3b7fc4"][R(4)], s: 1 + R(2), glow: true, g: 0 }); }
      const tg = ents.filter((e: Any): boolean => e.t === "mon" && Math.max(Math.abs(e.x - G.x), Math.abs(e.y - G.y)) <= rad);
      say(tg.length ? "FROST NOVA FREEZES " + tg.length + " FOE" + (tg.length > 1 ? "S" : "") + " (" + G.mp + " MANA LEFT)" : "FROST NOVA! NOTHING NEARBY (" + G.mp + " MANA LEFT)");
      for (const e of tg) { const dm = d(t >= 3 ? 8 : 6); e.hp -= dm; e.fl = 12; e.frz = Math.min(2, t); flt(e.x, e.y, dm + " ICE", "#7fd0f0"); if (e.hp <= 0) kill(e, " BY FROST"); }
    } else if (sp === "chain") {
      const t = T("chain"); flash = 6; beep(1400, 0.08, "square"); beep(700, 0.2, "sawtooth");
      const hit: Any[] = []; let px0 = G.x, py0 = G.y, rg = 6;
      for (let j = 0; j <= t; j++) {
        const cur = ents.filter((e: Any): boolean => e.t === "mon" && !hit.includes(e) && near(e.x, e.y) && Math.max(Math.abs(e.x - px0), Math.abs(e.y - py0)) <= rg).sort((p: Any, q: Any): number => Math.hypot(p.x - px0, p.y - py0) - Math.hypot(q.x - px0, q.y - py0))[0];
        if (!cur) break; hit.push(cur); zap(px0, py0, cur.x, cur.y, ["#ffd84a", "#fff6e0", "#cfe8ff"]);
        const dm = d(10) + (t >= 3 ? 2 : 0); cur.hp -= dm; cur.fl = 12; flt(cur.x, cur.y, "" + dm, "#ffd84a"); px0 = cur.x; py0 = cur.y; rg = 3;
        if (cur.hp <= 0) kill(cur, " BY LIGHTNING");
      }
      say(hit.length ? "LIGHTNING CHAINS THROUGH " + hit.length + " FOE" + (hit.length > 1 ? "S" : "") + " (" + G.mp + " MANA LEFT)" : "LIGHTNING CRACKLES - NO TARGET (" + G.mp + " MANA LEFT)");
    } else {
      const t = T("fb"), rg = fbR(t); flash = 14; shake = 4; beep(200, 0.3, "sawtooth"); beep(90, 0.4, "square");
      for (let i = 0; i < 90; i++) { const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 2.6 * rg / 3; parts.push({ x: cx0, y: cy0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 22 + R(16), ml: 38, c: ["#ff9a3c", "#e05a20", "#ffd84a", "#fff6e0"][R(4)], s: 1 + R(3), glow: true, g: -0.02 }); }
      const tg = ents.filter((e: Any): boolean => e.t === "mon" && Math.max(Math.abs(e.x - G.x), Math.abs(e.y - G.y)) <= rg);
      if (!tg.length) say("FIREBALL! IT HITS NOTHING (" + G.mp + " MANA LEFT)");
      for (const e of tg) { const dm = d(8) + 2 * t; e.hp -= dm; e.fl = 12; flt(e.x, e.y, "" + dm, "#ff9a3c"); fx(e.x * TS + 8, e.y * TS + 8, 12, ["#ff9a3c", "#ffd84a"], 1.5, true); say("FIREBALL BURNS " + (e.dummy ? "DUMMY" : MON[e.n].n) + " FOR " + dm); if (e.hp <= 0) kill(e, " BY FIRE"); }
    }
    turn();
  }
  function throwKnife(): void {
    selA = "alt"; const t = T("knife");
    if (G.kn < 1) { say("NO KNIVES LEFT - YOU GET " + (1 + t) + " EACH FLOOR"); beep(100, 0.1); return; }
    const rg = 3 + t;
    const tg = ents.filter((e: Any): boolean => e.t === "mon" && near(e.x, e.y) && seen[e.y][e.x] === 1 && Math.max(Math.abs(e.x - G.x), Math.abs(e.y - G.y)) <= rg).sort((p: Any, q: Any): number => Math.hypot(p.x - G.x, p.y - G.y) - Math.hypot(q.x - G.x, q.y - G.y))[0];
    if (!tg) { say("NO TARGET IN KNIFE RANGE (" + rg + " TILES)"); beep(100, 0.1); return; }
    G.kn--; if (tg.x !== G.x) G.face = tg.x < G.x ? 1 : 0; zap(G.x, G.y, tg.x, tg.y, ["#eef3f6", "#a7b4c0"]); beep(1100, 0.06, "square");
    const r = d(20), bon = CL[G.cls].atk + (T("aim") + T("relic")), ac2 = tg.ac ?? MON[tg.n].ac, nm = tg.dummy ? "DUMMY" : MON[tg.n].n;
    if (r === 20 || (r !== 1 && r + bon >= ac2)) {
      const dm = d(6) + t - 1 + T("might"); tg.hp -= dm; tg.fl = 10; if (T("dag") >= 1) { tg.psn = 3; tg.pd = T("dag") >= 3 ? 3 : 2; }
      flt(tg.x, tg.y, "" + dm, "#fff6e0"); say("KNIFE D20:" + r + "+" + bon + "=" + (r + bon) + " VS AC " + ac2 + " HITS " + nm + " FOR " + dm + " (" + G.kn + " LEFT)");
      if (tg.hp <= 0) kill(tg, " BY KNIFE");
    } else { flt(tg.x, tg.y, "MISS", "#a7b4c0"); say("KNIFE D20:" + r + "+" + bon + "=" + (r + bon) + " VS AC " + ac2 + " MISSES (" + G.kn + " LEFT)"); }
    turn();
  }
  function quaff(): void {
    selA = "pot";
    if (G.pot < 1) { say("NO POTIONS LEFT"); return; }
    if (G.hp >= G.mx) { say("ALREADY AT FULL HP"); return; }
    G.pot--; const h = d(8) + 4 + 2 * T("mend"); G.hp = Math.min(G.mx, G.hp + h); G.drank = 1; say("GLUG! +" + h + " HP"); flt(G.x, G.y, "+" + h, "#a6e06a"); fx(G.x * TS + 8, G.y * TS + 8, 12, ["#a6e06a", "#fff6e0"], 1, true); beep(520, 0.15, "triangle"); turn();
  }
  function wait(): void { selA = "wait"; say("YOU WAIT A TURN"); turn(); }
  function hotSlots(): { ic: string; n: string; a: string }[] {
    const wz = !!CL[G.cls].spell, thr = G.cls === 2 && T("knife") > 0;
    const mid = wz ? owned().map((p: typeof SPELLS[number]): { ic: string; n: string; a: string } => ({ ic: p.ic, n: p.mc + "", a: "sp:" + p.id })) : [{ ic: thr ? "w:knife" : "shield", n: thr ? "" + G.kn : "", a: "alt" }];
    return [{ ic: weaponIc(), n: "", a: "act" }, ...mid, { ic: "pot", n: "" + G.pot, a: "pot" }, { ic: "hour", n: "", a: "wait" }, { ic: "k0", n: "" + G.keys[0], a: "k0" }, { ic: "k1", n: "" + G.keys[1], a: "k1" }, { ic: "k2", n: "" + G.keys[2], a: "k2" }, ...(pzRoom() ? [{ ic: "o:undo", n: "", a: "undo" }, { ic: "o:reset", n: "", a: "reset" }] : []), { ic: "o:bag", n: "" + G.inv.bag.length, a: "inv" }, { ic: "u:star", n: "", a: "upg" }];
  }
  function useSlot(i: number): void {
    const sl = hotSlots()[i]; if (!sl) return; const a = sl.a;
    if (a === "act") act(); else if (a.startsWith("sp:")) spell(a.slice(3)); else if (a === "alt") spell(); else if (a === "pot") quaff(); else if (a === "wait") wait(); else if (a === "upg") openUpg("play"); else if (a === "inv") openInv(false); else if (a === "undo") undoPush(); else if (a === "reset") resetRoom();
    else { selA = a; const c = +a[1]; say(G.keys[c] ? "WALK INTO A " + KNAME[c] + " DOOR TO USE THIS KEY" : "NO " + KNAME[c] + " KEY YET"); }
  }
  function hintText(): string {
    if (!G || !G.tut || mode !== "play") return "";
    const wiz = !!CL[G.cls].spell, mon = (n: string): Any => ents.find((e: Any): boolean => e.t === "mon" && e.n === n);
    const has = (t: string): boolean => ents.some((e: Any): boolean => e.t === t);
    const door = (c: number): boolean => map.some((r: number[]): boolean => r.includes(10 + c));
    let h = "";
    if (G.train) {
      if (G.moves < 2) h = "Walk with the D-pad on the left (or arrow keys). Monsters only move when you do.";
      else if (mon("gob")) h = wiz ? "Walk into the dummy to hit it with your staff - or tap CAST FIRE to cast a Fireball (costs 1 mana)." : "Walk into the dummy, or stand next to it and tap ACT. The dice rolls appear below.";
      else if (has("key")) h = "Pick up the RED key - it shows in your hotbar.";
      else if (door(0)) h = "Walk into the RED door to unlock it with your key.";
      else h = "Step on the stairs to finish training.";
    } else if (G.floor === 1) {
      if (G.moves < 3) h = "Welcome to Floor 1! Walk with the D-pad or arrow keys. Hold a direction to keep walking.";
      else if (!G.drank && G.pot > 0 && G.hp < G.mx) h = "You are hurt - see the HP bar, bottom right. Tap POTION (or press Q) to drink one.";
      else if (has("pot")) h = "Walk onto the potion bottle to pick it up. The hotbar shows how many you carry.";
      else if (mon("gob")) h = "That goblin is a training dummy. Walk into it to attack!";
      else if (!G.upSeen && G.gold >= GP) h = "Spend gold in UPGRADES! You have " + G.gold + " gold - tap the star slot or press U.";
      else h = "Well done! Walk onto the stairs to go down to Floor 2.";
    } else if (G.floor === 2) {
      if (G.gold >= GP && G.upSeen < 2) h = "Spend gold in UPGRADES (star slot or U): more HP, armor or new " + (wiz ? "spells" : "weapons") + ". You have " + G.gold + " gold.";
      else if (has("key")) h = "A RED door blocks the way east. Grab the RED key in this room first.";
      else if (mon("skel")) h = wiz ? "A real Skeleton - it fights back! Fireball it (1 mana) or melee. Watch the dice below." : "A real Skeleton - it fights back! Low on HP? BRACE (+4 AC) or drink a potion.";
      else if (door(0)) h = "Now walk into the RED door to unlock it.";
      else h = "Gold is your score - grab it, then find the stairs.";
    } else if (G.floor === 3) {
      if (!G.f3) h = "Fog of war: dim tiles were seen before, black is unexplored. Explore south!";
      else if (has("key")) h = "Find the BLUE key for the BLUE door. Something big lurks nearby...";
      else if (mon("orc")) h = wiz ? "An Orc! Fireball hits everything within 3 tiles." : "An Orc hits hard. BRACE before it reaches you, and drink if low.";
      else if (door(1)) h = "Unlock the BLUE door, then find the stairs.";
      else h = "Last hint: take the stairs. From here on you are on your own - good luck!";
    }
    return G.hideHint === h ? "" : h;
  }

  const rr = (x: number, y: number, w: number, h: number, r: number): void => { X.beginPath(); X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r); X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath(); };
  function panel(x: number, y: number, w: number, h: number, fill = "#f6deb0"): void {
    rr(x, y, w, h, 4); X.fillStyle = "#3b2212"; X.fill();
    rr(x + 1, y + 1, w - 2, h - 2, 3); X.fillStyle = "#b8672e"; X.fill();
    rr(x + 2, y + 2, w - 4, h - 4, 2); X.fillStyle = "#e8a24f"; X.fill();
    rr(x + 3, y + 3, w - 6, h - 6, 2); X.fillStyle = fill; X.fill();
  }
  function txt(s: string, x: number, y: number, c: string, size = 7, al: CanvasTextAlign = "left", sh: string | null = "rgba(60,30,10,0.35)"): void {
    X.font = FONT(size); X.textAlign = al; X.textBaseline = "alphabetic";
    if (sh) { X.fillStyle = sh; X.fillText(s, x + 0.6, y + 0.6); }
    X.fillStyle = c; X.fillText(s, x, y);
  }
  function outl(s: string, x: number, y: number, c: string, size: number, al: CanvasTextAlign = "center"): void {
    X.font = FONT(size); X.textAlign = al; X.textBaseline = "alphabetic"; X.lineJoin = "round"; X.lineWidth = size / 4; X.strokeStyle = "#2a1408"; X.strokeText(s, x, y); X.fillStyle = c; X.fillText(s, x, y);
  }
  function wrap(s: string, w: number, size: number): string[] {
    X.font = FONT(size); const out: string[] = [];
    for (const para of s.split("|")) { let line = ""; for (const wd of para.split(" ")) { const t = line ? line + " " + wd : wd; if (X.measureText(t).width > w && line) { out.push(line); line = wd; } else line = t; } out.push(line); }
    return out;
  }
  const spr = (c: Cv, x: number, y: number, flip = false, sc = 1): void => {
    if (flip) { X.save(); X.translate(Math.round(x) + 16 * sc, Math.round(y)); X.scale(-1, 1); X.drawImage(c, 0, 0, 16 * sc, 16 * sc); X.restore(); }
    else X.drawImage(c, Math.round(x), Math.round(y), 16 * sc, 16 * sc);
  };
  const glow = (x: number, y: number, r: number, col: string, a: number): void => {
    X.save(); X.globalCompositeOperation = "lighter"; const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); X.globalAlpha = a; X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); X.restore();
  };
  function heroSprite(c: number): Cv[] { return SP[CL[c].art]; }

  function glyph(n: string, x: number, y: number): void {
    const P = (c: string, a: number, b: number, w = 1, h = 1): void => px(X, c, x + a, y + b, w, h);
    const K0 = "#2a1a10";
    const sword = (bl: string, ed: string): void => { P(K0, 6, 0, 4, 11); P(bl, 7, 1, 2, 9); P(ed, 7, 1, 1, 9); P(K0, 3, 10, 10, 3); P("#e0a030", 4, 11, 8, 1); P("#5a3a22", 7, 12, 2, 3); P("#e0a030", 7, 15, 2, 1); };
    switch (n) {
      case "w:sword": sword("#a7b4c0", "#eef3f6"); break;
      case "w:staff": P(K0, 6, 3, 4, 13); P("#8a5a32", 7, 4, 2, 11); P("#b8763c", 7, 4, 1, 11); P(K0, 4, 0, 8, 5); P("#7fd0f0", 5, 1, 6, 3); P("#cfe8ff", 6, 1, 2, 1); break;
      case "w:flame": { sword("#ff9a3c", "#ffd84a"); const f = (anim >> 3) & 1; P("#e05a20", 5, 2 + f, 1, 3); P("#ff9a3c", 10, 4 - f, 1, 3); P("#ffd84a", 4, 6, 1, 2); P("#e05a20", 11, 7 + f, 1, 2); break; }
      case "w:axe": case "w:cleave": P(K0, 6, 1, 4, 15); P("#8a5a32", 7, 2, 2, 13); P(K0, 8, 1, 7, 8); P("#a7b4c0", 9, 2, 5, 6); P("#eef3f6", 13, 2, 1, 6); P("#6a7a8c", 9, 7, 5, 1); if (n === "w:cleave") { P("#fff6e0", 1, 4, 1, 6); P("#fff6e0", 2, 2, 1, 2); P("#fff6e0", 2, 10, 1, 2); } break;
      case "w:dagger": case "w:pdag": P(K0, 6, 2, 4, 9); P("#a7b4c0", 7, 3, 2, 7); P("#eef3f6", 7, 3, 1, 7); P(K0, 4, 10, 8, 2); P("#e0a030", 5, 10, 6, 1); P("#5a3a22", 7, 12, 2, 3); if (n === "w:pdag") { P("#6ab04c", 9, 4, 1, 4); P("#a6e06a", 9, 8, 1, 2); P("#a6e06a", 10, 11, 1, 1); } break;
      case "w:twin": for (let i = 0; i < 8; i++) { P("#a7b4c0", 2 + i, 2 + i, 2, 1); P("#eef3f6", 12 - i, 2 + i, 2, 1); } P("#5a3a22", 10, 10, 3, 3); P("#5a3a22", 3, 10, 3, 3); P("#6ab04c", 7, 6, 2, 1); break;
      case "w:knife": P(K0, 2, 6, 13, 4); P("#a7b4c0", 3, 7, 8, 2); P("#eef3f6", 3, 7, 8, 1); P("#5a3a22", 11, 7, 3, 2); P("#a7b4c0", 0, 4, 3, 1); P("#a7b4c0", 0, 11, 3, 1); break;
      case "w:fire": P("#e05a20", 1, 2, 3, 3); P("#ff9a3c", 2, 1, 2, 2); P("#e05a20", 4, 5, 9, 9); P("#ff9a3c", 5, 6, 7, 7); P("#ffd84a", 7, 8, 3, 3); P("#fff6e0", 8, 9, 1, 1); break;
      case "w:frost": P("#3b7fc4", 7, 1, 2, 14); P("#3b7fc4", 1, 7, 14, 2); P("#7fd0f0", 7, 2, 2, 12); P("#7fd0f0", 2, 7, 12, 2); for (const [a, b] of [[4, 4], [10, 4], [4, 10], [10, 10]]) P("#cfe8f0", a, b, 2, 2); P("#fff6e0", 7, 7, 2, 2); break;
      case "w:bolt": P("#b8661f", 8, 0, 5, 3); P("#b8661f", 5, 3, 6, 4); P("#b8661f", 3, 6, 10, 3); P("#b8661f", 6, 9, 5, 3); P("#b8661f", 4, 12, 4, 3); P("#ffd84a", 9, 1, 3, 1); P("#ffd84a", 6, 4, 4, 2); P("#ffd84a", 4, 7, 8, 1); P("#ffd84a", 7, 10, 3, 1); P("#fff6e0", 5, 13, 2, 1); break;
      case "u:heart": P(K0, 2, 3, 12, 9); P("#e0583c", 3, 4, 4, 3); P("#e0583c", 9, 4, 4, 3); P("#e0583c", 3, 6, 10, 3); P("#e0583c", 4, 9, 8, 2); P("#e0583c", 6, 11, 4, 2); P("#e0583c", 7, 13, 2, 1); P("#ffb0a0", 4, 5, 2, 1); break;
      case "u:boot": P(K0, 4, 2, 6, 10); P("#8a5a32", 5, 3, 4, 8); P(K0, 4, 10, 10, 4); P("#8a5a32", 5, 11, 8, 2); P("#3b2212", 5, 13, 9, 1); P("#c99058", 5, 3, 4, 1); break;
      case "u:mana": P(K0, 5, 1, 6, 14); P("#3b7fc4", 6, 2, 4, 12); P("#7fd0f0", 5, 5, 6, 6); P("#cfe8f0", 7, 4, 1, 4); break;
      case "u:belt": P("#5a3a22", 0, 9, 16, 4); P("#8a5a32", 1, 10, 14, 2); P("#ffd84a", 6, 8, 4, 6); P("#5a3a22", 7, 10, 2, 2); P("#e0583c", 2, 5, 2, 4); P("#e0583c", 12, 5, 2, 4); P("#eef3f6", 2, 4, 2, 1); P("#eef3f6", 12, 4, 2, 1); break;
      case "u:star": P("#b8661f", 7, 1, 2, 14); P("#b8661f", 1, 6, 14, 3); P("#ffd84a", 7, 2, 2, 12); P("#ffd84a", 2, 7, 12, 1); P("#ffd84a", 4, 4, 8, 7); P("#fff6e0", 6, 5, 2, 2); break;
      case "u:aim": P(K0, 2, 2, 12, 12); P("#e0583c", 3, 3, 10, 10); P("#f6deb0", 5, 5, 6, 6); P("#e0583c", 7, 7, 2, 2); break;
      case "u:brace": spr(SP.shield[0], x, y); P("#7fd0f0", 12, 1, 3, 1); P("#7fd0f0", 13, 0, 1, 3); break;
      case "u:torch": drawTorch(x, y); break;
      case "u:potion": spr(SP.pot[0], x, y); break;
      case "u:shield": spr(SP.shield[0], x, y); break;
      case "u:sword": spr(SP.sword[0], x, y); break;
      case "u:coin": spr(SP.coin[0], x, y); break;
      default: break;
    }
  }
  function drawObj(n: string, x: number, y: number, on: boolean, col?: string): void {
    const P = (c: string, a: number, b: number, w = 1, h = 1): void => px(X, c, x + a, y + b, w, h), K0 = "#2a1a10";
    if (n === "chest") { P(K0, 1, 4, 14, 11); P("#8a4a22", 2, 5, 12, 9); P("#b8672e", 2, 5, 12, 3); P(K0, 2, 8, 12, 1); P("#ffd84a", 7, 7, 2, 3); P("#e0a030", 2, 11, 12, 1); P("#5a3a22", 3, 13, 10, 1); }
    else if (n === "booth") { P(K0, 2, 6, 12, 5); P("#6a7a8c", 3, 7, 10, 3); P("#a7b4c0", 3, 7, 10, 1); P(K0, 6, 11, 4, 4); P("#4a5866", 6, 11, 4, 3); P(K0, 3, 14, 10, 2); P("#ff9a3c", 9 + ((anim >> 3) & 1), 3, 1, 1); P("#ffd84a", 7, 4 + ((anim >> 4) & 1), 1, 1); P("#a050d0", 12, 2, 2, 2); }
    else if (n === "blk") { P(K0, 1, 1, 14, 14); P("#8a8f98", 2, 2, 12, 12); P("#b4bac2", 2, 2, 12, 2); P("#5a5f68", 2, 12, 12, 2); P("#6a7078", 5, 6, 6, 1); P("#6a7078", 7, 9, 5, 1); }
    else if (n === "plate") { P(K0, 2, 4, 12, 9); P(on ? "#ffd84a" : "#7a7f88", 3, 5, 10, 7); P(on ? "#fff3cf" : "#a7b4c0", 3, 5, 10, 1); P(K0, 6, 8, 4, 1); }
    else if (n === "lever") { P(K0, 2, 10, 12, 6); P(col || "#6a7a8c", 3, 11, 10, 4); P("#fff6e0", 7, 12, 2, 2); const lx = on ? 10 : 4; P(K0, on ? 8 : 5, 5, 3, 7); P("#8a5a32", on ? 9 : 6, 6, 1, 6); P(K0, lx - 1, 2, 4, 4); P(on ? "#6ab04c" : "#e0583c", lx, 3, 2, 2); }
    else if (n === "braz") { P(K0, 3, 8, 10, 4); P("#6a5a4a", 4, 9, 8, 2); P(K0, 7, 12, 2, 3); P(K0, 4, 14, 8, 2); if (on) { const f = (anim >> 3) & 1; P("#e05a20", 5, 4 + f, 6, 5 - f); P("#ff9a3c", 6, 3, 4, 5); P("#ffd84a", 7, 4 + f, 2, 3); } else P("#3b3530", 5, 7, 6, 1); }
    else if (n === "torch") { P(K0, 7, 6, 3, 9); P("#8a5a32", 8, 7, 1, 8); const f = (anim >> 3) & 1; P("#e05a20", 6, 2 + f, 5, 5 - f); P("#ffd84a", 7, 3 + f, 3, 3); }
    else if (n === "gate") { P(K0, 1, 1, 14, 2); for (let i = 0; i < 4; i++) { P(K0, 2 + i * 4, 1, 2, 15); P("#8a8f98", 2 + i * 4, 2, 1, 13); } P(K0, 1, 8, 14, 2); P("#6a7078", 1, 8, 14, 1); }
    else if (n === "bag") { P(K0, 4, 4, 8, 11); P(K0, 3, 7, 10, 7); P("#b8672e", 4, 7, 8, 7); P("#d08a4a", 5, 5, 6, 2); P(K0, 6, 2, 4, 3); P("#ffd84a", 7, 9, 2, 2); }
    else if (n === "amulet") { P(K0, 4, 1, 8, 1); P(K0, 3, 2, 1, 5); P(K0, 12, 2, 1, 5); P(K0, 4, 7, 8, 1); P(K0, 5, 8, 6, 7); P("#e0a030", 6, 9, 4, 5); P("#a050d0", 7, 10, 2, 3); }
    else if (n === "undo" || n === "reset") {
      P(K0, 3, 4, 10, 8); P(n === "undo" ? "#9fd0f0" : "#f4a3b5", 4, 5, 8, 6);
      if (n === "undo") { P(K0, 5, 7, 6, 2); P(K0, 6, 6, 1, 4); P(K0, 7, 5, 1, 1); P(K0, 7, 10, 1, 1); } else { P(K0, 6, 6, 4, 1); P(K0, 6, 9, 4, 1); P(K0, 5, 7, 1, 2); P(K0, 10, 7, 1, 2); P(K0, 9, 5, 2, 1); }
    }
  }
  function drawItem(it: Item | null, x: number, y: number, s: number, on: boolean, lbl: string): void {
    panel(x, y, s, s, on ? "#fff3cf" : it ? "#f6deb0" : "#c9a87a");
    if (it) { X.strokeStyle = RAR[it.r].c; X.lineWidth = 1.5; X.strokeRect(x + 2.5, y + 2.5, s - 5, s - 5); }
    if (on) { X.strokeStyle = "#e0583c"; X.lineWidth = 1.5; X.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1); }
    const ix = Math.round(x + s / 2 - 8), iy = Math.round(y + s / 2 - 9);
    if (it) { if (it.k === "w") glyph(["w:sword", "w:staff", "w:dagger"][G.cls], ix, iy); else if (it.k === "a") spr(SP.shield[0], ix, iy); else drawObj("amulet", ix, iy, true);
      it.en.forEach((e: string, j: number): void => { px(X, "#2a1a10", x + 3 + j * 5, y + s - 7, 5, 5); px(X, ENCH[e].c, x + 4 + j * 5, y + s - 6, 3, 3); }); }
    else if (lbl) txt(lbl, x + s / 2, y + s / 2 + 2, "#8a6a4a", 5, "center", null);
  }
  function drawInv(): void {
    for (let y = 0; y < LH; y += 12) { X.fillStyle = (y / 12) % 2 ? "#3a2a3e" : "#443248"; X.fillRect(0, y, LW, 12); }
    panel(2, 2, LW - 4, 18); outl(iBooth ? "ENCHANTER'S BOOTH" : "INVENTORY", 8, 15, "#ffd84a", 9, "left");
    const gs = fmtN(G.gold) + " GOLD"; X.font = FONT(8); const gw0 = X.measureText(gs).width;
    panel(LW - gw0 - 28, 3, gw0 + 24, 16, "#ffe9a8"); X.drawImage(SP.coin[0], LW - gw0 - 25, 5, 12, 12); txt(gs, LW - 8, 14, "#8a5a10", 8, "right", null);
    const side = LW >= 250, s = clamp(Math.floor(((side ? LW * 0.48 : LW) - 12) / 4) - 3, 18, 28), gap = 3;
    invR = { slots: [], btn: [] };
    const lx = 6; let y = 24;
    txt("EQUIPPED", lx, y + 6, "#f6deb0", 6, "left", null); y += 9;
    ["w", "a", "t"].forEach((k: string, i: number): void => { const x = lx + i * (s + gap); drawItem(G.inv[k], x, y, s, iSel === i, SLOTN[k]); invR.slots.push([x, y, s, s, i]); });
    y += s + 4; txt("BAG " + G.inv.bag.length + "/8", lx, y + 6, "#f6deb0", 6, "left", null); y += 9;
    for (let i = 0; i < 8; i++) { const x = lx + (i % 4) * (s + gap), yy = y + Math.floor(i / 4) * (s + gap); drawItem(G.inv.bag[i] || null, x, yy, s, iSel === i + 3, ""); invR.slots.push([x, yy, s, s, i + 3]); }
    y += 2 * (s + gap) + 2;
    const dx = side ? lx + 4 * (s + gap) + 4 : 4, dy = side ? 24 : y, dw = LW - dx - 4, dh = LH - dy - 4;
    panel(dx, dy, dw, dh, "#fff3cf");
    const it = selItem(); let ty = dy + 12; const tw = dw - 12;
    if (it) {
      fitTxt(it.n, dx + 6, ty, RAR[it.r].c, 7, "left", tw); ty += 8;
      txt(RAR[it.r].n + " " + SLOTN[it.k] + " - " + fmtB(it), dx + 6, ty, "#4a2a14", 6, "left", null); ty += 9;
      for (const e of it.en) { px(X, "#2a1a10", dx + 6, ty - 6, 7, 7); px(X, ENCH[e].c, dx + 7, ty - 5, 5, 5); const ln = wrap(ENCH[e].n + ": " + ENCH[e].d, tw - 10, 5); ln.slice(0, 2).forEach((l: string, j: number): void => txt(l, dx + 16, ty + j * 6, "#4a2a14", 5, "left", null)); ty += 6 * Math.min(2, ln.length) + 2; }
      if (!it.en.length) { txt("NO ENCHANTMENTS", dx + 6, ty, "#8a6a4a", 5, "left", null); ty += 7; }
    } else { txt(iSel < 3 ? "EMPTY " + SLOTN[["w", "a", "t"][iSel]] + " SLOT" : "EMPTY BAG SLOT", dx + 6, ty, "#8a6a4a", 6, "left", null); ty += 8; wrap("OPEN CHESTS IN VAULTS AND PUZZLE ROOMS FOR GEAR. TAP AN ITEM TO SEE IT.", tw, 5).slice(0, 3).forEach((l: string): void => { txt(l, dx + 6, ty, "#8a6a4a", 5, "left", null); ty += 6; }); }
    const bh = 15, bs: [string, string, string][] = [];
    if (iBooth) { const w = G.inv.w as Item; bs.push([w.en.length < 2 ? "ENCHANT WEAPON " + enchCost() + "G" : "REROLL ENCHANT " + enchCost() + "G", "ench", G.gold >= enchCost() ? "#ffd84a" : "#c9b48a"]); }
    if (it && iSel >= 3) { bs.push(["EQUIP", "equip", "#8cc94f"]); bs.push(["SCRAP +" + scrapV(it) + "G", "scrap", "#f4a3b5"]); }
    else if (it && iSel < 3 && it.k !== "w") bs.push(["UNEQUIP", "unequip", "#9fd0f0"]);
    const msgY = dy + dh - 6 - bs.length * (bh + 2) - 2;
    if (iMsg) fitTxt(iMsg, dx + dw / 2, Math.max(ty + 4, msgY), "#8a3a10", 6, "center", tw);
    bs.forEach((b: [string, string, string], i: number): void => { const by = dy + dh - 5 - (bs.length - i) * (bh + 2), bx = dx + 5, bw = dw - 10; panel(bx, by, bw, bh, b[2]); fitTxt(b[0], bx + bw / 2, by + 10, "#3b2212", 7, "center", bw - 8); invR.btn.push([bx, by, bw, bh, b[1]]); });
  }
  function drawUpg(): void {
    for (let y = 0; y < LH; y += 12) { X.fillStyle = (y / 12) % 2 ? "#4a2f1e" : "#553622"; X.fillRect(0, y, LW, 12); X.fillStyle = "#3b2212"; X.fillRect(0, y + 11, LW, 1); }
    const sum = ufrom === "clear" ? clearSum : null; let y = 2;
    panel(2, y, LW - 4, 18); outl(sum ? "FLOOR " + sum.f + " CLEARED!" : "UPGRADES", 8, y + 13, "#ffd84a", 9, "left");
    const gs = G.gold + " GOLD"; X.font = FONT(9); const gw0 = X.measureText(gs).width;
    panel(LW - gw0 - 30, y + 1, gw0 + 26, 16, "#ffe9a8"); X.drawImage(SP.coin[0], LW - gw0 - 27, y + 3, 12, 12); txt(gs, LW - 8, y + 13, "#8a5a10", 9, "right", null);
    y += 20;
    if (sum) { txt("+" + sum.xp + " XP   +" + sum.gold + " GOLD (INCL. +" + sum.bonus + " FLOOR BONUS)", LW / 2, y + 7, "#fff6e0", 6, "center", "rgba(0,0,0,0.7)"); y += 10; }
    const tw = Math.floor((LW - 4) / 5), th0 = 24; uR.tabs = [];
    X.fillStyle = "#2a1a10"; X.fillRect(2, y + th0 - 1, LW - 4, 2);
    BR.forEach((b: Any, i: number): void => {
      const x = 2 + i * tw, on = i === ub, ty = y + (on ? 0 : 3), hh = on ? th0 + 1 : th0 - 3;
      panel(x, ty, tw - 2, hh, on ? "#fff3cf" : "#8a5a32");
      if (on) { X.fillStyle = b.col; X.fillRect(x + 2, ty + 2, tw - 6, 3); X.strokeStyle = "#ffd84a"; X.lineWidth = 1; X.strokeRect(x + 0.5, ty + 0.5, tw - 3, hh - 1); }
      const narrow = tw < 44; X.globalAlpha = on ? 1 : 0.75;
      glyph(b.ic, narrow ? Math.round(x + tw / 2 - 9) : x + 3, ty + (narrow ? 1 : 4)); X.globalAlpha = 1;
      if (narrow) txt(b.s, x + tw / 2 - 1, ty + hh - 2, on ? b.col : "#f6deb0", 5, "center", null);
      else txt(b.s, x + 21 + (tw - 23) / 2, ty + 15, on ? b.col : "#f6deb0", tw > 56 ? 8 : 7, "center", on ? null : "rgba(0,0,0,0.5)");
      uR.tabs.push([x, y, tw - 2, th0 + 1, i]);
    });
    y += th0 + 3;
    const cs = myCards(ub), dh = 48, ch = LH - y - dh - 5, n = Math.max(1, cs.length), gw = (LW - 4 - (n - 1) * 3) / n; uR.cards = []; uc = clamp(uc, 0, cs.length - 1);
    cs.forEach((c: Card, i: number): void => {
      const x = Math.round(2 + i * (gw + 3)), w = Math.floor(gw), on = i === uc, t = T(c.id), maxed = t >= c.max, k = cost(c, t), can = !maxed && G.gold >= k, cx = x + w / 2;
      panel(x, y, w, ch, on ? "#fff3cf" : "#f6deb0");
      if (on) { X.strokeStyle = BR[ub].col; X.lineWidth = 2; X.strokeRect(x + 1.5, y + 1.5, w - 3, ch - 3); }
      const iy = y + 4, own = t > 0 || c.id === "fb";
      X.fillStyle = "#3b2212"; X.beginPath(); X.arc(cx, iy + 9, 12, 0, Math.PI * 2); X.fill();
      X.fillStyle = own ? BR[ub].col : "#8a7a64"; X.beginPath(); X.arc(cx, iy + 9, 10.5, 0, Math.PI * 2); X.fill();
      X.globalAlpha = own ? 1 : 0.55; glyph(c.ic, Math.round(cx - 8), iy + 1); X.globalAlpha = 1;
      const nm = wrap(c.n, w - 4, 6).slice(0, 2); nm.forEach((l: string, j: number): void => txt(l, cx, iy + 31 + j * 7, "#4a2a14", 6, "center", null));
      const py = iy + 27 + nm.length * 7, pw = Math.min(7, Math.floor((w - 8) / c.max));
      for (let j = 0; j < c.max; j++) { const pxx = Math.round(cx - (c.max * pw) / 2 + j * pw); px(X, "#3b2212", pxx, py, pw - 1, 5); px(X, j < t ? "#ffd84a" : "#9a7a5a", pxx + 1, py + 1, pw - 3, 3); }
      const by = y + ch - 4;
      if (c.eq && own) txt("READY", cx, by - 9, "#2a4a8c", 5, "center", null);
      if (maxed) txt("MAX", cx, by, "#3f7a3a", 7, "center", null);
      else { const ps = "" + k; X.font = FONT(7); const pw2 = X.measureText(ps).width; X.drawImage(SP.coin[0], Math.round(cx - (pw2 + 9) / 2), by - 7, 8, 8); txt(ps, cx + 5 + (pw2 - pw2) / 2, by, can ? "#24502c" : "#a03020", 7, "center", null); }
      uR.cards.push([x, y, w, ch, i]);
    });
    const dy = LH - dh - 2; panel(2, dy, LW - 4, dh, "#fff3cf"); uR.buy = null; uR.eq = null;
    const c = curCard(); if (!c) return;
    const t = T(c.id), maxed = t >= c.max, k = cost(c, t), bw = clamp(Math.round(LW * 0.3), 56, 90), tw2 = LW - 18 - bw, bx = LW - bw - 6;
    txt(c.n + "  TIER " + t + "/" + c.max, 7, dy + 10, BR[ub].col, 7, "left", null);
    txt(wrap("NOW: " + c.fx(t, G.cls), tw2, 6)[0], 7, dy + 19, "#4a2a14", 6, "left", null);
    (maxed ? ["FULLY UPGRADED"] : wrap("NEXT: " + c.fx(t + 1, G.cls), tw2, 6)).slice(0, 2).forEach((l: string, j: number): void => txt(l, 7, dy + 27 + j * 7, "#2a4a8c", 6, "left", null));
    if (uMsg) txt(uMsg, 7, dy + dh - 3, "#8a3a1a", 5, "left", null);
    const byy = dy + 4, bh2 = dh - 8, ok = !maxed && G.gold >= k;
    panel(bx, byy, bw, bh2, ok ? "#8cc94f" : "#b8a588");
    if (ok && (anim >> 4) & 1) { X.strokeStyle = "#ffd84a"; X.lineWidth = 1.5; X.strokeRect(bx + 1, byy + 1, bw - 2, bh2 - 2); }
    outl(maxed ? "MAXED" : ok ? "BUY" : "NEED", bx + bw / 2, byy + 16, ok ? "#fff6e0" : "#e8dcc8", 11, "center");
    if (!maxed) { const ps = k + " GOLD"; X.font = FONT(7); const pw2 = X.measureText(ps).width; X.drawImage(SP.coin[0], Math.round(bx + bw / 2 - (pw2 + 10) / 2), byy + bh2 - 12, 9, 9); txt(ps, bx + bw / 2 + 5, byy + bh2 - 4, ok ? "#24502c" : "#7a2a1a", 7, "center", null); }
    uR.buy = [bx, byy, bw, bh2];
  }
  function drawIcon(n: string, x: number, y: number): void {
    const th = TH[0];
    if (n.startsWith("o:")) { drawObj(n.slice(2), x, y, true); return; }
    if (n.includes(":")) { glyph(n, x, y); return; }
    if (SP[n]) { spr(SP[n][(anim >> 5) & 1] || SP[n][0], x, y); return; }
    if (n === "rest") { drawCamp(x, y); return; }
    if (n === "trap") { spr(TH[1].floor[0], x, y); drawTrap(x, y, true); return; }
    if (n === "hero") spr(heroSprite(sel)[(anim >> 5) & 1], x, y);
    else if (n === "key") spr(SP.key[0], x, y);
    else if (n === "floor") spr(th.floor[3], x, y);
    else if (n === "wall") { spr(th.wallFace[0], x, y); drawTorch(x, y); }
    else if (n === "doors") { X.drawImage(th.door[0], x - 2, y, 8, 16); X.drawImage(th.door[1], x + 4, y, 8, 16); X.drawImage(th.door[2], x + 10, y, 8, 16); }
    else if (n === "stair") spr(th.stair, x, y);
    else if (n === "fog") { spr(th.floor[0], x, y); X.fillStyle = "rgba(14,8,28,0.55)"; X.fillRect(x + 8, y, 8, 16); X.fillStyle = "#0e0a14"; X.fillRect(x + 12, y, 4, 16); }
    else if (n === "bars") { bar(x + 2, y, 5, 16, 0.7, "#6ab04c"); bar(x + 9, y, 5, 16, 0.4, "#5aa8e8"); }
    else if (n === "clock") { panel(x - 2, y, 20, 16); X.fillStyle = "#ffd84a"; X.beginPath(); X.arc(x + 8, y + 12, 6, Math.PI, Math.PI * 1.6); X.lineTo(x + 8, y + 12); X.fill(); }
    else if (n === "hotbar") { for (let i = 0; i < 3; i++) { X.fillStyle = i === 0 ? "#e0583c" : "#5a3a22"; X.fillRect(x - 3 + i * 8, y + 4, 8, 8); X.fillStyle = "#f6deb0"; X.fillRect(x - 2 + i * 8, y + 5, 6, 6); } }
    else if (n === "portrait") { panel(x - 1, y - 1, 18, 18, "#cfe8f0"); X.save(); rr(x + 2, y + 2, 12, 12, 1); X.clip(); spr(SP.sage[0], x, y + 2); X.restore(); }
  }
  function bar(x: number, y: number, w: number, h: number, f: number, c: string): void {
    X.fillStyle = "#3b2212"; X.fillRect(x - 1, y - 1, w + 2, h + 2); X.fillStyle = "#2a1a1f"; X.fillRect(x, y, w, h);
    const fh = Math.round(h * clamp(f, 0, 1)); X.fillStyle = c; X.fillRect(x, y + h - fh, w, fh); X.fillStyle = "rgba(255,255,255,0.35)"; X.fillRect(x, y + h - fh, 1, fh);
  }
  function drawSkull(x: number, y: number, on: boolean): void {
    const c = on ? "#f1e8d2" : "rgba(90,58,34,0.35)"; px(X, on ? PC.k : "rgba(0,0,0,0)", x - 1, y - 1, 9, 9);
    px(X, c, x, y, 7, 5); px(X, c, x + 1, y + 5, 5, 2); if (on) { px(X, "#9c2f2f", x + 1, y + 2, 2, 2); px(X, "#9c2f2f", x + 4, y + 2, 2, 2); px(X, PC.k, x + 2, y + 6, 1, 1); px(X, PC.k, x + 4, y + 6, 1, 1); }
  }
  function drawCamp(x: number, y: number): void {
    const fl = (anim >> 3) & 1; px(X, "#5a3a22", x + 3, y + 12, 10, 2); px(X, "#8a5a32", x + 5, y + 11, 6, 2); px(X, PC.k, x + 2, y + 13, 12, 1);
    px(X, "#e05a20", x + 5, y + 6 + fl, 6, 5 - fl); px(X, "#ff9a3c", x + 6, y + 4 + fl, 4, 6); px(X, "#ffd84a", x + 7, y + 7, 2, 3); px(X, "#fff6e0", x + 7, y + 9, 1, 1);
  }
  function drawTrap(x: number, y: number, sprung: boolean): void {
    px(X, "rgba(20,10,24,0.45)", x + 2, y + 3, 12, 11);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const ax = x + 3 + i * 4, ay = y + 4 + j * 4; if (sprung) { px(X, "#a7b4c0", ax, ay, 2, 2); px(X, "#9c2f2f", ax, ay + 1, 1, 1); } else { px(X, "#3e4a5c", ax, ay + 1, 2, 1); px(X, "#a7b4c0", ax, ay, 1, 1); } }
  }
  function drawTorch(x: number, y: number): void {
    const fl = Math.sin(anim * 0.3 + x) > 0 ? 1 : 0;
    px(X, "#5a3a22", x + 7, y + 7, 2, 5); px(X, "#2a1a1f", x + 6, y + 11, 4, 1);
    px(X, "#e05a20", x + 6, y + 4 - fl, 4, 3 + fl); px(X, "#ff9a3c", x + 7, y + 3 - fl, 2, 3); px(X, "#ffd84a", x + 7, y + 5, 2, 1);
    glow(x + 8, y + 5, 26, "rgba(255,160,60,0.9)", 0.22 + 0.05 * Math.sin(anim * 0.2 + y));
  }

  function guidePages(): Any[] {
    const k = LW + "x" + LH; if (k === pagesKey) return pages;
    pagesKey = k; pages = []; const avail = LH - 40, tw = LW - 44;
    for (const sec of GUIDE) {
      let cur: Any[] = [], hgt = 0;
      for (const [ic, t] of sec.e) { const ln = wrap(t, tw, 7); const eh = Math.max(20, ln.length * 9 + 4); if (hgt + eh > avail && cur.length) { pages.push({ t: sec.t, e: cur }); cur = []; hgt = 0; } cur.push({ ic, ln }); hgt += eh; }
      if (cur.length) pages.push({ t: sec.t, e: cur });
    }
    gp = clamp(gp, 0, pages.length - 1); return pages;
  }
  function drawGuide(): void {
    const pg = guidePages(); const p = pg[gp];
    X.fillStyle = "#2b1d3a"; X.fillRect(0, 0, LW, LH); panel(2, 2, LW - 4, LH - 4);
    txt("TRAINING CENTER", 10, 14, "#8a3a1a", 7); txt(p.t, LW - 10, 14, "#4a2a14", 8, "right");
    X.fillStyle = "#c98b4b"; X.fillRect(8, 18, LW - 16, 1);
    let y = 24;
    for (const e of p.e) {
      if (e.ic) drawIcon(e.ic, 10, y);
      e.ln.forEach((l: string, i: number): void => txt(l, e.ic ? 32 : 12, y + 8 + i * 9, "#4a2a14", 7));
      y += Math.max(20, e.ln.length * 9 + 4);
    }
    txt("PAGE " + (gp + 1) + "/" + pg.length + "  -  TAP OR NEXT", LW / 2, LH - 9, "#8a5a32", 6, "center", null);
  }

  function drawTitle(): void {
    const hz = Math.round(LH * 0.72);
    const g = X.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, "#2b1d4a"); g.addColorStop(0.55, "#8a4f7d"); g.addColorStop(1, "#f0a23b");
    X.fillStyle = g; X.fillRect(0, 0, LW, hz);
    for (let i = 0; i < 40; i++) { const sx = (i * 97) % LW, sy = (i * 53) % Math.round(hz * 0.5); if (((anim >> 4) + i) % 7) px(X, "#fff6e0", sx, sy); }
    glow(LW * 0.7, hz, 60, "rgba(255,216,74,1)", 0.5); X.fillStyle = "#ffd84a"; X.beginPath(); X.arc(LW * 0.7, hz, 14, Math.PI, 0); X.fill();
    const mtn = (base: number, amp: number, col: string, seed: number): void => { X.fillStyle = col; X.beginPath(); X.moveTo(0, hz); for (let x = 0; x <= LW; x += 4) X.lineTo(x, base - Math.abs(Math.sin(x * 0.02 + seed)) * amp - Math.abs(Math.sin(x * 0.053 + seed * 2)) * amp * 0.5); X.lineTo(LW, hz); X.fill(); };
    mtn(hz - 10, 28, "#6e4a7e", 1); mtn(hz, 18, "#4a3060", 4);
    const cx0 = Math.round(LW * 0.22); X.fillStyle = "#1a1018"; X.beginPath(); X.arc(cx0, hz, 12, Math.PI, 0); X.fill(); drawTorch(cx0 - 22, hz - 14); drawTorch(cx0 + 6, hz - 14);
    X.fillStyle = "#6ab04c"; X.fillRect(0, hz, LW, LH - hz); X.fillStyle = "#8f5f32"; X.fillRect(0, LH - 6, LW, 6); X.fillStyle = "#3f7a3a"; X.fillRect(0, hz, LW, 2);
    for (let x = 3; x < LW; x += 9) { const yy = hz + 5 + ((x * 7) % (LH - hz - 12)); px(X, "#a6e06a", x, yy, 1, 2); px(X, "#3f7a3a", x - 1, yy + 2, 3, 1); if (x % 4 === 0) { px(X, "#f4a3b5", x + 3, yy - 1); px(X, "#ffd84a", x + 3, yy); } }
    const ts = clamp(Math.floor(LW / 13), 12, 22);
    outl("DUNGEON DELVER", LW / 2, ts + 4, "#ffd84a", ts); txt("A d20 dungeon crawl - " + MAXF + " floors to the Orb of Tarmin", LW / 2, ts + 14, "#fff6e0", 6, "center", "rgba(0,0,0,0.5)");
    const cw = Math.min(78, Math.floor((LW - 16) / 3) - 4), chh = Math.min(92, LH - ts - 34), top = ts + 20, sc = cw >= 54 && chh >= 80 ? 2 : 1;
    cardRects = [];
    for (let i = 0; i < 3; i++) {
      const x = Math.round(LW / 2 - (cw * 3 + 8) / 2 + i * (cw + 4)), on = i === sel, k = CL[i];
      panel(x, top + (on ? -2 : 0), cw, chh, on ? "#fff3cf" : "#f6deb0");
      if (on) { X.strokeStyle = "#e0583c"; X.lineWidth = 1; rr(x + 0.5, top - 1.5, cw - 1, chh - 1, 4); X.stroke(); }
      const sy = top + 5 + (on ? -2 : 0);
      if (i === 1) glow(x + cw / 2 + 4 * sc, sy + 2 * sc, 10 * sc, "rgba(107,224,207,1)", 0.5 + 0.2 * Math.sin(anim * 0.1));
      spr(heroSprite(i)[on ? (anim >> 4) & 1 : 0], x + cw / 2 - 8 * sc, sy, false, sc);
      let ty = sy + 16 * sc + 8; txt(k.n, x + cw / 2, ty, on ? "#8a3a1a" : "#4a2a14", 7, "center", null);
      for (const l of ["HP " + k.hp + "  AC " + k.ac, "ATK +" + k.atk, k.sp]) { ty += 8; if (ty < top + chh - 3) txt(l, x + cw / 2, ty, "#5a3a22", 6, "center", null); }
      cardRects.push([x, top, cw, chh]);
    }
    const msg = "Tap a hero to pick, tap again (or ENTER) to start";
    txt(msg, LW / 2, Math.min(LH - 8, top + chh + 10), "#fff6e0", 6, "center", "rgba(0,0,0,0.6)");
  }
  const HOT = 22, DLG = 37;
  function drawPlay(): void {
    const th = theme(), mapH = LH - HOT - DLG - 3;
    for (const e of ents) { if (e.rx == null) { e.rx = e.x; e.ry = e.y; } e.rx += (e.x - e.rx) * 0.3; e.ry += (e.y - e.ry) * 0.3; if (e.fl) e.fl--; }
    G.rx += (G.x - G.rx) * 0.35; G.ry += (G.y - G.ry) * 0.35; bumpX *= 0.7; bumpY *= 0.7;
    X.save(); X.beginPath(); X.rect(0, 0, LW, mapH); X.clip(); X.fillStyle = "#0e0a14"; X.fillRect(0, 0, LW, mapH);
    const mw = W * TS, mh = H * TS;
    let camX = mw > LW ? clamp(G.rx * TS + 8 - LW / 2, -TS, mw - LW + TS) : (mw - LW) / 2;
    let camY = mh > mapH ? clamp(G.ry * TS + 8 - mapH / 2, -TS, mh - mapH + TS) : (mh - mapH) / 2;
    if (shake > 0) { camX += R(5) - 2; camY += R(5) - 2; shake--; }
    camX = Math.round(camX); camY = Math.round(camY);
    X.save(); X.translate(-camX, -camY);
    const x0 = Math.max(0, Math.floor(camX / TS)), x1 = Math.min(W - 1, Math.floor((camX + LW) / TS)), y0 = Math.max(0, Math.floor(camY / TS)), y1 = Math.min(H - 1, Math.floor((camY + mapH) / TS));
    const torches: number[][] = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!seen[y][x]) continue; const t = map[y][x], hv = hash(x, y), sx = x * TS, sy = y * TS;
      if (t === 1) { const face = y + 1 < H && map[y + 1][x] !== 1; X.drawImage(face ? th.wallFace[hv % 3] : th.wallTop[hv % 3], sx, sy); if (face && hv % 11 === 0) torches.push([sx, sy]); }
      else if (t >= 10) { X.drawImage(th.floor[0], sx, sy); X.drawImage(th.door[t - 10], sx, sy); }
      else if (t === 2) { X.drawImage(th.floor[0], sx, sy); drawObj("gate", sx, sy, true); const lg = ents.find((o: Any): boolean => o.t === "lgate" && o.x === x && o.y === y); if (lg) { px(X, "#2a1a10", sx + 1, sy + 7, 14, 4); px(X, LCOL[lg.c], sx + 2, sy + 8, 12, 2); } }
      else X.drawImage(th.floor[hv % 13 < 8 ? hv % 3 === 0 ? 0 : 1 + (hv % 2) * 4 : hv % 8], sx, sy);
      if (!near(x, y)) { X.fillStyle = "rgba(14,8,28,0.55)"; X.fillRect(sx, sy, TS, TS); }
    }
    for (const [sx, sy] of torches) drawTorch(sx, sy);
    const vis = ents.filter((e: Any): boolean => e.t === "mon" ? near(e.x, e.y) : !!seen[e.y][e.x]).sort((a: Any, b: Any): number => (a.t === "stair" || a.t === "plate" ? -1 : 0) - (b.t === "stair" || b.t === "plate" ? -1 : 0) || a.ry - b.ry);
    for (const e of vis) {
      const sx = e.rx * TS, sy = e.ry * TS;
      if (e.t === "stair") { X.drawImage(th.stair, Math.round(sx), Math.round(sy)); continue; }
      if (e.t === "lgate") { if (map[e.y][e.x] === 0) { px(X, LCOL[e.c], Math.round(sx), Math.round(sy) + 2, 2, 12); px(X, LCOL[e.c], Math.round(sx) + 14, Math.round(sy) + 2, 2, 12); } continue; }
      if (e.t === "plate") { drawObj("plate", Math.round(sx), Math.round(sy), !!e.on || ents.some((o: Any): boolean => o.t === "blk" && o.x === e.x && o.y === e.y)); continue; }
      if (e.t === "chest" || e.t === "booth" || e.t === "blk" || e.t === "lever" || e.t === "braz" || e.t === "torch") {
        if (e.t !== "blk") X.drawImage(shadow, Math.round(sx), Math.round(sy) + 12);
        drawObj(e.t, Math.round(sx), Math.round(sy), e.t === "lever" ? !!e.on : e.t === "braz" ? !!e.lit : true, e.t === "lever" ? LCOL[e.c || 0] : undefined);
        if ((e.t === "braz" && e.lit) || e.t === "torch") glow(sx + 8, sy + 5, 22, "rgba(255,160,60,1)", 0.35 + 0.1 * Math.sin(anim * 0.3));
        if (e.t === "chest" && (anim >> 4) % 6 === 0) px(X, "#fff6e0", Math.round(sx) + 11, Math.round(sy) + 6);
        continue;
      }
      X.drawImage(shadow, Math.round(sx), Math.round(sy) + 12);
      if (e.t === "mon") {
        if (e.fl && (e.fl & 2)) continue;
        const fr = SP[e.dummy ? "dummy" : e.n][((anim >> 5) + e.x) & 1];
        if (e.guard) glow(sx + 8, sy + 8, 14, "rgba(255,216,74,1)", 0.25);
        if (e.boss && e.n !== "drag") spr(fr, sx - 3, sy - 6, e.x > G.x, 1.4); else spr(fr, sx, sy, e.x > G.x);
        if (e.n === "drag") glow(sx + 8, sy + 10, 18, "rgba(255,90,30,1)", 0.25);
        else if (e.n === "lich") glow(sx + 8, sy + 8, 22, "rgba(110,224,106,1)", 0.3);
        else if (e.n === "wraith") glow(sx + 8, sy + 8, 12, "rgba(127,208,240,1)", 0.2);
        if (e.hp < e.mx) { X.fillStyle = "#2a1a1f"; X.fillRect(Math.round(sx) + 2, Math.round(sy) - 3, 12, 3); X.fillStyle = "#e0583c"; X.fillRect(Math.round(sx) + 3, Math.round(sy) - 2, Math.max(1, Math.round(10 * e.hp / e.mx)), 1); }
      } else if (e.t === "orb") { glow(sx + 8, sy + 8, 20, "rgba(127,208,240,1)", 0.45 + 0.15 * Math.sin(anim * 0.1)); spr(SP.orb[0], sx, sy - (anim >> 4 & 1)); }
      else if (e.t === "key") spr(SP.key[e.c], sx, sy - ((anim >> 4) & 1));
      else if (e.t === "rest") { glow(sx + 8, sy + 9, 16, "rgba(255,160,60,1)", 0.35 + 0.1 * Math.sin(anim * 0.3)); drawCamp(Math.round(sx), Math.round(sy)); }
      else if (e.t === "trap" || e.t === "sprung") { if (e.t === "trap" && Math.hypot(e.x - G.x, e.y - G.y) > 2.5) continue; drawTrap(Math.round(sx), Math.round(sy), e.t === "sprung"); }
      else { const s2 = SP[e.t]; if (s2) spr(s2[0], sx, sy); if (e.t === "gold" && (anim >> 3) % 9 === 0) px(X, "#fff6e0", Math.round(sx) + 9, Math.round(sy) + 8); }
    }
    const hx = G.rx * TS + bumpX, hy = G.ry * TS + bumpY;
    X.drawImage(shadow, Math.round(hx), Math.round(hy) + 12);
    spr(heroSprite(G.cls)[(anim >> 5) & 1], hx, hy, G.face === 1);
    if (G.cls !== 1) { X.save(); X.translate(Math.round(hx) + (G.face === 1 ? -1 : 10), Math.round(hy) + 5); X.scale(0.45, 0.45); glyph(weaponIc(), 0, 0); X.restore(); }
    if (CL[G.cls].spell) glow(hx + (G.face ? 3 : 12), hy + 2, 9, "rgba(107,224,207,1)", 0.55 + 0.25 * Math.sin(anim * 0.15));
    parts = parts.filter((p: Any): boolean => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.96; p.l--; return p.l > 0; });
    for (const p of parts) { X.globalAlpha = clamp(p.l / p.ml, 0, 1); if (p.glow) { X.save(); X.globalCompositeOperation = "lighter"; px(X, p.c, Math.round(p.x), Math.round(p.y), p.s, p.s); X.restore(); } else px(X, p.c, Math.round(p.x), Math.round(p.y), p.s, p.s); }
    X.globalAlpha = 1;
    floats = floats.filter((f: Any): boolean => { f.y -= 0.35; f.l--; return f.l > 0; });
    for (const f of floats) { X.globalAlpha = clamp(f.l / 20, 0, 1); outl(f.t, f.x, f.y, f.c, 7); } X.globalAlpha = 1;
    if (flash > 0) glow(G.x * TS + 8, G.y * TS + 8, 56, "rgba(255,140,40,1)", flash / 14);
    X.restore();
    const vx = hx - camX + 8, vy = hy - camY + 8, vg = X.createRadialGradient(vx, vy, 34, vx, vy, Math.max(LW, mapH) * 0.7);
    vg.addColorStop(0, "rgba(10,6,20,0)"); vg.addColorStop(1, "rgba(10,6,20,0.6)"); X.fillStyle = vg; X.fillRect(0, 0, LW, mapH);
    if (flash > 0) { X.fillStyle = "rgba(255,160,60," + (flash / 50) + ")"; X.fillRect(0, 0, LW, mapH); flash--; }
    X.restore();
    if (bannerT > 0 && !G.train && mode === "play") {
      bannerT--; const a = clamp(bannerT / 25, 0, 1), lvl = Math.min(MAXF, G.floor), bw = 150, bx = Math.round((LW - bw) / 2), byy = Math.round(mapH * 0.28);
      X.globalAlpha = a; panel(bx, byy, bw, 48); outl("FLOOR " + G.floor, LW / 2, byy + 16, "#ffd84a", 11);
      for (let i = 0; i < MAXF; i++) { const sx2 = Math.round(LW / 2 - 10 * 6.5 + (i % 10) * 13) + 3, sy2 = byy + 21 + Math.floor(i / 10) * 12; drawSkull(sx2, sy2, i < lvl); }
      if (BOSS[G.floor]) outl(G.floor === MAXF ? "FINAL BOSS" : G.floor === 10 ? "MID-GAME BOSS" : "BOSS FLOOR", LW / 2, byy + 56, "#e0583c", 8);
      X.globalAlpha = 1;
    }
    // clock / floor panel (top-right)
    const cw2 = 74, cxp = LW - cw2 - 2; panel(cxp, 2, cw2, 31);
    X.fillStyle = "#2b1d4a"; X.beginPath(); X.arc(cxp + 15, 22, 10, Math.PI, 0); X.fill();
    const prog = G.train ? 0 : clamp(G.floor / MAXF, 0, 1); X.fillStyle = "#ffd84a"; X.beginPath(); X.moveTo(cxp + 15, 22); X.arc(cxp + 15, 22, 10, Math.PI, Math.PI + prog * Math.PI); X.closePath(); X.fill();
    X.strokeStyle = "#3b2212"; X.lineWidth = 1; X.beginPath(); X.moveTo(cxp + 15, 22); X.lineTo(cxp + 15 + Math.cos(Math.PI + prog * Math.PI) * 10, 22 + Math.sin(Math.PI + prog * Math.PI) * 10); X.stroke();
    px(X, "#3b2212", cxp + 4, 22, 22, 2);
    txt(G.train ? "PRACTICE" : "FLOOR " + G.floor, cxp + 28, 12, "#4a2a14", 7);
    txt("LV " + G.lv, cxp + 28, 20, "#4a2a14", 6, "left", null);
    X.drawImage(SP.coin[0], cxp + 24, 18, 12, 12); txt(fmtN(G.gold), cxp + 36, 28, "#8a5a32", 6, "left", null);
    // HP / XP bars (bottom-right of map)
    const bh = clamp(Math.round(mapH * 0.38), 26, 60), by = mapH - bh - 4, f = G.hp / G.mx;
    panel(LW - 30, by - 10, 28, bh + 14);
    bar(LW - 24, by, 6, bh, f, f > 0.5 ? "#6ab04c" : f > 0.25 ? "#f0c23b" : "#e0583c"); bar(LW - 13, by, 6, bh, G.xp / (G.lv * 20), "#5aa8e8");
    txt("H", LW - 21, by - 2, "#8a3a1a", 6, "center", null); txt("X", LW - 10, by - 2, "#2a4a8c", 6, "center", null);
    txt(G.hp + "/" + G.mx, LW - 32, mapH - 4, "#fff6e0", 6, "right", "rgba(0,0,0,0.8)");
    // hotbar
    X.fillStyle = "#1c1424"; X.fillRect(0, mapH, LW, LH - mapH);
    const wz = !!CL[G.cls].spell, slots = hotSlots(), cur = "sp:" + curSp();
    const sw = Math.min(20, Math.floor((LW - 10) / slots.length)), hw = slots.length * sw + 6, hx0 = Math.round((LW - hw) / 2), hy0 = mapH + 1;
    panel(hx0, hy0, hw, HOT); hotRects = [];
    slots.forEach((s: Any, i: number): void => {
      const x = hx0 + 3 + i * sw, y = hy0 + 3, isSp = s.a.startsWith("sp:"), spOn = wz && isSp && s.a === cur;
      X.fillStyle = spOn ? "#ffd84a" : "#c98b4b"; X.fillRect(x, y, sw - 1, 16); X.fillStyle = spOn ? "#fff3cf" : isSp ? "#ffe2b8" : "#f6deb0"; X.fillRect(x + 1, y + 1, sw - 3, 14);
      const dim = (s.ic[0] === "k" && G.keys[+s.ic[1]] === 0) || (s.ic === "pot" && G.pot === 0) || (isSp && G.mp < +s.n) || (s.a === "alt" && s.ic === "w:knife" && G.kn === 0) || (s.a === "upg" && G.gold < GP);
      X.globalAlpha = dim ? 0.3 : 1; if (s.ic.startsWith("o:")) drawObj(s.ic.slice(2), x + 1 + Math.min(0, sw - 20), y, true); else if (s.ic.includes(":")) glyph(s.ic, x + 1 + Math.min(0, sw - 20), y); else X.drawImage(s.ic[0] === "k" ? SP.key[+s.ic[1]] : SP[s.ic][0], x + 1, y, 16, 16); X.globalAlpha = 1;
      if (s.a === "inv" && G.newI && (anim >> 4) & 1) { X.strokeStyle = "#a6e06a"; X.lineWidth = 1; X.strokeRect(x + 0.5, y + 0.5, sw - 2, 15); }
      if (s.a === "upg" && G.gold >= GP && (anim >> 4) & 1) { X.strokeStyle = "#ffd84a"; X.lineWidth = 1; X.strokeRect(x + 0.5, y + 0.5, sw - 2, 15); }
      if (isSp) { for (let j = 0; j < +s.n; j++) px(X, "#3b7fc4", x + sw - 4 - j * 3, y + 12, 2, 2); }
      else if (s.n && s.n !== "0") outl(s.n, x + sw - 4, y + 15, "#fff6e0", 6, "right");
      if (s.a === selA || spOn) { X.strokeStyle = spOn ? "#e0583c" : "#e0583c"; X.lineWidth = 1.5; X.strokeRect(x - 0.5, y - 0.5, sw, 17); }
      hotRects.push([x, y, sw, 16, i]);
    });
    // dialogue box with portrait
    const dy0 = mapH + HOT + 2; panel(2, dy0, LW - 4, DLG); dlgRect = [2, dy0, LW - 4, DLG];
    const h = curHint, showNice = niceT > 0;
    panel(5, dy0 + 3, 31, 31, h || showNice ? "#cfe8f0" : "#f2d8a8");
    X.save(); rr(8, dy0 + 6, 25, 25, 2); X.clip(); spr((h || showNice ? SP.sage : heroSprite(G.cls))[(anim >> 5) & 1], 4, dy0 + 6, false, 1.6); X.restore();
    const tw = LW - 46; let lines: string[] = [], cols: string[] = [];
    if (showNice) { lines = ["NICE! STEP DONE"]; cols = ["#3f7a3a"]; niceT--; }
    else if (h) { lines = wrap(h, tw, 7).slice(0, 2); cols = lines.map((): string => "#2a4a8c"); }
    const room = 3 - lines.length; const lg = log.slice(0, room);
    lines = lines.concat(lg.map((l: string): string => wrap(l, tw, 6)[0])); cols = cols.concat(lg.map((_: string, i: number): string => (i === 0 ? "#4a2a14" : "#8a6a4a")));
    const hl = lines.length - lg.length; lines.forEach((l: string, i: number): void => txt(l, 40, dy0 + 12 + i * 9, cols[i], i < hl ? 7 : 6, "left", null));
    if (h) txt("TAP TO HIDE", LW - 8, dy0 + DLG - 4, "#8a6a4a", 5, "right", null);
  }
  function overlay(title: string, sub: string[], col: string): void {
    X.fillStyle = "rgba(14,8,24,0.7)"; X.fillRect(0, 0, LW, LH);
    const w = Math.min(LW - 16, 220), hh = 30 + sub.length * 10, x = (LW - w) / 2, y = (LH - hh) / 2;
    panel(x, y, w, hh); outl(title, LW / 2, y + 18, col, 11); sub.forEach((s: string, i: number): void => txt(s, LW / 2, y + 30 + i * 10, "#4a2a14", 7, "center", null));
  }
  const fmtN = (n: number): string => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M" : n >= 1e5 ? Math.round(n / 1e3) + "K" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  function fitTxt(s: string, x: number, y: number, c: string, size: number, al: CanvasTextAlign, maxW: number): void {
    let z = size; X.font = FONT(z); while (z > 4 && X.measureText(s).width > maxW) { z -= 0.5; X.font = FONT(z); }
    txt(s, x, y, c, z, al, null);
  }
  function drawWin(): void {
    X.fillStyle = "rgba(14,8,24,0.75)"; X.fillRect(0, 0, LW, LH);
    let spent = 0, tb = 0, tt = 0;
    for (const b of BR) for (const c of b.cards) { if (!c.cls.includes(G.cls)) continue; tt += c.max; const t = T(c.id); tb += t; for (let i = 0; i < t; i++) spent += cost(c, i); }
    const rows: [string, string][] = [["FLOORS", MAXF + "/" + MAXF], ["LEVEL", String(G.lv)], ["KILLS", fmtN(G.kills || 0)], ["DEATHS", fmtN(G.dth || 0)], ["GOLD EARNED", fmtN(G.gold + spent)], ["GOLD LEFT", fmtN(G.gold)], ["UPGRADES", tb + "/" + tt], ["XP", fmtN(G.xp || 0)]];
    const w = Math.min(LW - 12, 230), two = w >= 170, nr = two ? Math.ceil(rows.length / 2) : rows.length, rh = 10;
    const hh = Math.min(LH - 8, 46 + nr * rh + 4), x = (LW - w) / 2, y = (LH - hh) / 2;
    panel(x, y, w, hh);
    outl("VICTORY!", LW / 2, y + 16, "#ffd84a", 11);
    fitTxt("THE ORB OF TARMIN IS YOURS", LW / 2, y + 26, "#4a2a14", 7, "center", w - 12);
    fitTxt(CL[G.cls].n + " - ALL 10 FLOORS CLEARED", LW / 2, y + 35, "#7a4a1c", 6, "center", w - 12);
    const cw = two ? (w - 16) / 2 : w - 16;
    rows.forEach((r2: [string, string], i: number): void => {
      const col = two ? Math.floor(i / nr) : 0, row = two ? i % nr : i;
      const cx = x + 8 + col * cw, cy = y + 47 + row * rh;
      X.fillStyle = "rgba(74,42,20,0.12)"; X.fillRect(cx, cy - 7, cw - 3, rh - 1);
      fitTxt(r2[0], cx + 2, cy, "#4a2a14", 6, "left", cw * 0.55);
      fitTxt(r2[1], cx + cw - 5, cy, "#8a3a10", 7, "right", cw * 0.42);
    });
  }
  function frame(): void {
    anim++; X.setTransform(K, 0, 0, K, 0, 0); X.imageSmoothingEnabled = false;
    X.clearRect(0, 0, LW, LH);
    if (mode === "title") drawTitle();
    else if (mode === "guide") drawGuide();
    else if (G && mode === "upg") drawUpg();
    else if (G && mode === "inv") drawInv();
    else if (G) {
      const h = hintText();
      if (h !== lastHint) { if (lastHint && hintFloor === G.floor && G.hideHint !== lastHint && mode === "play") niceT = 45; lastHint = h; hintFloor = G.floor; }
      curHint = niceT > 0 ? "" : h;
      drawPlay();
      if (mode === "dead") overlay("YOU HAVE PERISHED", [CL[G.cls].n + " - FLOOR " + G.floor + " - LEVEL " + G.lv, "GOLD: " + G.gold, "RETRY FLOOR " + G.floor + " WITH FULL HP?"], "#e0583c");
      if (mode === "win") drawWin();
      if (mode === "trained") overlay("TRAINING COMPLETE", ["YOU KNOW EVERY SYMBOL NOW.", "START FLOOR 1 AS " + CL[sel].n + "?"], "#a6e06a");
    }
    raf = requestAnimationFrame(frame);
  }
  function lpos(e: { clientX: number; clientY: number }): number[] { const r = C.getBoundingClientRect(); return [(e.clientX - r.left) * LW / r.width, (e.clientY - r.top) * LH / r.height]; }
  const inR = (p: number[], r: number[]): boolean => p[0] >= r[0] && p[0] < r[0] + r[2] && p[1] >= r[1] && p[1] < r[1] + r[3];
  let down: number[] | null = null;
  const pd = (e: Event): void => { const pe = e as globalThis.PointerEvent; pe.preventDefault(); try { C.focus({ preventScroll: true }); } catch { /* ok */ } down = lpos(pe); };
  const pu = (e: Event): void => {
    const pe = e as globalThis.PointerEvent; if (!down) return; const p = lpos(pe), dx = p[0] - down[0], dy = p[1] - down[1]; const st = down; down = null;
    if (mode === "play" && Math.hypot(dx, dy) > 18) { if (Math.abs(dx) > Math.abs(dy)) move(Math.sign(dx), 0); else move(0, Math.sign(dy)); return; }
    tap(st);
  };
  function tap(p: number[]): void {
    if (mode === "title") { cardRects.forEach((r: number[], i: number): void => { if (inR(p, r)) { if (sel === i) start(i); else { sel = i; LS.set("dndLast", String(i)); beep(500, 0.06); ui(); } } }); }
    else if (mode === "guide") api.guide(1);
    else if (mode === "inv") {
      for (const r of invR.btn) if (inR(p, r)) { invAct(r[4]); return; }
      for (const r of invR.slots) if (inR(p, r)) { iSel = r[4]; iMsg = ""; beep(600, 0.05); ui(); return; }
    }
    else if (mode === "upg") {
      for (const r of uR.tabs) if (inR(p, r)) { ub = r[4]; uc = 0; uMsg = ""; beep(500, 0.05); return; }
      if (uR.eq && inR(p, uR.eq)) { equip(); return; }
      if (uR.buy && inR(p, uR.buy)) { buy(); return; }
      for (const r of uR.cards) if (inR(p, r)) { uc = r[4]; uMsg = ""; beep(600, 0.05); return; }
    }
    else if (mode === "play") {
      for (const r of hotRects) if (inR(p, r)) { useSlot(r[4]); return; }
      if (inR(p, dlgRect) && curHint) { G.hideHint = curHint; }
    }
  }
  C.addEventListener("pointerdown", pd); C.addEventListener("pointerup", pu);
  const api: Api = {
    resize(w: number, h: number, k: number): void { LW = w; LH = h; K = k; },
    key(k: string): void {
      if (mode === "guide") { if (k === "ArrowLeft" || k === "ArrowUp" || k === "KeyA" || k === "KeyW") api.guide(-1); else if (k === "Escape") api.guide(0); else api.guide(1); return; }
      if (mode === "title") { if (k === "ArrowLeft" || k === "KeyA") { sel = (sel + 2) % 3; ui(); } else if (k === "ArrowRight" || k === "KeyD") { sel = (sel + 1) % 3; ui(); } else if (k === "Enter" || k === "Space" || k === "KeyE" || k === "Use") start(sel); else if (k === "KeyC") load(); else if (k === "KeyT") { gp = 0; mode = "guide"; ui(); } else if (k === "KeyU") { const s = LS.get("dndF"); if (s && restoreFloor(s)) { log = []; say("UPGRADES FOR YOUR SAVED RUN - FLOOR " + G.floor); openUpg("title"); } } return; }
      if (mode === "upg") {
        const n = Math.max(1, myCards(ub).length);
        if (k === "ArrowLeft" || k === "KeyA") { uc = (uc + n - 1) % n; uMsg = ""; }
        else if (k === "ArrowRight" || k === "KeyD") { uc = (uc + 1) % n; uMsg = ""; }
        else if (k === "ArrowUp" || k === "KeyW") { ub = (ub + 4) % 5; uc = 0; uMsg = ""; }
        else if (k === "ArrowDown" || k === "KeyS") { ub = (ub + 1) % 5; uc = 0; uMsg = ""; }
        else if (k === "Enter" || k === "Space" || k === "Use") buy();
        else if (k === "KeyE") equip();
        else if (k === "KeyR") refundAll();
        else if (k === "KeyU" || k === "Escape" || k === "Done") closeUpg();
        return;
      }
      if (mode === "inv") {
        if (k === "ArrowLeft" || k === "KeyA") iSel = (iSel + 10) % 11; else if (k === "ArrowRight" || k === "KeyD") iSel = (iSel + 1) % 11;
        else if (k === "ArrowUp" || k === "KeyW") iSel = iSel >= 7 ? iSel - 4 : iSel >= 3 ? 0 : iSel; else if (k === "ArrowDown" || k === "KeyS") iSel = iSel < 3 ? 3 + iSel : Math.min(10, iSel + 4);
        else if (k === "Enter" || k === "Space" || k === "Use") invAct(iSel >= 3 ? "equip" : "unequip");
        else if (k === "KeyX") invAct("scrap"); else if (k === "KeyE") invAct("ench");
        else if (k === "KeyI" || k === "Escape" || k === "Done") closeInv();
        iMsg = k.startsWith("Arrow") ? "" : iMsg; return;
      }
      if (mode === "trained") { if (k === "Enter" || k === "Space") start(sel); else if (k === "Escape") { mode = "title"; ui(); } return; }
      if (mode === "dead" || mode === "win") { if (k === "KeyR") { if (mode === "dead") retryFloor(); else api.retry(); } else if (k === "KeyN") api.retry(); else if (k === "Enter" || k === "Escape" || k === "Space") { mode = "title"; ui(); } return; }
      if (mode !== "play") return;
      const mv: Record<string, number[]> = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
      if (mv[k]) move(mv[k][0], mv[k][1]);
      else if (k === "Space" || k === "KeyE" || k === "Use") act();
      else if (k === "KeyF") spell(CL[G.cls].spell ? "fb" : undefined);
      else if (k === "Spell") spell();
      else if (k === "KeyG" && CL[G.cls].spell) spell("frost");
      else if (k === "KeyH" && CL[G.cls].spell) spell("chain");
      else if (k.startsWith("Sel:")) selSpell(k.slice(4));
      else if (k === "KeyB") { if (CL[G.cls].spell) spell(); else brace(); }
      else if (k === "KeyQ" || k === "Potion") quaff();
      else if (k === "Enter" || k === "Wait") wait();
      else if (/^Digit[0-9]$/.test(k)) useSlot(k[5] === "0" ? 9 : +k[5] - 1);
      else if (k === "KeyU") openUpg("play");
      else if (k === "KeyI") openInv(false);
      else if (k === "KeyZ") undoPush();
      else if (k === "KeyX") resetRoom();
    },
    guide(dir: number): void {
      if (dir === 0) { mode = "title"; ui(); return; }
      const n = guidePages().length;
      if (mode !== "guide") { gp = 0; mode = "guide"; ui(); return; }
      gp += dir; if (gp < 0) gp = 0; if (gp >= n) { train(); return; } ui();
    },
    train(): void { gp = 0; mode = "guide"; ui(); },
    startSel(): void { start(sel); },
    retry(): void { start(G ? G.cls : sel); },
    retryFloor,
    newGame(): void { start(G ? G.cls : sel); },
    load,
    setTut(on: boolean): void { tutOn = on; },
    skipTut(): void { if (G) { G.tut = 0; save(); ui(); } },
    select(i: number): void { sel = i; ui(); },
    stop(): void { cancelAnimationFrame(raf); C.removeEventListener("pointerdown", pd); C.removeEventListener("pointerup", pu); try { if (ac) void ac.close(); } catch { /* ok */ } },
  };
  ui(); raf = requestAnimationFrame(frame);
  return api;
}

function measure(): { w: number; h: number } {
  const w = window.innerWidth || 800; let h = window.innerHeight || 600;
  try { const a = window.screen.width, b = window.screen.height; if (a && b) { const sh = w > h ? Math.min(a, b) : Math.max(a, b); h = Math.min(h, sh); } } catch { /* ok */ }
  return { w, h };
}

export default function App() {
  useGrokTheme();
  const cv = useRef<HTMLCanvasElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const game = useRef<Api | null>(null);
  const rep = useRef<number>(0);
  const last = LS.get("dndLast");
  const [initSel] = useState<number>(last !== null && /^[0-2]$/.test(last) ? +last : Math.floor(Math.random() * 3));
  const [tutOn, setTutOn] = useState<boolean>(LS.get("dndTut") !== "0");
  const [ui, setUi] = useState<UiState>({ mode: "title", saved: false, tut: false, cls: initSel, sel: initSel, floor: 1, gold: 0, from: "play", sp: "SPELL", spells: [] });
  const [vp, setVp] = useState<{ w: number; h: number }>(measure());

  useEffect((): (() => void) => {
    const on = (): void => setVp(measure());
    window.addEventListener("resize", on); window.addEventListener("orientationchange", on);
    const el = root.current; const tm = (e: TouchEvent): void => { e.preventDefault(); };
    if (el) el.addEventListener("touchmove", tm, { passive: false });
    return (): void => { window.removeEventListener("resize", on); window.removeEventListener("orientationchange", on); if (el) el.removeEventListener("touchmove", tm); };
  }, []);
  useEffect((): (() => void) => {
    const c = cv.current; if (!c) return (): void => undefined;
    const g = makeGame(c, (s: UiState): void => setUi(s), initSel, tutOn); game.current = g;
    try { root.current?.focus({ preventScroll: true }); } catch { /* ok */ }
    return (): void => { window.clearInterval(rep.current); g.stop(); game.current = null; };
  }, []);
  useEffect((): void => { window.clearInterval(rep.current); }, [ui.mode]);

  const land = vp.w > vp.h, play = ui.mode === "play", gap = 8;
  const bs = land ? clamp(Math.round(vp.h / 6.2), 40, 84) : clamp(Math.round(vp.w / 7.2), 44, 72);
  const menuH = land ? clamp(Math.round(vp.h / 7.5), 40, 60) : 50;
  const isTitle = ui.mode === "title";
  const nMenu = isTitle ? (ui.saved ? 5 : 3) : ui.mode === "guide" || ui.mode === "dead" ? 3 : 2;
  const spRow = play && ui.spells.length > 0;
  let leftW = 0, rightW = 0, ctrlH = 0;
  if (land) { if (play) { leftW = 3 * bs + 8; rightW = Math.round(bs * 1.55); } else leftW = clamp(Math.round(vp.w * 0.26), 150, 280); }
  else ctrlH = play ? 3 * bs + 8 + (spRow ? clamp(Math.round(vp.w / 11), 34, 48) + 6 : 0) : Math.ceil(nMenu / 2) * (menuH + 8);
  const aw = land ? vp.w - leftW - rightW - gap * (play ? 4 : 3) : vp.w - gap * 2;
  const ah = land ? vp.h - gap * 2 : vp.h - ctrlH - gap * 3;
  const s = Math.max(1, Math.floor(Math.min(aw, ah) / 165));
  const LH = Math.max(100, Math.floor(ah / s)), LW = Math.max(150, Math.min(Math.floor(aw / s), LH * 2));
  const dpr = Math.min(3, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1)), K = s * dpr;
  useEffect((): void => { game.current?.resize(LW, LH, K); }, [LW, LH, K]);

  const fs = clamp(Math.round(Math.min(vp.w, vp.h) / 26), 12, 20);
  const wood = (bg: string, extra?: CSSProperties): CSSProperties => ({ background: bg, color: "#3b2212", border: "3px solid #5a3a22", borderRadius: 10, boxShadow: "inset 0 -4px 0 rgba(90,58,34,0.35), inset 0 2px 0 rgba(255,255,255,0.5)", font: `bold ${fs}px ui-monospace, Menlo, monospace`, touchAction: "none", userSelect: "none", cursor: "pointer", padding: "0 6px", lineHeight: 1.1, ...extra });
  const send = (k: string): void => { game.current?.key(k); };
  const hold = (k: string): ((e: PointerEvent<HTMLButtonElement>) => void) => (e: PointerEvent<HTMLButtonElement>): void => {
    e.preventDefault(); send(k); window.clearInterval(rep.current);
    rep.current = window.setInterval((): void => send(k), 190);
  };
  const tapK = (k: string): ((e: PointerEvent<HTMLButtonElement>) => void) => (e: PointerEvent<HTMLButtonElement>): void => { e.preventDefault(); send(k); };
  const release = (): void => { window.clearInterval(rep.current); };
  const onKey = (e: KeyboardEvent<HTMLDivElement>): void => {
    const k = e.code; if (/^(Arrow|Space|Enter|Key[WASDEFGHQBRCTNUIZX]|Digit[0-9]|Escape)/.test(k)) { e.preventDefault(); send(k); }
  };
  const run = (f: () => void): ((e: PointerEvent<HTMLButtonElement>) => void) => (e: PointerEvent<HTMLButtonElement>): void => { e.preventDefault(); f(); };
  const hero = ["FIGHTER", "WIZARD", "ROGUE"][ui.mode === "title" ? ui.sel : ui.cls];

  const dir = (lbl: string, k: string) => <button key={k} aria-label={k} onPointerDown={hold(k)} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} style={wood("#f6deb0", { width: bs, height: bs, fontSize: Math.round(bs * 0.42), padding: 0 })}>{lbl}</button>;
  const pad = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(3, ${bs}px)`, gap: 4, flex: "none" }}>
      <span />{dir("▲", "ArrowUp")}<span />
      {dir("◀", "ArrowLeft")}<span style={{ width: bs, height: bs, borderRadius: bs / 2, background: "rgba(90,58,34,0.25)" }} />{dir("▶", "ArrowRight")}
      <span />{dir("▼", "ArrowDown")}<span />
    </div>
  );
  const isWiz = ui.cls === 1;
  const actBtn = (lbl: string, k: string, bg: string, h: number, w: number | string) => <button key={k} onPointerDown={tapK(k)} style={wood(bg, { height: h, width: w, padding: 0, fontSize: Math.round(Math.min(fs * 1.05, h * 0.3)) })}>{lbl}</button>;
  const skip = ui.tut ? <button onPointerDown={run((): void => { game.current?.skipTut(); })} style={wood("#cfe8f0", { height: Math.max(32, Math.round(bs * 0.55)), width: "100%", fontSize: Math.max(11, fs - 3) })}>SKIP HINTS</button> : null;
  const rich = ui.gold >= 25;
  const upBtn = <button onPointerDown={tapK("KeyU")} style={wood(rich ? "#ffd84a" : "#e8cf9a", { height: Math.max(32, Math.round(bs * 0.55)), width: "100%", padding: 0, fontSize: Math.max(11, fs - 3) })}>✦ UPGRADES</button>;
  const bagBtn = <button onPointerDown={tapK("KeyI")} style={wood("#cfe8f0", { height: Math.max(32, Math.round(bs * 0.55)), width: "100%", padding: 0, fontSize: Math.max(11, fs - 3) })}>▣ BAG</button>;
  const upRow = <div style={{ display: "flex", gap: 4, width: "100%" }}>{land ? <>{bagBtn}<button onPointerDown={tapK("KeyU")} style={wood(rich ? "#ffd84a" : "#e8cf9a", { height: Math.max(32, Math.round(bs * 0.55)), width: "100%", padding: 0, fontSize: Math.max(11, fs - 3) })}>✦ UPG</button></> : <>{bagBtn}{upBtn}</>}</div>;
  const chipH = land ? clamp(Math.round(bs * 0.62), 30, 52) : clamp(Math.round(vp.w / 11), 34, 48);
  const chip = (p: SpellUi) => <button key={p.id} aria-label={"select " + p.id} onPointerDown={tapK("Sel:" + p.id)} style={wood(p.on ? "#ffb35c" : "#f6deb0", { height: chipH, flex: "1 1 0", minWidth: 0, padding: "0 2px", fontSize: Math.max(10, Math.round(Math.min(fs - 2, chipH * 0.32))), border: p.on ? "3px solid #e0583c" : "3px solid #5a3a22", opacity: p.ok ? 1 : 0.55, whiteSpace: "normal" })}>{p.on ? "▶ " : ""}{p.l}</button>;
  const spellPick = spRow ? <div style={{ display: "flex", flexDirection: land ? "column" : "row", gap: 4, width: land ? leftW - 8 : "100%", flex: "none" }}>{ui.spells.map(chip)}</div> : null;
  const acts = land ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: rightW, flex: "none" }}>
      {skip}
      {upRow}
      {actBtn("ACT", "Use", "#8cc94f", bs, "100%")}
      {actBtn(ui.sp, "Spell", isWiz ? "#ffb35c" : "#9fd0f0", bs, "100%")}
      {actBtn("POTION", "Potion", "#f4a3b5", bs, "100%")}
      {actBtn("WAIT", "Wait", "#f6deb0", Math.round(bs * 0.8), "100%")}
    </div>
  ) : (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(2, ${Math.round(bs * 1.3)}px)`, gap: 6, flex: "none" }}>
      {actBtn("ACT", "Use", "#8cc94f", bs, "100%")}
      {actBtn(ui.sp, "Spell", isWiz ? "#ffb35c" : "#9fd0f0", bs, "100%")}
      {actBtn("POTION", "Potion", "#f4a3b5", bs, "100%")}
      {actBtn("WAIT", "Wait", "#f6deb0", bs, "100%")}
      <div style={{ gridColumn: "1 / 3", display: "flex", gap: 6 }}>{skip}{bagBtn}{upBtn}</div>
    </div>
  );
  const mb = (lbl: string, f: () => void, bg = "#f6deb0") => <button key={lbl} onPointerDown={run(f)} style={wood(bg, { height: menuH, width: land ? "100%" : "auto", flex: land ? "none" : "1 1 45%" })}>{lbl}</button>;
  const toggleTut = (): void => { const v = !tutOn; setTutOn(v); LS.set("dndTut", v ? "1" : "0"); game.current?.setTut(v); };
  let menu: ReturnType<typeof mb>[] = [];
  if (isTitle) { menu = [mb("⚔ ENTER AS " + hero, (): void => { game.current?.startSel(); }, "#8cc94f"), mb("★ TRAINING", (): void => { game.current?.train(); }, "#ffd84a")]; if (ui.saved) { menu.push(mb("▶ CONTINUE", (): void => { game.current?.load(); }, "#9fd0f0")); menu.push(mb("✦ UPGRADES", (): void => { game.current?.key("KeyU"); }, "#ffd84a")); } menu.push(mb("HINTS: " + (tutOn ? "ON" : "OFF"), toggleTut)); }
  else if (ui.mode === "guide") menu = [mb("◀ BACK", (): void => { game.current?.guide(-1); }), mb("NEXT ▶", (): void => { game.current?.guide(1); }, "#8cc94f"), mb("✕ CLOSE", (): void => { game.current?.guide(0); })];
  else if (ui.mode === "trained") menu = [mb("START FLOOR 1", (): void => { game.current?.startSel(); }, "#8cc94f"), mb("BACK TO TITLE", (): void => { game.current?.key("Escape"); })];
  else if (ui.mode === "dead") menu = [mb("↻ RETRY FLOOR " + ui.floor, (): void => { game.current?.retryFloor(); }, "#8cc94f"), mb("NEW GAME", (): void => { game.current?.newGame(); }), mb("BACK TO TITLE", (): void => { game.current?.key("Escape"); })];
  else if (ui.mode === "upg") menu = [mb("REFUND ALL", (): void => { game.current?.key("KeyR"); }, ui.from === "play" ? "#c9b48a" : "#f4a3b5"), mb(ui.from === "clear" ? "NEXT FLOOR ▶" : "DONE ✓", (): void => { game.current?.key("Done"); }, "#9fd0f0")];
  else if (ui.mode === "inv") menu = [mb("DONE ✓", (): void => { game.current?.key("Done"); }, "#9fd0f0")];
  else if (ui.mode === "win") menu = [mb("↻ PLAY AGAIN AS " + hero, (): void => { game.current?.retry(); }, "#8cc94f"), mb("BACK TO TITLE", (): void => { game.current?.key("Escape"); })];
  const menuBox = <div style={land ? { display: "flex", flexDirection: "column", gap: 8, width: leftW, flex: "none" } : { display: "flex", flexWrap: "wrap", gap: 8, width: "100%", flex: "none" }}>{menu}</div>;
  const canvasEl = <canvas ref={cv} tabIndex={0} width={LW * K} height={LH * K} style={{ width: LW * s, height: LH * s, imageRendering: "pixelated", touchAction: "none", outline: "none", borderRadius: 6, flex: "none", display: "block" }} />;
  const rootStyle: CSSProperties = { width: "100%", height: vp.h, overflow: "hidden", display: "flex", flexDirection: land ? "row" : "column", alignItems: "center", justifyContent: "center", gap, padding: gap, boxSizing: "border-box", touchAction: "none", userSelect: "none", outline: "none" };
  return (
    <div ref={root} tabIndex={0} onKeyDown={onKey} style={rootStyle}>
      {land ? (play ? <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", flex: "none" }}>{pad}{spellPick}</div> : menuBox) : null}
      {canvasEl}
      {land ? (play ? acts : null) : (play ? <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", flex: "none" }}>{spellPick}<div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", width: "100%" }}>{pad}{acts}</div></div> : menuBox)}
    </div>
  );
}
