'use strict';
(function () {
  // ================= Настройки =================
  const SAVE_KEY = 'space_clicker_save_v1';
  const OFFLINE_MAX_SEC = 8 * 3600;   // максимум оффлайн-накопления
  const OFFLINE_RATE = 0.5;           // доля дохода в оффлайне
  const BOOST_MS = 120 * 1000;        // x2 за рекламу
  const AD_INTERVAL_MS = 90 * 1000;   // не чаще одной полноэкранной рекламы
  const TAU = Math.PI * 2;

  // dps — доход в секунду за 1 уровень, click — сила клика
  const UPGRADES = [
    { id: 'drill', click: 1, base: 10, growth: 1.4 },
    { id: 'robot', dps: 1, base: 15 },
    { id: 'rover', dps: 6, base: 120 },
    { id: 'rocket', dps: 40, base: 1300 },
    { id: 'station', dps: 250, base: 14000 },
    { id: 'ufo', dps: 1600, base: 160000 },
    { id: 'factory', dps: 10000, base: 2e6 },
    { id: 'blackhole', dps: 70000, base: 3e7 },
    { id: 'portal', dps: 500000, base: 5e8 },
  ];

  const PLANETS = [
    { id: 'moon', cost: 0, mult: 1, c: ['#f4f4fa', '#6a6a80'], spin: 0.015,
      spots: { n: 10, color: 'rgba(80,80,105,.45)', min: 0.08, max: 0.2 } },
    { id: 'mars', cost: 1e4, mult: 3, c: ['#ffa071', '#8c2c14'], spin: 0.02,
      spots: { n: 8, color: 'rgba(110,35,15,.45)', min: 0.08, max: 0.22 } },
    { id: 'earth', cost: 2e5, mult: 8, c: ['#7fd0ff', '#1240a0'], spin: 0.025, clouds: true,
      spots: { n: 7, color: '#4cbf5c', min: 0.18, max: 0.35 } },
    { id: 'venus', cost: 3e6, mult: 20, c: ['#fff0b8', '#c98325'], spin: 0.01,
      bands: ['#f7d98e', '#eab765', '#f9e6b0', '#dda04d', '#f4d184', '#e9b45f'] },
    { id: 'jupiter', cost: 5e7, mult: 50, c: ['#f6dcb8', '#9c5a30'], spin: 0.02, redSpot: true,
      bands: ['#e9c39a', '#c98b5e', '#f3dcc0', '#b8754a', '#ecd0ad', '#c28457', '#f0d6b4'] },
    { id: 'saturn', cost: 8e8, mult: 120, c: ['#fdeec4', '#c4964a'], ring: '#e9d29c',
      bands: ['#f3dca5', '#e6c585', '#f7e6bb', '#dcb874'] },
    { id: 'uranus', cost: 1.5e10, mult: 300, c: ['#d6fdff', '#3aa9bd'], ring: 'rgba(210,250,255,.55)', thinRing: true,
      bands: ['#bff3f7', '#a6e8ef'] },
    { id: 'neptune', cost: 3e11, mult: 700, c: ['#8bb4ff', '#182c96'],
      bands: ['#5f88ec', '#7aa0f5', '#4a71db'],
      spots: { n: 2, color: 'rgba(20,30,110,.6)', min: 0.1, max: 0.14 } },
    { id: 'candy', cost: 6e12, mult: 1600, c: ['#ffc4ec', '#c1308c'], sprinkles: true, spin: 0.03 },
    { id: 'sun', cost: 1.5e14, mult: 4000, c: ['#fffbd0', '#ff8a00'], glow: true,
      spots: { n: 6, color: 'rgba(255,90,0,.35)', min: 0.06, max: 0.14 } },
  ];

  const TEXT = {
    ru: {
      title: 'Космический кликер',
      perSec: 'в сек.',
      click: 'Клик',
      tabUp: 'Улучшения',
      tabPlanets: 'Планеты',
      lvl: 'ур.',
      boost: 'x2 доход на 2 мин',
      boostLeft: 'x2 ещё',
      boostOn: 'Доход x2!',
      hint: 'Нажимай на планету!',
      offTitle: 'С возвращением!',
      offText: 'Пока тебя не было, роботы собрали звёздную пыль:',
      take: 'Забрать',
      takeX2: 'Забрать x2',
      here: 'Ты здесь',
      done: 'Пройдена',
      locked: '???',
      income: 'Доход',
      newPlanet: 'Новая планета!',
      comet: 'Комета!',
      up: {
        drill: 'Звёздный бур', robot: 'Робот-копатель', rover: 'Луноход', rocket: 'Грузовая ракета',
        station: 'Орбитальная станция', ufo: 'Летающая тарелка', factory: 'Фабрика пришельцев',
        blackhole: 'Чёрная дыра', portal: 'Звёздные врата',
      },
      planets: {
        moon: 'Луна', mars: 'Марс', earth: 'Земля', venus: 'Венера', jupiter: 'Юпитер', saturn: 'Сатурн',
        uranus: 'Уран', neptune: 'Нептун', candy: 'Конфетная планета', sun: 'Солнце',
      },
    },
    en: {
      title: 'Space Clicker',
      perSec: 'per sec',
      click: 'Click',
      tabUp: 'Upgrades',
      tabPlanets: 'Planets',
      lvl: 'lv.',
      boost: 'x2 income for 2 min',
      boostLeft: 'x2 for',
      boostOn: 'Income x2!',
      hint: 'Tap the planet!',
      offTitle: 'Welcome back!',
      offText: 'While you were away, your robots collected star dust:',
      take: 'Collect',
      takeX2: 'Collect x2',
      here: 'You are here',
      done: 'Visited',
      locked: '???',
      income: 'Income',
      newPlanet: 'New planet!',
      comet: 'Comet!',
      up: {
        drill: 'Star Drill', robot: 'Digger Bot', rover: 'Rover', rocket: 'Cargo Rocket',
        station: 'Space Station', ufo: 'Flying Saucer', factory: 'Alien Factory',
        blackhole: 'Black Hole', portal: 'Star Gate',
      },
      planets: {
        moon: 'Moon', mars: 'Mars', earth: 'Earth', venus: 'Venus', jupiter: 'Jupiter', saturn: 'Saturn',
        uranus: 'Uranus', neptune: 'Neptune', candy: 'Candy Planet', sun: 'The Sun',
      },
    },
  };

  // Иконки улучшений (viewBox 0 0 48 48)
  const ICONS = {
    drill: '<rect x="12" y="5" width="24" height="10" rx="3" fill="#7c5cff"/><path d="M24 45 13 15h22z" fill="#ffb84a"/><path d="M16 22h16M18.5 29h11M21 36h6" stroke="#c97a10" stroke-width="3"/>',
    robot: '<line x1="24" y1="14" x2="24" y2="7" stroke="#9ad0ff" stroke-width="3"/><circle cx="24" cy="6" r="3.5" fill="#ff5c8a"/><rect x="9" y="14" width="30" height="25" rx="7" fill="#9ad0ff"/><circle cx="18.5" cy="25" r="4.5" fill="#142060"/><circle cx="29.5" cy="25" r="4.5" fill="#142060"/><circle cx="20" cy="23.5" r="1.5" fill="#fff"/><circle cx="31" cy="23.5" r="1.5" fill="#fff"/><rect x="18" y="32" width="12" height="3" rx="1.5" fill="#142060"/>',
    rover: '<line x1="30" y1="18" x2="34" y2="8" stroke="#ccd3ff" stroke-width="2.5"/><ellipse cx="35" cy="8" rx="6" ry="3" fill="#ccd3ff"/><rect x="6" y="18" width="36" height="12" rx="4" fill="#ff8a3c"/><rect x="10" y="20" width="10" height="6" rx="2" fill="#4aa8ff"/><circle cx="12" cy="35" r="6" fill="#2b2f4a"/><circle cx="24" cy="35" r="6" fill="#2b2f4a"/><circle cx="36" cy="35" r="6" fill="#2b2f4a"/><circle cx="12" cy="35" r="2" fill="#aab"/><circle cx="24" cy="35" r="2" fill="#aab"/><circle cx="36" cy="35" r="2" fill="#aab"/>',
    rocket: '<path d="M19 33h10l-5 12z" fill="#ffb84a"/><path d="M24 3c8 6 10 16 8 30H16C14 19 16 9 24 3z" fill="#f2f4ff"/><circle cx="24" cy="18" r="4.5" fill="#4aa8ff" stroke="#8aa0d0" stroke-width="2"/><path d="M16 25 9 37h8zM32 25l7 12h-8z" fill="#ff5c5c"/>',
    station: '<rect x="3" y="17" width="13" height="14" rx="1" fill="#4aa8ff"/><rect x="32" y="17" width="13" height="14" rx="1" fill="#4aa8ff"/><path d="M9.5 17v14M38.5 17v14M3 24h13M32 24h13" stroke="#1f5fa8" stroke-width="1.5"/><rect x="15" y="22" width="18" height="4" fill="#c7cce8"/><circle cx="24" cy="24" r="8" fill="#e8ecff"/><circle cx="24" cy="24" r="3.5" fill="#7c5cff"/>',
    ufo: '<path d="M17 33 12 45h24l-5-12z" fill="#9effd0" opacity=".35"/><ellipse cx="24" cy="21" rx="9" ry="9" fill="#9effd0"/><ellipse cx="21" cy="18" rx="2.5" ry="3" fill="#fff" opacity=".7"/><ellipse cx="24" cy="28" rx="21" ry="7" fill="#b9c2e8"/><circle cx="12" cy="28" r="2.2" fill="#ffd24a"/><circle cx="24" cy="30" r="2.2" fill="#ffd24a"/><circle cx="36" cy="28" r="2.2" fill="#ffd24a"/>',
    factory: '<rect x="33" y="6" width="7" height="18" fill="#5bb84b"/><circle cx="38" cy="4" r="3" fill="#d6ffe0" opacity=".7"/><path d="M5 43V22l10-8v8l10-8v8l10-8v29z" fill="#7cdc6a"/><rect x="5" y="30" width="38" height="13" fill="#7cdc6a"/><circle cx="24" cy="35" r="5" fill="#fff"/><circle cx="24" cy="35" r="2.5" fill="#2a1f5c"/><rect x="9" y="32" width="6" height="6" fill="#ffe066"/><rect x="33" y="32" width="6" height="6" fill="#ffe066"/>',
    blackhole: '<circle cx="24" cy="24" r="17" fill="#3b1a6b" opacity=".6"/><ellipse cx="24" cy="24" rx="22" ry="7" fill="none" stroke="#ff9a3c" stroke-width="4"/><circle cx="24" cy="24" r="10" fill="#000" stroke="#c77dff" stroke-width="3"/><path d="M4 24a20 7 0 0 0 40 0" fill="none" stroke="#ffd24a" stroke-width="2.5"/>',
    portal: '<circle cx="24" cy="24" r="19" fill="none" stroke="#7c5cff" stroke-width="6"/><circle cx="24" cy="24" r="13" fill="#43e0ff" opacity=".65"/><circle cx="24" cy="24" r="6" fill="#fff"/><circle cx="24" cy="4" r="3" fill="#ffd24a"/><circle cx="24" cy="44" r="3" fill="#ffd24a"/><circle cx="4" cy="24" r="3" fill="#ffd24a"/><circle cx="44" cy="24" r="3" fill="#ffd24a"/>',
  };
  const SVG_PLAY = '<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="4" fill="#3a2200"/><path d="M10 8.5v7l6-3.5z" fill="#ffd24a"/></svg>';
  const SVG_SOUND_ON = '<svg viewBox="0 0 24 24"><path d="M3 9h4l5-4v14l-5-4H3z" fill="#fff"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const SVG_SOUND_OFF = '<svg viewBox="0 0 24 24"><path d="M3 9h4l5-4v14l-5-4H3z" fill="#fff"/><path d="M16 9l6 6M22 9l-6 6" stroke="#ff8a8a" stroke-width="2.2" stroke-linecap="round"/></svg>';

  // ================= Состояние =================
  const state = {
    dust: 0, total: 0, levels: {}, planet: 0,
    boostUntil: 0, lastSeen: 0, clicks: 0, sound: true,
  };
  let T = TEXT.ru;
  let paused = false;
  let tab = 'up';
  let lastAdTime = 0;

  const $ = (id) => document.getElementById(id);
  const lvl = (id) => state.levels[id] || 0;

  // ================= Экономика =================
  function upCost(u) { return Math.ceil(u.base * Math.pow(u.growth || 1.15, lvl(u.id))); }
  function boostActive() { return state.boostUntil > Date.now(); }
  function boostMul() { return boostActive() ? 2 : 1; }
  function planetMul() { return PLANETS[state.planet].mult; }
  function baseDps() {
    let s = 0;
    for (const u of UPGRADES) if (u.dps) s += u.dps * lvl(u.id);
    return s * planetMul();
  }
  function dps() { return baseDps() * boostMul(); }
  function clickValue() {
    const d = lvl('drill');
    const base = (1 + d) * Math.pow(2, Math.floor(d / 10));
    return (base * planetMul() + baseDps() * 0.03) * boostMul();
  }
  function addDust(v) { state.dust += v; state.total += v; }

  const SUFFIX = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  function fmt(n) {
    if (n < 1000) return String(Math.floor(n));
    let i = -1;
    while (n >= 1000 && i < SUFFIX.length - 1) { n /= 1000; i++; }
    const s = n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n).toString();
    return parseFloat(s) + SUFFIX[i];
  }

  // ================= Платформа (platform.js: Яндекс, VK или локальная заглушка) =================
  const Platform = window.Platform;

  // ================= Сохранения =================
  // Локально — всегда, в облако площадки (если оно есть) — реже: при уходе из игры и раз в 30 сек.
  function save(cloud) {
    state.lastSeen = Date.now();
    const json = JSON.stringify(state);
    try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* хранилище недоступно */ }
    if (cloud) Platform.saveData(json);
  }
  async function load() {
    let local = null, remote = null;
    try { local = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { /* битое сохранение */ }
    try { remote = JSON.parse(await Platform.loadData()); } catch (e) { /* битое сохранение */ }
    const freshest = [local, remote]
      .filter((d) => d && typeof d === 'object')
      .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))[0];
    if (freshest) Object.assign(state, freshest);
    if (!PLANETS[state.planet]) state.planet = 0;
  }

  // ================= Реклама =================
  async function showAd(kind) {
    setPaused(true);
    try {
      return kind === 'reward' ? await Platform.showRewarded() : await Platform.showInterstitial();
    } catch (e) {
      return false;
    } finally {
      setPaused(false);
    }
  }

  function maybeInterstitial() {
    if (Date.now() - lastAdTime < AD_INTERVAL_MS) return;
    lastAdTime = Date.now();
    showAd('interstitial');
  }

  function setPaused(p) {
    if (paused === p) return;
    paused = p;
    Sfx.updateVolume();
    if (p) Platform.gameStop(); else if (!document.hidden) Platform.gameStart();
  }

  // ================= Звук (синтез, без файлов) =================
  const Sfx = {
    ctx: null, master: null,
    unlock() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.updateVolume();
    },
    updateVolume() {
      if (this.master) this.master.gain.value = (state.sound && !paused && !document.hidden) ? 1 : 0;
    },
    tone(freq, dur, type, vol, slide, delay) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
      g.gain.setValueAtTime(vol || 0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },
    click() { this.tone(520 + Math.random() * 260, 0.08, 'sine', 0.12, 1.6); },
    buy() { this.tone(660, 0.1, 'triangle', 0.14); this.tone(990, 0.16, 'triangle', 0.14, 1, 0.08); },
    fail() { this.tone(200, 0.14, 'square', 0.05, 0.7); },
    arp(notes) { notes.forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.14, 1, i * 0.09)); },
    comet() { this.arp([880, 1175, 1568]); },
    planet() { this.arp([523, 659, 784, 1047]); },
  };

  // ================= Подготовка графики =================
  function rng(seed) {
    seed = seed % 2147483647;
    if (seed <= 0) seed += 2147483646;
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  PLANETS.forEach((p, i) => {
    const rnd = rng(i * 977 + 13);
    p.spin = p.spin || 0.012;
    p.spotList = [];
    if (p.spots) {
      for (let k = 0; k < p.spots.n; k++) {
        p.spotList.push({
          u: rnd(), v: (rnd() * 2 - 1) * 0.75,
          s: p.spots.min + rnd() * (p.spots.max - p.spots.min),
          ry: 0.7 + rnd() * 0.5, a: 0, col: p.spots.color,
        });
      }
    }
    if (p.redSpot) p.spotList.push({ u: 0.3, v: 0.35, s: 0.2, ry: 0.55, a: 0, col: '#c4532e' });
    if (p.sprinkles) {
      const cols = ['#ffffff', '#7cf0ff', '#ffe066', '#8dff8a', '#b38cff', '#ff6b6b'];
      for (let k = 0; k < 44; k++) {
        p.spotList.push({ u: rnd(), v: (rnd() * 2 - 1) * 0.9, s: 0.07, ry: 0.3, a: rnd() * Math.PI, col: cols[k % cols.length] });
      }
    }
    if (p.clouds) {
      p.cloudList = [];
      for (let k = 0; k < 7; k++) {
        p.cloudList.push({ u: rnd(), v: (rnd() * 2 - 1) * 0.8, s: 0.12 + rnd() * 0.14, ry: 0.4, a: 0, col: 'rgba(255,255,255,.6)' });
      }
    }
  });

  const ICON_IMG = {};
  for (const id in ICONS) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' + ICONS[id] + '</svg>');
    ICON_IMG[id] = img;
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // Пятна/кратеры/материки, которые «вращаются» вместе с планетой
  function drawSpots(ctx, x, y, r, list, rot) {
    for (const s of list) {
      const lon = (((s.u + rot) % 1) + 1) % 1 * TAU - Math.PI;
      const cosL = Math.cos(lon);
      if (cosL < -0.05) continue;
      const ring = Math.sqrt(1 - s.v * s.v);
      const px = x + Math.sin(lon) * ring * r;
      const py = y + s.v * r;
      const sz = s.s * r;
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.ellipse(px, py, Math.max(0.5, sz * Math.max(cosL, 0.08)), sz * s.ry, s.a, 0, TAU);
      ctx.fill();
    }
  }

  function drawRing(ctx, x, y, r, p, back) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.35);
    ctx.scale(1, 0.28);
    ctx.beginPath();
    if (back) ctx.arc(0, 0, r * 1.75, Math.PI, TAU);
    else ctx.arc(0, 0, r * 1.75, 0, Math.PI);
    ctx.strokeStyle = p.ring;
    ctx.lineWidth = r * (p.thinRing ? 0.12 : 0.38);
    ctx.stroke();
    if (!p.thinRing) {
      ctx.strokeStyle = 'rgba(120,80,30,.35)';
      ctx.lineWidth = r * 0.05;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlanet(ctx, x, y, r, p, time, opts) {
    opts = opts || {};
    if (opts.locked) {
      ctx.fillStyle = '#262e66';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#8f9bd6';
      ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', x, y + r * 0.05);
      return;
    }
    if (p.glow) {
      const k = 1 + Math.sin(time * 2) * 0.04;
      const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.8 * k);
      g.addColorStop(0, 'rgba(255,190,60,.6)');
      g.addColorStop(1, 'rgba(255,120,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 1.8 * k, 0, TAU); ctx.fill();
    } else if (opts.halo) {
      const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.45);
      g.addColorStop(0, hexA(p.c[0], 0.28));
      g.addColorStop(1, hexA(p.c[0], 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 1.45, 0, TAU); ctx.fill();
    }
    if (p.ring) drawRing(ctx, x, y, r, p, true);

    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    const base = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
    base.addColorStop(0, p.c[0]);
    base.addColorStop(1, p.c[1]);
    ctx.fillStyle = base;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    if (p.bands) {
      const n = p.bands.length, h = (r * 2) / n;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = p.bands[i];
        const wob = Math.sin(time * 0.6 + i * 1.7) * r * 0.015;
        ctx.fillRect(x - r, y - r + i * h + h * 0.15 + wob, r * 2, h * 0.7);
      }
      ctx.globalAlpha = 1;
    }
    const rot = time * p.spin;
    if (p.spotList.length) drawSpots(ctx, x, y, r, p.spotList, rot);
    if (p.cloudList) drawSpots(ctx, x, y, r, p.cloudList, rot * 1.6);

    if (!p.glow) {
      const sh = ctx.createRadialGradient(x - r * 0.45, y - r * 0.45, r * 0.3, x - r * 0.1, y - r * 0.1, r * 1.35);
      sh.addColorStop(0, 'rgba(0,0,30,0)');
      sh.addColorStop(0.6, 'rgba(0,0,30,.12)');
      sh.addColorStop(1, 'rgba(0,0,30,.6)');
      ctx.fillStyle = sh;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const hl = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, 0, x - r * 0.4, y - r * 0.45, r * 0.45);
    hl.addColorStop(0, 'rgba(255,255,255,.35)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();

    if (p.ring) drawRing(ctx, x, y, r, p, false);
  }

  // ================= Сцена =================
  const canvas = $('bg');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');
  let W = 0, H = 0, dpr = 1, bgGrad = null;
  let stageRect = { left: 0, top: 0, width: 0, height: 0 };
  let cx = 0, cy = 0, R = 100;

  const stars = Array.from({ length: 170 }, () => ({
    x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3,
    ph: Math.random() * TAU, sp: 0.5 + Math.random() * 2,
  }));
  const particles = [];
  const floats = [];
  let banner = null;
  let flash = 0;
  let pulse = 0;
  let appear = 1;
  let time = 0;
  let comet = null;
  let nextComet = 20 + Math.random() * 20;
  let orbiters = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    bgGrad = ctx.createRadialGradient(W * 0.3, H * 0.25, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.9);
    bgGrad.addColorStop(0, '#1f1a5e');
    bgGrad.addColorStop(0.5, '#0d1238');
    bgGrad.addColorStop(1, '#05081a');
    updateStageRect();
  }
  function updateStageRect() {
    const b = stage.getBoundingClientRect();
    stageRect = { left: b.left, top: b.top, width: b.width, height: b.height };
    cx = b.left + b.width / 2;
    cy = b.top + b.height / 2 + 6;
    R = Math.max(40, Math.min(b.width, b.height) * 0.3);
  }

  function buildOrbiters() {
    orbiters = [];
    for (const u of UPGRADES) {
      if (!u.dps) continue;
      const n = Math.min(lvl(u.id), 3);
      for (let i = 0; i < n; i++) orbiters.push(u.id);
    }
  }

  function drawOrbiters(back) {
    const n = orbiters.length;
    for (let i = 0; i < n; i++) {
      const a = time * 0.35 + (i / n) * TAU;
      const s = Math.sin(a);
      if (back !== (s < 0)) continue;
      const ox = cx + Math.cos(a) * R * 1.5;
      const oy = cy + s * R * 0.42;
      const size = R * 0.3 * (0.85 + 0.15 * s);
      const img = ICON_IMG[orbiters[i]];
      if (!img.complete) continue;
      ctx.globalAlpha = back ? 0.55 : 1;
      ctx.drawImage(img, ox - size / 2, oy - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function burst(x, y, n, colors, speed) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = speed * (0.4 + Math.random() * 0.8);
      particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0.6 + Math.random() * 0.5, max: 1.1,
        size: 2 + Math.random() * 3.5, color: colors[i % colors.length],
      });
    }
  }
  function floatText(x, y, text, color, size) {
    floats.push({ x, y, text, color: color || '#ffd24a', size: size || 24, life: 1 });
  }
  function showBanner(text) { banner = { text, life: 2.4 }; }

  // ---------- Комета ----------
  function spawnComet() {
    const r = stageRect;
    const fromLeft = Math.random() < 0.5;
    const speed = Math.max(120, r.width / 5);
    comet = {
      x: fromLeft ? r.left - 40 : r.left + r.width + 40,
      y: r.top + r.height * (0.15 + Math.random() * 0.3),
      vx: fromLeft ? speed : -speed,
      vy: speed * 0.12 * (Math.random() * 2 - 1),
      life: (r.width + 100) / speed,
    };
  }
  function updateComet(dt) {
    if (!comet) {
      nextComet -= dt;
      if (nextComet <= 0) spawnComet();
      return;
    }
    comet.x += comet.vx * dt;
    comet.y += comet.vy * dt;
    comet.life -= dt;
    if (Math.random() < 0.5) {
      particles.push({ x: comet.x, y: comet.y, vx: -comet.vx * 0.1 + (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
        life: 0.5, max: 0.5, size: 2 + Math.random() * 2, color: '#fff3b0' });
    }
    if (comet.life <= 0) { comet = null; nextComet = 35 + Math.random() * 40; }
  }
  function drawComet() {
    if (!comet) return;
    const len = 110;
    const nx = -comet.vx / Math.hypot(comet.vx, comet.vy);
    const ny = -comet.vy / Math.hypot(comet.vx, comet.vy);
    const g = ctx.createLinearGradient(comet.x, comet.y, comet.x + nx * len, comet.y + ny * len);
    g.addColorStop(0, 'rgba(255,240,170,.9)');
    g.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(comet.x + nx * len, comet.y + ny * len); ctx.stroke();
    const k = 1 + Math.sin(time * 12) * 0.15;
    const hg = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 22 * k);
    hg.addColorStop(0, '#ffffff');
    hg.addColorStop(0.35, '#ffe27a');
    hg.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(comet.x, comet.y, 22 * k, 0, TAU); ctx.fill();
  }
  function catchComet() {
    const reward = Math.max(dps() * 30, clickValue() * 25, 50);
    addDust(reward);
    burst(comet.x, comet.y, 30, ['#ffe27a', '#fff', '#ffb020'], 260);
    floatText(comet.x, comet.y - 10, T.comet + ' +' + fmt(reward), '#fff3b0', 26);
    Sfx.comet();
    comet = null;
    nextComet = 35 + Math.random() * 40;
  }

  // ---------- Отрисовка кадра ----------
  function render(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      s.x -= 0.002 * s.r * dt;
      if (s.x < 0) s.x += 1;
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time * s.sp + s.ph));
      ctx.fillStyle = '#fff';
      ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    const p = PLANETS[state.planet];
    const easeBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
    const scale = easeBack(Math.min(appear, 1)) * (1 - 0.07 * pulse);
    const r = R * scale;

    drawOrbiters(true);
    drawPlanet(ctx, cx, cy, r, p, time, { halo: true });
    drawOrbiters(false);

    for (const q of particles) {
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.color;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawComet();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const f of floats) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.font = `800 ${f.size}px "Trebuchet MS", sans-serif`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(20,10,50,.85)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    if (banner) {
      const t = 2.4 - banner.life;
      const k = Math.min(1, t * 4);
      ctx.globalAlpha = Math.min(1, banner.life * 2);
      ctx.font = `800 ${Math.round(32 * (0.6 + 0.4 * k))}px "Trebuchet MS", sans-serif`;
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(40,10,90,.9)';
      const by = stageRect.top + stageRect.height * 0.2;
      ctx.strokeText(banner.text, cx, by);
      ctx.fillStyle = '#ffe27a';
      ctx.fillText(banner.text, cx, by);
      ctx.globalAlpha = 1;
    }

    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flash * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function updateFx(dt) {
    pulse = Math.max(0, pulse - dt * 8);
    flash = Math.max(0, flash - dt * 1.5);
    if (appear < 1) appear = Math.min(1, appear + dt * 1.6);
    for (let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i];
      q.x += q.vx * dt; q.y += q.vy * dt;
      q.vx *= 1 - dt * 2; q.vy *= 1 - dt * 2;
      q.life -= dt;
      if (q.life <= 0) particles.splice(i, 1);
    }
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.y -= 70 * dt;
      f.life -= dt;
      if (f.life <= 0) floats.splice(i, 1);
    }
    if (banner) { banner.life -= dt; if (banner.life <= 0) banner = null; }
  }

  // ================= Клики =================
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    Sfx.unlock();
    if (paused) return;
    const x = e.clientX, y = e.clientY;
    if (comet && Math.hypot(x - comet.x, y - comet.y) < 48) { catchComet(); return; }
    if (Math.hypot(x - cx, y - cy) > R * 1.1) return;

    const v = clickValue();
    addDust(v);
    pulse = 1;
    const p = PLANETS[state.planet];
    burst(x, y, 7, [p.c[0], '#ffd24a', '#fff'], 180);
    floatText(x + (Math.random() - 0.5) * 30, y - 20, '+' + fmt(v));
    Sfx.click();
    state.clicks++;
    if (state.clicks >= 8) $('hint').classList.add('hidden');
  });

  // ================= Магазин =================
  const list = $('list');
  let shopRefs = [];

  function makeItem(iconHtml, name, lvlText) {
    const el = document.createElement('button');
    el.className = 'item';
    el.innerHTML =
      `<div class="icon">${iconHtml}</div>` +
      `<div class="info"><div class="name">${name}<span class="lvl">${lvlText || ''}</span></div><div class="desc"></div></div>` +
      `<div class="cost"></div>`;
    return el;
  }

  function planetThumb(p, locked) {
    const c = document.createElement('canvas');
    c.width = c.height = 104;
    const g = c.getContext('2d');
    g.scale(2, 2);
    drawPlanet(g, 26, 26, p.ring ? 14 : 21, p, 0, { locked });
    return c;
  }

  function renderShop() {
    list.innerHTML = '';
    shopRefs = [];
    if (tab === 'up') {
      UPGRADES.forEach((u, i) => {
        if (i >= 3 && !lvl(UPGRADES[i - 1].id)) {
          if (!lvl(UPGRADES[i - 2].id)) return;
          const el = makeItem('<span style="font-size:28px;font-weight:800;color:#8f9bd6">?</span>', T.locked);
          el.classList.add('locked');
          list.appendChild(el);
          return;
        }
        const el = makeItem(`<svg viewBox="0 0 48 48">${ICONS[u.id]}</svg>`, T.up[u.id]);
        el.addEventListener('click', () => buyUpgrade(u, el));
        list.appendChild(el);
        shopRefs.push({ el, u });
      });
    } else {
      PLANETS.forEach((p, i) => {
        if (i > state.planet + 2) return;
        const locked = i > state.planet + 1;
        const el = makeItem('', locked ? T.locked : T.planets[p.id]);
        el.querySelector('.icon').appendChild(planetThumb(p, locked));
        el.querySelector('.desc').textContent = `${T.income} x${p.mult}`;
        const cost = el.querySelector('.cost');
        if (i < state.planet) { cost.textContent = '✓ ' + T.done; cost.classList.add('ok'); }
        else if (i === state.planet) { cost.textContent = T.here; cost.classList.add('ok'); el.classList.add('current'); }
        else if (locked) { el.classList.add('locked'); }
        else {
          cost.innerHTML = `<i class="star sm"></i><span>${fmt(p.cost)}</span>`;
          el.addEventListener('click', () => buyPlanet(i, el));
          shopRefs.push({ el, planet: p });
        }
        list.appendChild(el);
      });
    }
    refreshShop();
  }

  function refreshShop() {
    for (const ref of shopRefs) {
      if (ref.u) {
        const u = ref.u;
        const cost = upCost(u);
        ref.el.classList.toggle('can', state.dust >= cost);
        ref.el.querySelector('.lvl').textContent = lvl(u.id) ? ` ${T.lvl} ${lvl(u.id)}` : '';
        ref.el.querySelector('.desc').textContent = u.click
          ? `${T.click}: +${fmt(clickValue())}`
          : `+${fmt(u.dps * planetMul() * boostMul())} ${T.perSec}`;
        ref.el.querySelector('.cost').innerHTML = `<i class="star sm"></i><span>${fmt(cost)}</span>`;
      } else {
        ref.el.classList.toggle('can', state.dust >= ref.planet.cost);
      }
    }
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  function buyUpgrade(u, el) {
    Sfx.unlock();
    const cost = upCost(u);
    if (state.dust < cost) { shake(el); Sfx.fail(); return; }
    state.dust -= cost;
    state.levels[u.id] = lvl(u.id) + 1;
    Sfx.buy();
    buildOrbiters();
    const unlockedNew = UPGRADES.indexOf(u) >= 2 && state.levels[u.id] === 1;
    if (unlockedNew) renderShop(); else refreshShop();
    save();
  }

  function buyPlanet(i, el) {
    Sfx.unlock();
    const p = PLANETS[i];
    if (i !== state.planet + 1) return;
    if (state.dust < p.cost) { shake(el); Sfx.fail(); return; }
    state.dust -= p.cost;
    state.planet = i;
    appear = 0;
    flash = 1;
    burst(cx, cy, 50, [p.c[0], p.c[1], '#ffd24a', '#fff'], 340);
    showBanner(T.newPlanet);
    Sfx.planet();
    updatePlanetLabel();
    renderShop();
    save(true);
    setTimeout(maybeInterstitial, 1600);
  }

  // ================= HUD =================
  const boostBtn = $('boost-btn');
  const soundBtn = $('sound-btn');

  function updatePlanetLabel() { $('planet-name').textContent = T.planets[PLANETS[state.planet].id]; }

  function updateHud() {
    $('dust').textContent = fmt(state.dust);
    $('dps').textContent = `${fmt(dps())} ${T.perSec}`;
    if (boostActive()) {
      const left = Math.ceil((state.boostUntil - Date.now()) / 1000);
      boostBtn.classList.add('active');
      boostBtn.disabled = true;
      boostBtn.textContent = `${T.boostLeft} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    } else if (boostBtn.classList.contains('active') || !boostBtn.innerHTML) {
      boostBtn.classList.remove('active');
      boostBtn.disabled = false;
      boostBtn.innerHTML = SVG_PLAY + `<span>${T.boost}</span>`;
    }
  }

  function updateSoundBtn() { soundBtn.innerHTML = state.sound ? SVG_SOUND_ON : SVG_SOUND_OFF; }

  boostBtn.addEventListener('click', async () => {
    Sfx.unlock();
    if (boostActive() || boostBtn.disabled) return;
    boostBtn.disabled = true;
    const ok = await showAd('reward');
    if (ok) {
      state.boostUntil = Date.now() + BOOST_MS;
      showBanner(T.boostOn);
      Sfx.planet();
      save();
      updateHud();
      refreshShop();
    } else {
      boostBtn.disabled = false;
    }
  });

  soundBtn.addEventListener('click', () => {
    state.sound = !state.sound;
    Sfx.unlock();
    Sfx.updateVolume();
    updateSoundBtn();
    save();
  });

  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => {
      Sfx.unlock();
      tab = b.dataset.tab;
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
      renderShop();
      list.scrollTop = 0;
    });
  });

  // ================= Оффлайн-доход =================
  function checkOffline() {
    if (!state.lastSeen) return;
    const sec = Math.min((Date.now() - state.lastSeen) / 1000, OFFLINE_MAX_SEC);
    const amount = Math.floor(baseDps() * sec * OFFLINE_RATE);
    if (sec < 60 || amount <= 0) return;

    const modal = $('modal');
    $('m-title').textContent = T.offTitle;
    $('m-text').textContent = T.offText;
    $('m-amount').textContent = fmt(amount);
    $('m-x2').innerHTML = SVG_PLAY + `<span>${T.takeX2}</span>`;
    $('m-take').textContent = T.take;
    modal.classList.remove('hidden');

    const close = (mult) => {
      addDust(amount * mult);
      modal.classList.add('hidden');
      floatText(cx, cy - R - 10, '+' + fmt(amount * mult), '#ffe27a', 30);
      Sfx.buy();
      save();
    };
    $('m-take').onclick = () => { Sfx.unlock(); close(1); maybeInterstitial(); };
    $('m-x2').onclick = async () => {
      Sfx.unlock();
      $('m-x2').disabled = true;
      const ok = await showAd('reward');
      $('m-x2').disabled = false;
      close(ok ? 2 : 1);
    };
  }

  // ================= Системное =================
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('visibilitychange', () => {
    Sfx.updateVolume();
    if (document.hidden) { save(true); Platform.gameStop(); }
    else if (!paused) Platform.gameStart();
  });
  window.addEventListener('pagehide', () => save(true));
  window.addEventListener('resize', resize);

  function applyTexts() {
    document.title = T.title;
    $('tab-up').textContent = T.tabUp;
    $('tab-planets').textContent = T.tabPlanets;
    $('hint').textContent = T.hint;
    if (state.clicks >= 8) $('hint').classList.add('hidden');
  }

  // ================= Игровой цикл =================
  let lastT = performance.now();
  let hudTimer = 0, shopTimer = 0, saveTimer = 0, cloudTimer = 0, layoutTimer = 0;

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 1);
    lastT = now;
    time += dt;

    if (!paused) {
      addDust(dps() * dt);
      updateComet(dt);
    }
    updateFx(dt);

    layoutTimer += dt;
    if (layoutTimer > 0.5) { layoutTimer = 0; updateStageRect(); }
    render(dt);

    hudTimer += dt;
    if (hudTimer > 0.1) { hudTimer = 0; updateHud(); }
    shopTimer += dt;
    if (shopTimer > 0.25) { shopTimer = 0; refreshShop(); }
    saveTimer += dt;
    if (saveTimer > 5) { saveTimer = 0; save(); }
    cloudTimer += dt;
    if (cloudTimer > 30) { cloudTimer = 0; save(true); }

    requestAnimationFrame(frame);
  }

  async function start() {
    await Platform.init({ onPause: () => setPaused(true), onResume: () => setPaused(false) });
    const code = String(Platform.lang() || '').slice(0, 2).toLowerCase();
    const lang = ['ru', 'be', 'kk', 'uk', 'uz'].includes(code) ? 'ru' : 'en';
    T = TEXT[lang];
    document.documentElement.lang = lang;

    await load();
    applyTexts();
    updateSoundBtn();
    resize();
    buildOrbiters();
    updatePlanetLabel();
    renderShop();
    updateHud();
    checkOffline();

    Platform.ready();
    Platform.gameStart();
    lastT = performance.now();
    requestAnimationFrame(frame);
  }

  start();
})();
