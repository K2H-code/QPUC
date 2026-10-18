(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const fmt = (n) => n.toLocaleString("fr-FR") + " F";
  const KEY = "qpc_save_v2";
  const N = ERAS.length * LEVELS_PER_ERA; // nombre total de niveaux

  /* ------------------------------------------------------------------
     Défis du jour : 3 défis tirés au sort chaque jour, 1 ou 2 étoiles
     ------------------------------------------------------------------ */
  const CHALLENGES = [
    { id: "c5",  label: "Réponds juste à 5 questions",            stat: "correct",    target: 5,  reward: 1 },
    { id: "c12", label: "Réponds juste à 12 questions",           stat: "correct",    target: 12, reward: 2 },
    { id: "s4",  label: "Enchaîne 4 bonnes réponses d'affilée",   stat: "bestStreak", target: 4,  reward: 1 },
    { id: "s8",  label: "Enchaîne 8 bonnes réponses d'affilée",   stat: "bestStreak", target: 8,  reward: 2 },
    { id: "p6",  label: "Joue 6 questions",                       stat: "played",     target: 6,  reward: 1 },
    { id: "e1",  label: "Termine une ère du parcours",            stat: "erasDone",   target: 1,  reward: 2 },
  ];

  /* ------------------------------------------------------------------
     Sauvegarde (localStorage, protégée par try/catch)
     ------------------------------------------------------------------ */
  const defaults = () => ({ pos: 0, money: 0, stars: 0, passed: 0, used: {}, daily: null, adCount: 0, adProgress: 0 });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(defaults(), JSON.parse(raw));
    } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
    return defaults();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  let S = load();

  /* ------------------------------------------------------------------
     Défis du jour : état + tirage déterministe selon la date
     ------------------------------------------------------------------ */
  const todayStr = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  function ensureDaily() {
    const t = todayStr();
    if (!S.daily || S.daily.date !== t) {
      S.daily = { date: t, stats: { correct: 0, streak: 0, bestStreak: 0, played: 0, erasDone: 0 }, claimed: [], adStars: 0 };
      save();
    }
    if (S.daily.adStars === undefined) S.daily.adStars = 0;
  }
  const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function todaysChallenges() {
    ensureDaily();
    const rnd = mulberry32(hashStr(S.daily.date));
    const pool = CHALLENGES.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, 3);
  }
  const claimable = () => todaysChallenges().filter((c) => S.daily.stats[c.stat] >= c.target && !S.daily.claimed.includes(c.id)).length;

  function trackAnswer(ok, eraDone) {
    ensureDaily();
    const st = S.daily.stats;
    st.played++;
    if (ok) { st.correct++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak); } else { st.streak = 0; }
    if (eraDone) st.erasDone++;
    S.adCount = (S.adCount || 0) + 1;
    save();
    refreshHud();
  }

  /* ------------------------------------------------------------------
     Affichage commun
     ------------------------------------------------------------------ */
  function show(name) { $$(".screen").forEach((s) => s.classList.toggle("active", s.id === "screen-" + name)); }

  function refreshHud() {
    ["home", "map", "g"].forEach((p) => { const el = $("#" + p + "-stars"); if (el) el.textContent = S.stars; });
    $("#home-money").textContent = fmt(S.money);
    $("#map-money").textContent = fmt(S.money);
    $("#end-stars").textContent = S.stars;
    $("#end-money").textContent = fmt(S.money);
    const n = claimable();
    ["home-badge", "map-badge"].forEach((id) => { const b = $("#" + id); b.textContent = n; b.classList.toggle("hidden", n === 0); });
    $("#btn-play").textContent = S.pos >= N ? "Rejouer" : S.pos > 0 ? "Continuer" : "Jouer";
    $("#btn-new").classList.toggle("hidden", S.pos === 0 && S.money === 0);
    $("#home-progress").textContent = S.pos >= N ? "Parcours terminé !" : S.pos > 0 ? "Niveau " + (S.pos + 1) + " sur " + N + " · " + ERAS[Math.floor(S.pos / LEVELS_PER_ERA)].name : "";
  }

  function modal({ title, html = "", buttons = [{ label: "OK" }], dismiss = true }) {
    $("#modal-title").innerHTML = title;
    $("#modal-body").innerHTML = html;
    const box = $("#modal-actions");
    box.innerHTML = "";
    buttons.forEach((b) => {
      const el = document.createElement("button");
      el.className = "btn " + (b.cls || "");
      el.textContent = b.label;
      el.onclick = () => { closeModal(); if (b.onClick) b.onClick(); };
      box.appendChild(el);
    });
    $("#modal").dataset.dismiss = dismiss ? "1" : "0";
    $("#modal").classList.remove("hidden");
  }
  function closeModal() { $("#modal").classList.add("hidden"); }
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" && $("#modal").dataset.dismiss === "1") closeModal(); });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), 2200);
  }

  /* ------------------------------------------------------------------
     Publicités AdMob (uniquement dans l'application Android).
     Réglages dans ads-config.js. Sur la version web, rien ne s'affiche.
     ------------------------------------------------------------------ */
  const ADS = typeof ADS_CONFIG !== "undefined" ? ADS_CONFIG : { enabled: false };
  const getAdMob = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) || null;
  const isNative = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
  const adsAvailable = () => !!ADS.enabled && isNative() && !!getAdMob();
  const withTimeout = (p, ms, fallback) => Promise.race([p, new Promise((r) => setTimeout(() => r(fallback), ms))]);
  const maxAdStars = () => (typeof ADS.maxAdStarsPerDay === "number" ? ADS.maxAdStarsPerDay : 3);
  const adsPerStar = () => Math.max(1, (typeof ADS.adsPerStar === "number" ? ADS.adsPerStar : 2));
  // Compte une pub regardée jusqu'au bout. Renvoie true si elle complète une étoile (2 pubs = 1 ★).
  function creditAd() {
    S.adProgress = (S.adProgress || 0) + 1;
    if (S.adProgress >= adsPerStar()) {
      S.adProgress = 0; ensureDaily(); S.daily.adStars++; S.stars++; save(); refreshHud();
      return true;
    }
    save();
    return false;
  }
  const adStarsLeft = () => { ensureDaily(); return Math.max(0, maxAdStars() - (S.daily.adStars || 0)); };

  let adsReady = false;
  async function initAds() {
    if (adsReady || !adsAvailable()) return adsReady;
    const AdMob = getAdMob();
    try {
      try { // message de consentement (obligatoire en Europe)
        const info = await AdMob.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === "REQUIRED") await AdMob.showConsentForm();
      } catch (e) { /* pas de formulaire : on continue */ }
      await AdMob.initialize({ initializeForTesting: !!ADS.testing });
      adsReady = true;
    } catch (e) { adsReady = false; }
    return adsReady;
  }

  // Pub avec récompense : renvoie true si le joueur a regardé la pub jusqu'au bout.
  async function showRewarded() {
    if (!adsAvailable() || !(await initAds())) return false;
    const AdMob = getAdMob();
    const handles = [];
    try {
      const loaded = await withTimeout(
        AdMob.prepareRewardVideoAd({ adId: ADS.rewardedId, isTesting: !!ADS.testing }).then(() => true, () => false),
        15000, false);
      if (!loaded) return false;
      // Si le joueur ferme la pub sans récompense, on débloque l'écran.
      let closed;
      const dismissed = new Promise((r) => (closed = r));
      try { handles.push(await AdMob.addListener("onRewardedVideoAdDismissed", () => setTimeout(() => closed(false), 800))); } catch (e) { /* ignore */ }
      const shown = AdMob.showRewardVideoAd().then((reward) => !!reward, () => false);
      return await withTimeout(Promise.race([shown, dismissed]), 5 * 60 * 1000, false);
    } catch (e) {
      return false;
    } finally {
      handles.forEach((h) => { try { h && h.remove && h.remove(); } catch (e) { /* ignore */ } });
    }
  }

  // Pub plein écran, affichée à un moment calme (entre deux questions).
  async function showInterstitial() {
    if (!adsAvailable() || !(await initAds())) return;
    const AdMob = getAdMob();
    try {
      const loaded = await withTimeout(
        AdMob.prepareInterstitial({ adId: ADS.interstitialId, isTesting: !!ADS.testing }).then(() => true, () => false),
        8000, false);
      if (loaded) await withTimeout(AdMob.showInterstitial(), 8000, null);
    } catch (e) { /* si la pub échoue, le jeu continue normalement */ }
  }

  // Lance la suite du jeu, après une pub plein écran si c'est le moment.
  async function proceed(next) {
    const every = typeof ADS.interstitialEvery === "number" ? ADS.interstitialEvery : 5;
    if (adsAvailable() && every > 0 && (S.adCount || 0) >= every) {
      S.adCount = 0; save();
      await showInterstitial();
    }
    next();
  }

  // Proposition « regarde une pub pour gagner une étoile » après un échec.
  function offerAd(info, note) {
    modal({
      title: "✖ Raté !", dismiss: false,
      html: info + (note || "") + `<p>Regarde <b>${adsPerStar()} courtes pubs</b> pour gagner <b>1 ★</b> et <b>sauver ta cagnotte</b> de <b>${fmt(S.money)}</b> ?</p><p class="hint">Pub ${(S.adProgress || 0) + 1}/${adsPerStar()} · étoiles par pub restantes aujourd'hui : ${adStarsLeft()}</p>`,
      buttons: [
        { label: `▶ Regarder la pub ${(S.adProgress || 0) + 1}/${adsPerStar()}`, onClick: async () => {
          toast("Chargement de la pub…");
          if (await showRewarded()) {
            if (creditAd()) {
              toast("★ +1 étoile : seconde chance !");
              useStar();
            } else {
              offerAd(info, `<p class="hint">✔ Pub 1 regardée, encore une pour l'étoile !</p>`);
            }
          } else {
            offerAd(info, `<p class="hint">⚠ Pub indisponible pour le moment (vérifie ta connexion).</p>`);
          }
        } },
        { label: "Non, tout perdre", cls: "ghost", onClick: () => loseMoney(info) },
      ],
    });
  }

  // Bloc « regarder une pub » dans la fenêtre des défis du jour.
  function adBlock() {
    if (!adsAvailable() || adStarsLeft() <= 0) return "";
    return `<div class="defi"><div class="defi-top"><b>Regarder une pub</b><span class="rew">${adsPerStar()} pubs = +1 ★</span></div>
      <div class="defi-bot"><small>Pub ${(S.adProgress || 0) + 1}/${adsPerStar()} · encore ${adStarsLeft()} ★ possible aujourd'hui</small><button class="btn mini" id="defi-ad">▶ Regarder</button></div></div>`;
  }

  /* ------------------------------------------------------------------
     Parcours (carte façon "chemin de terre rouge")
     ------------------------------------------------------------------ */
  const MAP = { W: 400, SP: 92, BH: 64, TOP: 150, BOT: 110 };
  let nodes = [], eraBox = [], mapInfo = null;

  function layout() {
    const eraH = MAP.BH + 50 + (LEVELS_PER_ERA - 1) * MAP.SP + 50;
    const H = MAP.TOP + ERAS.length * eraH + MAP.BOT;
    nodes = []; eraBox = [];
    let cursor = H - MAP.BOT;
    ERAS.forEach((e, ei) => {
      const bottom = cursor;
      const first = bottom - MAP.BH - 50;
      for (let j = 0; j < LEVELS_PER_ERA; j++) {
        const g = ei * LEVELS_PER_ERA + j;
        nodes.push({ g, ei, j, x: 200 + 100 * Math.sin(g * 0.95 + 0.35), y: first - j * MAP.SP });
      }
      const top = first - (LEVELS_PER_ERA - 1) * MAP.SP - 50;
      eraBox.push({ top, bottom, bannerY: bottom - MAP.BH });
      cursor = top;
    });
    mapInfo = { H, start: { x: 200, y: H - MAP.BOT - MAP.BH / 2 }, end: { x: 200, y: MAP.TOP - 50 } };
  }

  function smooth(pts) {
    if (pts.length < 2) return "";
    let d = "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function renderMap() {
    layout();
    const { H, start, end } = mapInfo;
    const curEra = Math.min(Math.floor(S.pos / LEVELS_PER_ERA), ERAS.length - 1);
    const svg = $("#map-svg");
    svg.setAttribute("viewBox", `0 0 ${MAP.W} ${H}`);

    const full = smooth([start, ...nodes, end]);
    const progPts = [start, ...nodes.slice(0, Math.min(S.pos + 1, N))];
    if (S.pos >= N) progPts.push(end);
    const prog = smooth(progPts);

    let out = `<defs>
      <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".55" stop-color="#fcd116"/><stop offset="1" stop-color="#b8860b"/></linearGradient>
      <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4d5e"/><stop offset=".6" stop-color="#ce1126"/><stop offset="1" stop-color="#7a0914"/></linearGradient>
      <linearGradient id="gFin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5b00"/><stop offset="1" stop-color="#050d09"/></linearGradient>
    </defs>`;

    // Fonds des ères
    out += `<rect x="0" y="0" width="${MAP.W}" height="${MAP.TOP}" fill="url(#gFin)"/>`;
    out += `<rect x="0" y="${eraBox[0].bottom}" width="${MAP.W}" height="${H - eraBox[0].bottom}" fill="${ERAS[0].tint}"/>`;
    ERAS.forEach((e, i) => {
      const b = eraBox[i];
      out += `<rect x="0" y="${b.top}" width="${MAP.W}" height="${b.bottom - b.top + 1}" fill="${e.tint}"/>`;
      out += `<line x1="0" x2="${MAP.W}" y1="${b.top}" y2="${b.top}" stroke="${e.accent}" stroke-opacity=".35" stroke-width="2"/>`;
      if (e.big) out += `<text x="${MAP.W / 2}" y="${((b.top + b.bottom) / 2 + 60).toFixed(0)}" font-size="230" text-anchor="middle" opacity=".05">${e.big}</text>`;
      const n = e.deco.length, avail = b.bottom - b.top - 150;
      e.deco.forEach((d, k) => {
        const y = b.top + 85 + k * (avail / Math.max(1, n - 1));
        const x = k % 2 ? 362 - (k % 3) * 6 : 38 + (k % 3) * 6;
        const size = 26 + ((k * 7) % 4) * 5;
        const rot = ((k * 37) % 40) - 20;
        out += `<text x="${x}" y="${y.toFixed(0)}" font-size="${size}" text-anchor="middle" opacity="${(0.17 + (k % 3) * 0.04).toFixed(2)}" transform="rotate(${rot} ${x} ${y.toFixed(0)})">${d}</text>`;
      });
    });

    // Route
    out += `<path d="${full}" fill="none" stroke="#1c0a06" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>`;
    out += `<path d="${full}" fill="none" stroke="#7b2d14" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>`;
    out += `<path d="${full}" fill="none" stroke="#fcd116" stroke-opacity=".5" stroke-width="2.5" stroke-dasharray="10 14" stroke-linecap="round"/>`;
    out += `<path d="${prog}" fill="none" stroke="#fcd116" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px rgba(252,209,22,.9))"/>`;

    // Bannières d'ères
    ERAS.forEach((e, i) => {
      const b = eraBox[i];
      out += `<g opacity="${i > curEra ? 0.6 : 1}" transform="translate(0,${b.bannerY})">
        <rect x="16" y="2" width="368" height="${MAP.BH - 4}" rx="16" fill="${e.dark}" stroke="${e.accent}" stroke-width="2.5"/>
        <text x="48" y="${MAP.BH / 2 + 11}" font-size="30" text-anchor="middle">${e.emoji}</text>
        <text x="76" y="26" class="b-kicker" fill="${e.accent}">ÈRE ${i + 1} · ${e.subtitle.toUpperCase()}</text>
        <text x="76" y="51" class="b-name">${e.name.toUpperCase()}</text>
        <text x="366" y="51" class="b-gain">+${fmt(e.gain)}</text>
      </g>`;
    });

    // Arrivée
    out += `<g transform="translate(200,${MAP.TOP - 62})"><text font-size="58" text-anchor="middle" y="20">🏆</text><text y="50" class="finish-label">ARRIVÉE</text></g>`;

    // Niveaux
    nodes.forEach((n) => {
      const state = n.g < S.pos ? "done" : n.g === S.pos ? "current" : "locked";
      const milestone = n.j === LEVELS_PER_ERA - 1;
      const r = milestone ? 32 : 26;
      const label = milestone ? `<text class="emo" y="9">${ERAS[n.ei].emoji}</text>` : `<text class="num" y="7">${n.g + 1}</text>`;
      out += `<g class="node ${state}" data-g="${n.g}" transform="translate(${n.x.toFixed(1)},${n.y})">
        ${state === "current" ? `<circle class="ring" r="${r + 2}"/>` : ""}
        <circle class="disc" r="${r}"/>
        ${label}
        ${state === "current" ? `<g class="tag"><rect x="-34" y="-13" width="68" height="24" rx="12" fill="#fcd116"/><text y="4" font-size="13" font-weight="900" text-anchor="middle" fill="#2a1c00">JOUER</text></g>` : ""}
      </g>`;
    });

    svg.innerHTML = out;
  }
  const BH_PAD = () => MAP.BH + 100;

  function centerOnCurrent(smoothly) {
    const sc = $("#map-scroll"), svg = $("#map-svg");
    const k = svg.getBoundingClientRect().width / MAP.W;
    const y = (S.pos >= N ? mapInfo.end.y : nodes[S.pos].y) * k;
    sc.scrollTo({ top: Math.max(0, y - sc.clientHeight / 2), behavior: smoothly ? "smooth" : "auto" });
  }

  function openMap(smoothly) {
    refreshHud();
    show("map");
    renderMap();
    $("#map-play").textContent = S.pos >= N ? "🏆 Terminé !" : "▶ Jouer le niveau " + (S.pos + 1);
    requestAnimationFrame(() => centerOnCurrent(!!smoothly));
  }

  $("#map-svg").addEventListener("click", (e) => {
    const g = e.target.closest(".node");
    if (!g) return;
    const i = +g.dataset.g;
    if (i === S.pos) startLevel();
    else if (i > S.pos) toast("🔒 Réussis d'abord les niveaux précédents");
    else toast("✔ Niveau déjà réussi");
  });

  /* ------------------------------------------------------------------
     Partie : questions, réponses, cagnotte, étoiles
     ------------------------------------------------------------------ */
  let cur = null;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function drawQuestion(era) {
    if (!S.used[era.id]) S.used[era.id] = [];
    let free = era.questions.map((_, i) => i).filter((i) => !S.used[era.id].includes(i));
    if (!free.length) { S.used[era.id] = []; free = era.questions.map((_, i) => i); }
    const idx = free[Math.floor(Math.random() * free.length)];
    S.used[era.id].push(idx);
    const raw = era.questions[idx];
    return { q: raw.q, answers: shuffle([{ t: raw.ok, ok: true }, ...raw.ko.map((t) => ({ t, ok: false }))]) };
  }

  let moneyAnim = null;
  function setBubble(n) {
    const el = $("#bubble-amount"), t = fmt(n);
    el.textContent = t;
    el.style.fontSize = t.length <= 5 ? "28px" : t.length <= 7 ? "23px" : t.length <= 9 ? "19px" : "15px";
  }
  function animateMoney(from, to) {
    cancelAnimationFrame(moneyAnim);
    const t0 = performance.now(), dur = 900;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setBubble(Math.round(from + (to - from) * e));
      if (k < 1) moneyAnim = requestAnimationFrame(step);
    };
    moneyAnim = requestAnimationFrame(step);
    const b = $("#bubble");
    b.classList.remove("up", "down"); void b.offsetWidth;
    b.classList.add(to >= from ? "up" : "down");
    setTimeout(() => b.classList.remove("up", "down"), 1400);
  }
  function popGain(txt) {
    const p = document.createElement("div");
    p.className = "gain-pop"; p.textContent = txt;
    $(".stage").appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }

  function startLevel() {
    closeModal();
    if (S.pos >= N) return showVictory();
    const ei = Math.floor(S.pos / LEVELS_PER_ERA), j = S.pos % LEVELS_PER_ERA, era = ERAS[ei];
    cur = { ei, j, era, q: drawQuestion(era), locked: false };
    save();

    show("game");
    $("#screen-game").style.setProperty("--era", era.tint);
    $("#g-kicker").textContent = "ÈRE " + (ei + 1) + " · NIVEAU " + (j + 1) + "/" + LEVELS_PER_ERA;
    $("#g-era").textContent = era.name;
    $("#g-art").textContent = era.emoji;
    $("#g-level").textContent = "Niveau " + (S.pos + 1) + " sur " + N + " · +" + fmt(era.gain) + " à gagner";
    $("#g-dots").innerHTML = Array.from({ length: LEVELS_PER_ERA }, (_, i) => `<span class="${i < j ? "done" : i === j ? "now" : ""}"></span>`).join("");
    $("#q-text").textContent = cur.q.q;
    $$(".answer").forEach((b, i) => {
      b.className = "answer"; b.disabled = false;
      b.querySelector("span").textContent = cur.q.answers[i].t;
    });
    cancelAnimationFrame(moneyAnim);
    setBubble(S.money);
    refreshHud();
  }

  function onAnswer(i) {
    if (!cur || cur.locked) return;
    cur.locked = true;
    const btns = $$(".answer");
    btns.forEach((b) => (b.disabled = true));
    btns[i].classList.add("selected");
    setTimeout(() => {
      const ok = cur.q.answers[i].ok;
      const goodIdx = cur.q.answers.findIndex((a) => a.ok);
      btns.forEach((b, k) => { b.classList.remove("selected"); if (k !== goodIdx && k !== i) b.classList.add("dim"); });
      btns[goodIdx].classList.add("correct");
      if (!ok) btns[i].classList.add("wrong");
      setTimeout(() => (ok ? onCorrect() : onWrong(cur.q.answers[goodIdx].t)), 1100);
    }, 1000);
  }

  function onCorrect() {
    const era = cur.era, before = S.money;
    S.money += era.gain; S.pos++; S.passed++;
    const eraDone = S.pos % LEVELS_PER_ERA === 0;
    const gotStar = S.passed % STAR_EVERY === 0;
    if (gotStar) S.stars++;
    trackAnswer(true, eraDone);
    animateMoney(before, S.money);
    popGain("+" + fmt(era.gain));

    setTimeout(() => {
      const finished = S.pos >= N;
      let html = `<p class="big">+${fmt(era.gain)}</p><p>Cagnotte : <b>${fmt(S.money)}</b></p>`;
      if (gotStar) html += `<p>★ <b>${S.passed} niveaux réussis</b> : tu gagnes <b>1 étoile</b> !</p>`;
      if (eraDone && !finished) html += `<p>🎉 Tu quittes <b>${era.name}</b> et entres dans <b>${ERAS[Math.floor(S.pos / LEVELS_PER_ERA)].name}</b>.</p>`;
      const buttons = finished
        ? [{ label: "🏆 Voir ma victoire", onClick: showVictory }]
        : [{ label: "Niveau suivant ▶", onClick: () => proceed(startLevel) }, { label: "Parcours", cls: "ghost", onClick: () => openMap(true) }];
      modal({ title: eraDone ? "🎉 Ère terminée !" : "✔ Bonne réponse !", html, buttons, dismiss: false });
    }, 1500);
  }

  function onWrong(goodText) {
    trackAnswer(false, false);
    const info = `<p>La bonne réponse était : <b>${goodText}</b>.</p>`;
    if (S.money === 0) {
      modal({ title: "✖ Raté !", html: info + "<p>Ta cagnotte est déjà à 0 F : rien à perdre, retente ta chance !</p>", dismiss: false,
        buttons: [{ label: "Rejouer le niveau", onClick: () => proceed(startLevel) }, { label: "Parcours", cls: "ghost", onClick: () => openMap(false) }] });
    } else if (S.stars > 0) {
      modal({ title: "✖ Raté !", dismiss: false,
        html: info + `<p>Tu as <b>${S.stars} ★</b>. Utilises-en une pour une <b>seconde chance</b> et sauver ta cagnotte de <b>${fmt(S.money)}</b> ?</p>`,
        buttons: [{ label: "Utiliser une ★", onClick: useStar }, { label: "Non, tout perdre", cls: "ghost", onClick: () => loseMoney(info) }] });
    } else if (adsAvailable() && adStarsLeft() > 0) {
      offerAd(info);
    } else {
      loseMoney(info + `<p class="hint">Pas d'étoile ★ pour te sauver. Gagne-en une tous les ${STAR_EVERY} niveaux réussis ou avec les défis du jour.</p>`);
    }
  }

  function useStar() { S.stars--; save(); refreshHud(); startLevel(); }

  function loseMoney(html) {
    const before = S.money;
    S.money = 0; save(); refreshHud();
    animateMoney(before, 0);
    setTimeout(() => modal({
      title: "💥 Cagnotte perdue",
      html: html + `<p>Ta cagnotte retombe à <b>0 F</b>. Tu gardes ta place sur le parcours.</p>`, dismiss: false,
      buttons: [{ label: "Rejouer le niveau", onClick: () => proceed(startLevel) }, { label: "Parcours", cls: "ghost", onClick: () => openMap(false) }],
    }), 1300);
  }

  /* ------------------------------------------------------------------
     Défis, règles, nouvelle partie, victoire
     ------------------------------------------------------------------ */
  function openDefis() {
    const list = todaysChallenges();
    const items = list.map((c) => {
      const v = Math.min(S.daily.stats[c.stat], c.target), done = v >= c.target, claimed = S.daily.claimed.includes(c.id);
      return `<div class="defi ${done ? "done" : ""}">
        <div class="defi-top"><b>${c.label}</b><span class="rew">+${c.reward} ★</span></div>
        <div class="meter"><i style="width:${(v / c.target) * 100}%"></i></div>
        <div class="defi-bot"><small>${v} / ${c.target}</small>
          ${done && !claimed ? `<button class="btn mini" data-claim="${c.id}">Récupérer</button>` : claimed ? "<small>✔ Récupérée</small>" : ""}
        </div></div>`;
    }).join("");
    modal({
      title: "Défis du jour",
      html: items + adBlock() + `<p class="hint">★ aussi tous les ${STAR_EVERY} niveaux réussis : <b>${S.passed % STAR_EVERY}/${STAR_EVERY}</b></p><p class="hint">De nouveaux défis arrivent chaque jour.</p>`,
      buttons: [{ label: "Fermer", cls: "ghost" }],
    });
    $$("#modal-body [data-claim]").forEach((b) => (b.onclick = () => {
      const c = CHALLENGES.find((x) => x.id === b.dataset.claim);
      if (!c || S.daily.claimed.includes(c.id)) return;
      S.daily.claimed.push(c.id); S.stars += c.reward; save(); refreshHud();
      openDefis();
    }));
    const adBtn = $("#defi-ad");
    if (adBtn) adBtn.onclick = async () => {
      adBtn.disabled = true;
      toast("Chargement de la pub…");
      if (await showRewarded()) {
        toast(creditAd() ? "★ +1 étoile !" : "✔ Pub 1/" + adsPerStar() + " : encore une pour l'étoile");
      } else {
        toast("Pub indisponible pour le moment");
      }
      openDefis();
    };
  }

  function openRules() {
    modal({
      title: "Règles du jeu",
      html: `<ul class="rules">
        <li>Traverse <b>${ERAS.length} ères de l'évolution du monde</b>, de la Préhistoire à l'ère numérique : ${LEVELS_PER_ERA} niveaux par ère, une question par niveau.</li>
        <li>Chaque bonne réponse fait <b>grossir ta cagnotte</b>, et le gain augmente à chaque ère.</li>
        <li>Une mauvaise réponse ramène ta cagnotte à <b>0 F</b>… sauf si tu utilises une <b>★ étoile</b> : seconde chance, cagnotte sauvée.</li>
        <li>Gagne des étoiles tous les <b>${STAR_EVERY} niveaux réussis</b> ou en relevant les <b>défis du jour</b>.</li>
        ${adsAvailable() ? "<li>Tu peux aussi gagner une ★ en regardant <b>${adsPerStar()} pubs</b> (quelques fois par jour).</li>" : ""}
      </ul>`,
    });
  }

  function resetRun() {
    S.pos = 0; S.money = 0; S.passed = 0; S.used = {};
    save(); refreshHud();
  }

  function showVictory() {
    closeModal(); refreshHud(); show("end");
  }

  /* ------------------------------------------------------------------
     Branchements
     ------------------------------------------------------------------ */
  $("#btn-play").onclick = () => { if (S.pos >= N) showVictory(); else openMap(false); };
  $("#btn-defis").onclick = openDefis;
  $("#map-defis").onclick = openDefis;
  $("#btn-rules").onclick = openRules;
  $("#btn-new").onclick = () => modal({
    title: "Nouvelle partie ?", html: "<p>Ta progression et ta cagnotte seront remises à zéro. Tes étoiles ★ sont conservées.</p>",
    buttons: [{ label: "Recommencer", onClick: () => { resetRun(); openMap(false); } }, { label: "Annuler", cls: "ghost" }],
  });
  $("#map-home").onclick = () => { refreshHud(); show("home"); };
  $("#map-play").onclick = () => { if (S.pos >= N) showVictory(); else startLevel(); };
  $("#game-back").onclick = () => {
    if (cur && cur.locked) return;
    openMap(false);
  };
  $("#end-replay").onclick = () => { resetRun(); openMap(false); };
  $("#end-home").onclick = () => { refreshHud(); show("home"); };
  $$(".answer").forEach((b, i) => (b.onclick = () => onAnswer(i)));

  document.addEventListener("keydown", (e) => {
    if (!$("#screen-game").classList.contains("active") || !$("#modal").classList.contains("hidden")) return;
    const k = "abcd".indexOf(e.key.toLowerCase());
    const d = "1234".indexOf(e.key);
    if (k >= 0) onAnswer(k); else if (d >= 0) onAnswer(d);
  });

  ensureDaily();
  refreshHud();
  setTimeout(initAds, 1500); // prépare les pubs (et le message de consentement) au lancement
})();
