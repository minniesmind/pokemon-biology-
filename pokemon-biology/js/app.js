/* ============================================================
   POKÉ-PROFESSOR — app logic (v2, multi-topic)
   Vanilla JS, no build tools, runs from file:// or GitHub Pages
   ============================================================ */
(function () {
  "use strict";

  const SAVE_KEY = "pokeProfessor_v2";

  /* ---------- state ---------- */
  const defaultState = {
    trainer: "", starter: null, xp: 0,
    settings: { sound: true },
    topics: {}   // topicId -> {badges:{}, bestScores:{}, mastery:{}}
  };
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.settings = Object.assign({ sound: true }, s.settings || {});
        s.topics = s.topics || {};
        return Object.assign({}, defaultState, s);
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(defaultState));
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }

  function topicProgress(id) {
    if (!state.topics[id]) state.topics[id] = { badges: {}, bestScores: {}, mastery: {} };
    const t = state.topics[id];
    t.badges = t.badges || {}; t.bestScores = t.bestScores || {}; t.mastery = t.mastery || {};
    return t;
  }
  function level() { return Math.floor(state.xp / 100) + 1; }
  function xpIntoLevel() { return state.xp % 100; }

  /* ---------- DOM helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $("#app");
  const hud = $("#hud");
  function el(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function setsEqual(a, b) { if (a.length !== b.length) return false; const s = new Set(a); return b.every(x => s.has(x)); }

  /* ---------- audio (Web Audio, generated — no files, original) ---------- */
  const Sound = {
    ctx: null,
    ensure() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); },
    on() { return state.settings.sound; },
    beep(freq, t0, dur, type, vol) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      const start = this.ctx.currentTime + t0;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(vol || 0.15, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(start); o.stop(start + dur + 0.02);
    },
    play(name) {
      if (!this.on()) return; this.ensure(); if (!this.ctx) return;
      if (name === "click") this.beep(600, 0, 0.06, "square", 0.08);
      else if (name === "correct") { this.beep(660, 0, 0.1, "square", 0.14); this.beep(990, 0.09, 0.14, "square", 0.14); }
      else if (name === "wrong") { this.beep(300, 0, 0.14, "sawtooth", 0.12); this.beep(160, 0.12, 0.22, "sawtooth", 0.12); }
      else if (name === "badge") { [523, 659, 784, 1047].forEach((f, i) => this.beep(f, i * 0.12, 0.18, "square", 0.14)); }
      else if (name === "level") { [392, 523, 659, 784, 1047].forEach((f, i) => this.beep(f, i * 0.1, 0.2, "triangle", 0.14)); }
      else if (name === "win") { [523, 659, 784, 1047, 1319].forEach((f, i) => this.beep(f, i * 0.11, 0.2, "square", 0.14)); }
    }
  };

  /* ---------- toast + confetti + overlay ---------- */
  function toast(msg, ms) { const t = $("#toast"); t.innerHTML = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), ms || 2600); }
  function confetti() {
    const box = el("div", "confetti"); const colors = ["#ffcb05", "#e3350d", "#3b5ba5", "#4caf50", "#ff7a5c", "#8e2de2"];
    for (let i = 0; i < 80; i++) { const c = el("i"); c.style.left = Math.random() * 100 + "vw"; c.style.background = colors[i % colors.length]; c.style.animationDuration = (1.6 + Math.random() * 1.6) + "s"; c.style.animationDelay = (Math.random() * 0.4) + "s"; box.appendChild(c); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3600);
  }
  function badgeOverlay(badge, name, onClose) {
    const ov = el("div", "overlay");
    ov.innerHTML = `<div class="card"><div class="bigbadge">${badge.split(" ")[0]}</div>
      <h3>Badge Get!</h3><p class="lead">You earned the <b>${esc(badge)}</b>!</p>
      <button class="btn grass" id="ovBtn">Awesome! ▶</button></div>`;
    document.body.appendChild(ov);
    confetti(); Sound.play("badge");
    $("#ovBtn", ov).addEventListener("click", () => { ov.remove(); if (onClose) onClose(); });
  }
  function addXP(amount, reason) {
    const before = level(); state.xp += amount; save(); renderHUD();
    if (level() > before) { toast("⭐ LEVEL UP! You're now Lv." + level(), 3000); confetti(); Sound.play("level"); }
    else if (reason) toast("+" + amount + " XP — " + reason);
  }

  /* ---------- top bar controls (home + sound) ---------- */
  function renderTopControls() {
    const box = $("#topctrls"); if (!box) return;
    const started = !!(state.trainer && state.starter);
    box.innerHTML =
      (started ? `<button class="iconbtn" id="homeBtn" title="Home">🏠 Home</button>` : "") +
      `<button class="iconbtn" id="soundBtn" title="Sound on/off">${state.settings.sound ? "🔊" : "🔇"}</button>`;
    if (started) $("#homeBtn").addEventListener("click", () => { Sound.play("click"); screenTopics(); });
    $("#soundBtn").addEventListener("click", () => {
      state.settings.sound = !state.settings.sound; save(); renderTopControls();
      if (state.settings.sound) { Sound.ensure(); Sound.play("correct"); toast("🔊 Sound on"); } else toast("🔇 Sound off");
    });
  }

  /* ---------- HUD ---------- */
  function renderHUD() {
    renderTopControls();
    if (!state.trainer) { hud.classList.add("hidden"); return; }
    hud.classList.remove("hidden");
    const totalBadges = TOPICS.reduce((n, t) => n + t.gyms.length, 0);
    const earned = TOPICS.reduce((n, t) => n + Object.keys(topicProgress(t.id).badges).length, 0);
    const strip = TOPICS.map(t => topicProgress(t.id)).reduce((html, prog, ti) => {
      return html + TOPICS[ti].gyms.map(g => {
        const e = prog.badges[g.id] ? " earned" : ""; return `<span class="b${e}" title="${esc(g.badge)}">${g.badge.split(" ")[0]}</span>`;
      }).join("");
    }, "");
    hud.innerHTML = `<span class="lvl">Lv.${level()}</span>
      <div class="xpbar"><span style="width:${xpIntoLevel()}%"></span></div>
      <div class="badgestrip" title="${earned}/${totalBadges} badges">${strip}</div>`;
  }

  function starterObj() { return STARTERS.find(s => s.id === state.starter) || STARTERS[0]; }
  function getTopic(id) { return TOPICS.find(t => t.id === id); }

  /* ============================================================
     START SCREEN
     ============================================================ */
  function screenStart() {
    renderHUD();
    const p = el("div", "panel hero");
    p.innerHTML = `
      <div class="pokeball" style="margin:0 auto 10px;width:46px;height:46px"></div>
      <div class="big">POKÉ-PROFESSOR</div>
      <div class="sub">GCSE Biology, the Pokémon way 🌿🫀⚡</div>
      <p class="lead center">Professor Oak: <i>"Welcome! Pick your trainer name and a starter, then explore the
      regions, battle the gyms and collect every badge to become a Biology Champion!"</i></p>
      <p class="center" style="margin-top:16px"><b>What's your trainer name?</b></p>
      <div class="center"><input id="nameInput" class="input" placeholder="e.g. Eesa" maxlength="16" value="${esc(state.trainer || "")}"></div>
      <p class="center" style="margin:18px 0 6px"><b>Choose your starter Pokémon:</b></p>
      <div class="starters" id="starters"></div>
      <div class="center"><button class="btn grass" id="beginBtn">START ADVENTURE ▶</button></div>
      <div class="footnote">Content: AQA GCSE Biology. Progress saves automatically on this device.</div>`;
    app.innerHTML = ""; app.appendChild(p);
    const sc = $("#starters"); let chosen = state.starter;
    STARTERS.forEach(s => {
      const c = el("div", "starter" + (chosen === s.id ? " sel" : ""));
      c.innerHTML = `<div class="face">${s.emoji}</div><div class="nm">${esc(s.name)}</div><div class="bl">${esc(s.blurb)}</div>`;
      c.addEventListener("click", () => { Sound.play("click"); chosen = s.id;[...sc.children].forEach(x => x.classList.remove("sel")); c.classList.add("sel"); });
      sc.appendChild(c);
    });
    $("#beginBtn").addEventListener("click", () => {
      const nm = $("#nameInput").value.trim() || "Trainer";
      if (!chosen) { toast("Pick a starter first!"); return; }
      Sound.ensure(); Sound.play("correct");
      state.trainer = nm; state.starter = chosen; save(); screenTopics();
    });
  }

  /* ============================================================
     TOPIC (REGION) SELECT  — the "home" screen
     ============================================================ */
  function screenTopics() {
    renderHUD();
    app.innerHTML = "";
    const intro = el("div", "panel");
    const st = starterObj();
    intro.innerHTML = `<h2 class="section">🗺️ Choose a Region</h2>
      <p class="lead">Welcome back, <b>${esc(state.trainer)}</b>! ${st.emoji} ${esc(st.name)} is ready.
      Pick a region to explore — each one is a whole GCSE topic.</p>`;
    app.appendChild(intro);

    const grid = el("div", "topicgrid");
    TOPICS.forEach((t, i) => {
      const prog = topicProgress(t.id);
      const earned = Object.keys(prog.badges).length;
      const mastered = Object.keys(prog.mastery).length;
      const c = el("div", "topiccard t" + i);
      c.innerHTML = `<div class="tface">${t.emoji}</div>
        <div class="tname">${esc(t.name)}</div>
        <div class="tsub">${esc(t.subject)}</div>
        <div class="tblurb">${esc(t.blurb)}</div>
        <div class="tprog">🏅 ${earned}/${t.gyms.length} badges · 🃏 ${mastered}/${t.flashcards.length} cards</div>`;
      c.addEventListener("click", () => { Sound.play("click"); screenMap(t.id); });
      grid.appendChild(c);
    });
    app.appendChild(grid);
    window.scrollTo(0, 0);
  }

  /* ============================================================
     GYM MAP (per topic)
     ============================================================ */
  function screenMap(topicId) {
    const topic = getTopic(topicId); const prog = topicProgress(topicId);
    renderHUD(); app.innerHTML = "";
    const earned = Object.keys(prog.badges).length;
    const bar = el("div", "panel");
    bar.innerHTML = `<h2 class="section">${topic.emoji} ${esc(topic.name)}</h2>
      <p class="lead">${esc(topic.subject)}. You've earned <b>${earned}/${topic.gyms.length}</b> badges here.
      Train in a gym, then battle its quiz to win the badge.</p>
      <div class="btnrow">
        <button class="btn blue" id="flashBtn">🃏 Flashcard Trainer</button>
        ${earned === topic.gyms.length ? '<button class="btn grass" id="champBtn">🏅 Champion Summary</button>' : ''}
        <button class="btn ghost" id="regionsBtn">🗺️ All Regions</button>
      </div>`;
    app.appendChild(bar);

    const grid = el("div", "gymgrid");
    topic.gyms.forEach((g, i) => {
      const done = prog.badges[g.id]; const best = prog.bestScores[g.id];
      const card = el("div", "gymcard g" + (i % 5));
      card.innerHTML = `${done ? '<div class="done">✅</div>' : ''}
        <div class="glabel">${esc(g.name)}</div>
        <div class="gleader">${esc(g.leader)} · ${esc(g.type)}-type</div>
        <div class="gtag">"${esc(g.tagline)}"</div>
        <div class="gmeta"><span class="chip">${esc(g.badge)}</span>
          <span>${best ? ('Best ' + best.score + '/' + best.total) : (done ? '' : 'Not cleared')}</span></div>
        <div style="margin-top:8px"><span class="tierflag">${esc(g.tier)}</span></div>`;
      card.addEventListener("click", () => { Sound.play("click"); screenGym(topicId, g.id); });
      grid.appendChild(card);
    });
    app.appendChild(grid);
    $("#flashBtn").addEventListener("click", () => screenFlashcards(topicId));
    $("#regionsBtn").addEventListener("click", screenTopics);
    const champ = $("#champBtn"); if (champ) champ.addEventListener("click", () => screenChampion(topicId));
    window.scrollTo(0, 0);
  }

  /* ============================================================
     GYM INTRO
     ============================================================ */
  function screenGym(topicId, gymId) {
    const topic = getTopic(topicId); const g = topic.gyms.find(x => x.id === gymId); const prog = topicProgress(topicId);
    renderHUD(); app.innerHTML = "";
    const done = prog.badges[g.id];
    const p = el("div", "panel");
    p.innerHTML = `<h2 class="section">${esc(g.name)}</h2>
      <p class="small">${esc(g.leader)} · ${esc(g.type)}-type · <b>${esc(g.tier)}</b> · Prize: ${esc(g.badge)} ${done ? '(earned ✅)' : ''}</p>
      <div class="poke-note">👟 <b>${esc(g.leader)}:</b> ${esc(g.intro)}</div>
      <p class="lead">This gym has <b>${g.lessons.length}</b> training cards and a <b>${g.quiz.length}-question</b> battle with a mix of challenge types.</p>
      <div class="btnrow">
        <button class="btn grass" id="learnBtn">📚 Train (learn)</button>
        <button class="btn red" id="fightBtn">⚔️ Battle the quiz</button>
        <button class="btn ghost" id="backBtn">← Map</button>
      </div>`;
    app.appendChild(p);
    $("#learnBtn").addEventListener("click", () => { Sound.play("click"); screenLesson(topicId, gymId, 0); });
    $("#fightBtn").addEventListener("click", () => { Sound.play("click"); screenQuiz(topicId, gymId); });
    $("#backBtn").addEventListener("click", () => screenMap(topicId));
    window.scrollTo(0, 0);
  }

  /* ============================================================
     LESSON CARDS
     ============================================================ */
  function screenLesson(topicId, gymId, idx) {
    const topic = getTopic(topicId); const g = topic.gyms.find(x => x.id === gymId); const lesson = g.lessons[idx];
    renderHUD(); app.innerHTML = "";
    const dots = g.lessons.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join("");
    const terms = (lesson.terms || []).map(t => `<div class="term"><b>${esc(t[0])}:</b> ${esc(t[1])}</div>`).join("");
    const facts = lesson.facts.map(f => `<li>${f}</li>`).join("");
    const p = el("div", "panel");
    p.innerHTML = `<h2 class="section">📚 ${esc(g.name)}</h2>
      <div class="dexcard"><div class="head">#${idx + 1} · ${esc(lesson.title)}</div>
        <div class="body">
          <div class="poke-note">🎮 <b>Pokémon link:</b> ${esc(lesson.poke)}</div>
          <ul class="facts">${facts}</ul>
          ${terms ? `<div class="terms">${terms}</div>` : ''}
        </div></div>
      <div class="progressdots">${dots}</div>
      <div class="btnrow">
        ${idx > 0 ? '<button class="btn ghost" id="prevBtn">← Back</button>' : '<button class="btn ghost" id="gymBtn">← Gym</button>'}
        ${idx < g.lessons.length - 1 ? '<button class="btn blue" id="nextBtn">Next card →</button>' : '<button class="btn red" id="toFightBtn">⚔️ Ready — Battle!</button>'}
      </div>`;
    app.appendChild(p);
    if ($("#prevBtn")) $("#prevBtn").addEventListener("click", () => { Sound.play("click"); screenLesson(topicId, gymId, idx - 1); });
    if ($("#gymBtn")) $("#gymBtn").addEventListener("click", () => screenGym(topicId, gymId));
    if ($("#nextBtn")) $("#nextBtn").addEventListener("click", () => { Sound.play("click"); screenLesson(topicId, gymId, idx + 1); });
    if ($("#toFightBtn")) $("#toFightBtn").addEventListener("click", () => { Sound.play("click"); screenQuiz(topicId, gymId); });
    window.scrollTo(0, 0);
  }

  /* ============================================================
     QUIZ ENGINE (multi-type)
     Each render returns { isComplete(), check() -> bool, auto }
     ============================================================ */
  const QTYPE = {
    label: { mc: "Pick the answer", multi: "Select ALL correct", match: "Drag to match", order: "Drag into order", categorise: "Drag into groups", label: "Label the diagram" }
  };

  function renderQuestion(q, host) {
    const type = q.type || "mc";
    if (type === "mc") return renderMC(q, host);
    if (type === "multi") return renderMulti(q, host);
    if (type === "match") return renderMatch(q, host);
    if (type === "order") return renderOrder(q, host);
    if (type === "categorise") return renderCategorise(q, host);
    if (type === "label") return renderLabel(q, host);
    return renderMC(q, host);
  }

  /* ---- MC (auto-check on click) ---- */
  function renderMC(q, host) {
    const opts = el("div", "opts");
    q.options.forEach((opt, i) => { const b = el("button", "opt", esc(opt)); b.dataset.i = i; opts.appendChild(b); });
    host.appendChild(opts);
    let chosen = null;
    return {
      auto: true,
      bind(onPick) {
        [...opts.children].forEach(b => b.addEventListener("click", () => { chosen = +b.dataset.i; onPick(); }));
      },
      isComplete() { return chosen !== null; },
      check() {
        const correct = chosen === q.answer;
        [...opts.children].forEach(b => { b.disabled = true; const i = +b.dataset.i; if (i === q.answer) b.classList.add("correct"); if (i === chosen && i !== q.answer) b.classList.add("wrong"); });
        return correct;
      }
    };
  }

  /* ---- MULTI (toggle, then Check) ---- */
  function renderMulti(q, host) {
    const opts = el("div", "opts");
    q.options.forEach((opt, i) => { const b = el("button", "opt", esc(opt)); b.dataset.i = i; opts.appendChild(b); });
    host.appendChild(opts);
    const sel = new Set();
    [...opts.children].forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.i; if (sel.has(i)) { sel.delete(i); b.classList.remove("placed"); b.style.borderColor = ""; } else { sel.add(i); b.classList.add("placed"); } Sound.play("click");
    }));
    return {
      auto: false,
      isComplete() { return sel.size > 0; },
      check() {
        const correct = setsEqual([...sel], q.answers);
        [...opts.children].forEach(b => { b.disabled = true; const i = +b.dataset.i; const shouldBe = q.answers.includes(i); if (shouldBe) b.classList.add("correct"); else if (sel.has(i)) b.classList.add("wrong"); });
        return correct;
      }
    };
  }

  /* ---- generic chip drag helpers (chip -> target) ---- */
  let DRAG = { chip: null, from: null };
  function makeChip(text) {
    const c = el("div", "dchip", esc(text)); c.draggable = true; c.dataset.text = text;
    c.addEventListener("dragstart", e => { DRAG.chip = c; DRAG.from = c.parentNode; c.classList.add("dragging"); try { e.dataTransfer.setData("text/plain", text); } catch (x) {} });
    c.addEventListener("dragend", () => c.classList.remove("dragging"));
    return c;
  }
  function makeDropTarget(node, accept) {
    node.addEventListener("dragover", e => { e.preventDefault(); node.classList.add("over"); });
    node.addEventListener("dragleave", () => node.classList.remove("over"));
    node.addEventListener("drop", e => {
      e.preventDefault(); node.classList.remove("over");
      if (!DRAG.chip) return;
      if (accept && !accept(node)) return;
      node.appendChild(DRAG.chip); Sound.play("click");
    });
  }

  /* ---- MATCH (left fixed w/ slots, right chips dragged in) ---- */
  function renderMatch(q, host) {
    const leftCol = el("div", "matchcol");
    const bank = el("div", "chip-bank");
    const rights = shuffle(q.pairs.map(p => p[1]));
    rights.forEach(r => bank.appendChild(makeChip(r)));
    const leftRows = [];
    q.pairs.forEach((p) => {
      const row = el("div", "matchleft"); row.innerHTML = `<span>${esc(p[0])}</span>`;
      const slot = el("div", "slot"); row.appendChild(slot); row.dataset.answer = p[1];
      makeDropTarget(slot, () => true); leftRows.push({ slot, answer: p[1] });
      leftCol.appendChild(row);
    });
    host.appendChild(el("div", "small center", "Drag each answer chip into the matching box. Drop it back on the tray to move it."));
    host.appendChild(bank);
    host.appendChild(leftCol);
    makeDropTarget(bank, () => true); // allow returning chips
    return {
      auto: false,
      isComplete() { return leftRows.every(r => r.slot.querySelector(".dchip")); },
      check() {
        let allCorrect = true;
        leftRows.forEach(r => {
          const chip = r.slot.querySelector(".dchip");
          const ok = chip && chip.dataset.text === r.answer;
          r.slot.parentNode.classList.add(ok ? "mark-ok" : "mark-bad");
          if (!ok) { allCorrect = false; if (!chip) r.slot.innerHTML = `<span style="color:#9b1c0b">${esc(r.answer)}</span>`; else chip.innerHTML = esc(chip.dataset.text) + " → " + esc(r.answer); }
        });
        host.querySelectorAll(".dchip").forEach(c => c.draggable = false);
        return allCorrect;
      }
    };
  }

  /* ---- ORDER (reorderable list) ---- */
  function renderOrder(q, host) {
    host.appendChild(el("div", "small center", "Drag the steps into the correct order (top = first)."));
    const list = el("div", "orderlist");
    const start = shuffle(q.items);
    start.forEach(txt => {
      const it = el("div", "orderitem"); it.draggable = true; it.dataset.text = txt;
      it.innerHTML = `<span class="num"></span><span>${esc(txt)}</span><span class="grip">≡</span>`;
      it.addEventListener("dragstart", () => { it.classList.add("dragging"); });
      it.addEventListener("dragend", () => { it.classList.remove("dragging"); renumber(); });
      list.appendChild(it);
    });
    list.addEventListener("dragover", e => {
      e.preventDefault();
      const dragging = list.querySelector(".dragging"); if (!dragging) return;
      const after = getAfter(list, e.clientY);
      if (after == null) list.appendChild(dragging); else list.insertBefore(dragging, after);
    });
    function getAfter(container, y) {
      const items = [...container.querySelectorAll(".orderitem:not(.dragging)")];
      return items.reduce((closest, child) => {
        const box = child.getBoundingClientRect(); const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child }; return closest;
      }, { offset: -Infinity, element: null }).element;
    }
    function renumber() {[...list.children].forEach((c, i) => { const n = c.querySelector(".num"); if (n) n.textContent = (i + 1); }); }
    host.appendChild(list); renumber();
    return {
      auto: false,
      isComplete() { return true; },
      check() {
        const cur = [...list.children].map(c => c.dataset.text);
        let allCorrect = true;
        [...list.children].forEach((c, i) => { const ok = cur[i] === q.items[i]; c.classList.add(ok ? "mark-ok" : "mark-bad"); if (!ok) allCorrect = false; c.draggable = false; });
        if (!allCorrect) host.appendChild(el("div", "small center", "✔ Correct order: " + q.items.map(esc).join(" → ")));
        return allCorrect;
      }
    };
  }

  /* ---- CATEGORISE (chips into buckets) ---- */
  function renderCategorise(q, host) {
    host.appendChild(el("div", "small center", "Drag each item into the correct group."));
    const bank = el("div", "chip-bank");
    shuffle(q.items).forEach(it => bank.appendChild(makeChip(it[0])));
    host.appendChild(bank); makeDropTarget(bank, () => true);
    const buckets = el("div", "buckets"); const dropAreas = [];
    q.buckets.forEach((name, bi) => {
      const b = el("div", "bucket"); b.innerHTML = `<h4>${esc(name)}</h4>`;
      const drop = el("div", "drop"); b.appendChild(drop); drop.dataset.bucket = bi;
      // single drop handler on the whole bucket; always routes the chip into .drop
      b.addEventListener("dragover", e => { e.preventDefault(); b.classList.add("over"); });
      b.addEventListener("dragleave", () => b.classList.remove("over"));
      b.addEventListener("drop", e => { e.preventDefault(); b.classList.remove("over"); if (DRAG.chip) { drop.appendChild(DRAG.chip); Sound.play("click"); } });
      dropAreas.push(drop); buckets.appendChild(b);
    });
    host.appendChild(buckets);
    const answerOf = {}; q.items.forEach(it => answerOf[it[0]] = it[1]);
    return {
      auto: false,
      isComplete() { return !bank.querySelector(".dchip"); },
      check() {
        let allCorrect = true;
        dropAreas.forEach(drop => {
          const bi = +drop.dataset.bucket;
          [...drop.querySelectorAll(".dchip")].forEach(chip => {
            const ok = answerOf[chip.dataset.text] === bi; chip.classList.add(ok ? "mark-ok" : "mark-bad"); chip.draggable = false; if (!ok) allCorrect = false;
          });
        });
        if (!allCorrect) {
          const key = q.items.map(it => esc(it[0]) + " → <b>" + esc(q.buckets[it[1]]) + "</b>").join("; ");
          host.appendChild(el("div", "small", "✔ " + key));
        }
        return allCorrect;
      }
    };
  }

  /* ---- LABEL (drag chips onto SVG zones) ---- */
  function renderLabel(q, host) {
    host.appendChild(el("div", "small center", "Drag each label onto the correct spot."));
    const bank = el("div", "chip-bank");
    shuffle(q.zones.map(z => z.answer)).forEach(a => bank.appendChild(makeChip(a)));
    host.appendChild(bank); makeDropTarget(bank, () => true);
    const wrap = el("div", "diagramwrap"); wrap.innerHTML = q.svg;
    const zoneNodes = [];
    q.zones.forEach((z, i) => {
      const zn = el("div", "dropzone", (i + 1) + ""); zn.style.left = z.x + "%"; zn.style.top = z.y + "%"; zn.dataset.answer = z.answer;
      zn.addEventListener("dragover", e => { e.preventDefault(); zn.classList.add("over"); });
      zn.addEventListener("dragleave", () => zn.classList.remove("over"));
      zn.addEventListener("drop", e => {
        e.preventDefault(); zn.classList.remove("over"); if (!DRAG.chip) return;
        // if zone already has a chip, send it back to bank
        const existing = zn.querySelector(".dchip"); if (existing) bank.appendChild(existing);
        zn.appendChild(DRAG.chip); zn.classList.add("filled"); Sound.play("click");
      });
      wrap.appendChild(zn); zoneNodes.push(zn);
    });
    host.appendChild(wrap);
    return {
      auto: false,
      isComplete() { return zoneNodes.every(z => z.querySelector(".dchip")); },
      check() {
        let allCorrect = true;
        zoneNodes.forEach(z => {
          const chip = z.querySelector(".dchip"); const ok = chip && chip.dataset.text === z.dataset.answer;
          z.classList.add(ok ? "mark-ok" : "mark-bad"); if (chip) chip.draggable = false;
          if (!ok) { allCorrect = false; z.title = z.dataset.answer; if (!chip) { z.classList.add("filled"); z.innerHTML = esc(z.dataset.answer); } else chip.innerHTML = esc(chip.dataset.text); }
        });
        return allCorrect;
      }
    };
  }

  /* ============================================================
     QUIZ BATTLE (orchestrates the engine)
     ============================================================ */
  function screenQuiz(topicId, gymId) {
    const topic = getTopic(topicId); const g = topic.gyms.find(x => x.id === gymId); const prog = topicProgress(topicId);
    const questions = g.quiz; const total = questions.length;
    const st = starterObj();
    let qi = 0, score = 0, enemyHp = total, yourHp = 3, current = null, resolved = false;

    renderHUD(); app.innerHTML = "";
    const p = el("div", "panel battle"); app.appendChild(p);

    function hpBar(id, cls) { return `<div class="hpwrap"><div class="hplabel">HP</div><div class="hp ${cls}" id="${id}"><span></span></div></div>`; }
    function setHp(id, val, max) { const bar = document.getElementById(id); if (!bar) return; const pct = Math.max(0, (val / max) * 100); bar.querySelector("span").style.width = pct + "%"; bar.classList.toggle("low", pct <= 34); }

    function render() {
      resolved = false;
      const q = questions[qi];
      const typeLabel = { mc: "Choose one", multi: "Select all that apply", match: "Match the pairs", order: "Put in order", categorise: "Sort into groups", label: "Label the diagram" }[q.type || "mc"];
      p.innerHTML = `<h2 class="section">⚔️ ${esc(g.name)}</h2>
        <div class="arena">
          <div class="mon"><div class="face">${st.emoji}</div><div class="nm">${esc(st.name)} (you)</div>${hpBar("youHp", "")}</div>
          <div class="vs">VS</div>
          <div class="mon"><div class="face">🌵</div><div class="nm">${esc(g.leader)}</div>${hpBar("foeHp", "")}</div>
        </div>
        <div class="qcount">Q ${qi + 1}/${total} · Lives: ${"❤️".repeat(yourHp) || "💀"} · <b>${typeLabel}</b></div>
        <div class="qbox"><div class="qtext">${esc(q.q)}</div><div id="qhost"></div>
          <div class="feedback" id="fb"></div></div>
        <div class="btnrow" id="qnav"></div>`;
      setHp("foeHp", enemyHp, total); setHp("youHp", yourHp, 3);

      const hostEl = $("#qhost");
      current = renderQuestion(q, hostEl);
      const nav = $("#qnav");
      if (current.auto) { current.bind(() => resolve()); }
      else { const checkBtn = el("button", "btn blue", "⚔️ Attack! (check)"); checkBtn.addEventListener("click", () => { if (!current.isComplete()) { toast("Place all your answers first!"); return; } resolve(); }); nav.appendChild(checkBtn); }
      window.scrollTo(0, 0);
    }

    function resolve() {
      if (resolved) return; resolved = true;
      const q = questions[qi]; const correct = current.check();
      const fb = $("#fb"); const nav = $("#qnav"); nav.innerHTML = "";
      if (correct) { score++; enemyHp--; setHp("foeHp", enemyHp, total); Sound.play("correct"); fb.className = "feedback show good"; fb.innerHTML = "✅ Super effective! " + q.explain; }
      else { yourHp--; setHp("youHp", yourHp, 3); Sound.play("wrong"); fb.className = "feedback show meh"; fb.innerHTML = "❌ Not quite. " + q.explain; }

      if (yourHp <= 0) { const b = el("button", "btn red", "💫 You fainted — Try again"); b.addEventListener("click", () => screenQuiz(topicId, gymId)); nav.appendChild(b); const m = el("button", "btn ghost", "🗺️ Map"); m.addEventListener("click", () => screenMap(topicId)); nav.appendChild(m); return; }
      const isLast = qi === total - 1;
      const b = el("button", "btn " + (isLast ? "grass" : "blue"), isLast ? "See result →" : "Next →");
      b.addEventListener("click", () => { Sound.play("click"); if (isLast) finish(); else { qi++; render(); } });
      nav.appendChild(b);
    }

    function finish() {
      const pass = score >= Math.ceil(total * 0.6);
      const prevBest = prog.bestScores[gymId];
      if (!prevBest || score > prevBest.score) prog.bestScores[gymId] = { score, total };
      let gainedBadge = false;
      if (pass && !prog.badges[gymId]) { prog.badges[gymId] = true; gainedBadge = true; }
      save();
      addXP(score * 10, "quiz answers"); if (gainedBadge) addXP(50, "new badge!");

      const showResult = () => {
        renderHUD();
        p.innerHTML = `<h2 class="section">${pass ? "🏆 Victory!" : "😓 So close!"}</h2>
          <div class="arena">
            <div class="mon"><div class="face">${st.emoji}</div><div class="nm">${esc(st.name)}</div></div>
            <div class="vs">${pass ? "WIN" : "—"}</div>
            <div class="mon"><div class="face">${pass ? "😵 🌵" : "🌵"}</div><div class="nm">${esc(g.leader)}</div></div>
          </div>
          <p class="lead center">You scored <b>${score}/${total}</b>.</p>
          ${pass ? `<p class="center" style="font-size:1.2rem">You hold the <b>${esc(g.badge)}</b>!</p>`
                 : `<p class="center">You need <b>${Math.ceil(total * 0.6)}/${total}</b> for the badge. Review the cards and battle again!</p>`}
          <div class="btnrow center" style="justify-content:center">
            <button class="btn grass" id="againBtn">↺ Battle again</button>
            <button class="btn blue" id="learnAgainBtn">📚 Review cards</button>
            <button class="btn ghost" id="mapBtn">🗺️ Map</button>
          </div>`;
        if (pass) { confetti(); Sound.play("win"); }
        $("#againBtn").addEventListener("click", () => screenQuiz(topicId, gymId));
        $("#learnAgainBtn").addEventListener("click", () => screenLesson(topicId, gymId, 0));
        $("#mapBtn").addEventListener("click", () => screenMap(topicId));
        window.scrollTo(0, 0);
      };
      if (gainedBadge) badgeOverlay(g.badge, g.name, showResult); else showResult();
    }

    render();
  }

  /* ============================================================
     LEITNER FLASHCARDS ("got it" / "still learning")
     ============================================================ */
  function screenFlashcards(topicId) {
    const topic = getTopic(topicId); const prog = topicProgress(topicId);
    const cards = topic.flashcards; const totalCards = cards.length;
    renderHUD(); app.innerHTML = "";
    const p = el("div", "panel"); app.appendChild(p);

    // build working queue from cards not yet mastered
    let queue = cards.map((c, i) => i).filter(i => !prog.mastery[i]);
    queue = shuffle(queue);
    let flipped = false;

    function masteredCount() { return Object.keys(prog.mastery).filter(k => prog.mastery[k]).length; }

    function done() {
      p.innerHTML = `<h2 class="section">🃏 Deck Cleared!</h2>
        <div class="center" style="font-size:3rem">🎉🃏</div>
        <p class="lead center">Brilliant, ${esc(state.trainer)} — you marked <b>all ${totalCards}</b> ${esc(topic.name)} cards as "Got it"!</p>
        <div class="btnrow center" style="justify-content:center">
          <button class="btn grass" id="resetDeck">🔁 Practise all again</button>
          <button class="btn ghost" id="toMap">🗺️ Map</button>
        </div>`;
      confetti(); Sound.play("win");
      $("#resetDeck").addEventListener("click", () => { prog.mastery = {}; save(); screenFlashcards(topicId); });
      $("#toMap").addEventListener("click", () => screenMap(topicId));
      window.scrollTo(0, 0);
    }

    function render() {
      if (queue.length === 0) { save(); return done(); }
      const idx = queue[0]; const c = cards[idx];
      const mastered = masteredCount();
      const tierTxt = c.tier === "H" ? "Higher Tier" : "Foundation";
      p.innerHTML = `<h2 class="section">🃏 ${esc(topic.name)} — Flashcard Trainer</h2>
        <div class="leitner-progress">
          <div class="leitner-bar"><span style="width:${(mastered / totalCards) * 100}%"></span></div>
          <div class="leitner-stats"><span>✅ ${mastered}/${totalCards} mastered</span><span>🔁 ${queue.length} in this round</span></div>
        </div>
        <div class="flashwrap">
          <div class="flashcard" id="fc">
            <div class="flashinner">
              <div class="flashface flashfront"><span class="lab">❔ QUESTION</span><span class="tierpill">${tierTxt}</span><span class="txt">${esc(c.q)}</span><span class="hint">tap to reveal ▸</span></div>
              <div class="flashface flashback"><span class="lab">💡 ANSWER</span><span class="txt">${esc(c.a)}</span><span class="hint">how did you do?</span></div>
            </div>
          </div>
          <div class="flashbtns" id="fcBtns">
            <button class="btn yellow" id="flipBtn">🔄 Flip card</button>
          </div>
          <div class="btnrow center" style="justify-content:center">
            <button class="btn ghost" id="mapC">🗺️ Map</button>
            <button class="btn ghost" id="resetC">↺ Reset progress</button>
          </div>
        </div>`;
      flipped = false;
      const fc = $("#fc");
      function showJudgeButtons() {
        const box = $("#fcBtns");
        box.innerHTML = `<button class="btn learn" id="stillBtn">🔁 Still learning</button>
                         <button class="btn know" id="gotBtn">✅ Got it!</button>`;
        $("#gotBtn").addEventListener("click", () => { prog.mastery[idx] = true; save(); Sound.play("correct"); queue.shift(); render(); });
        $("#stillBtn").addEventListener("click", () => { Sound.play("click"); const first = queue.shift(); queue.push(first); render(); });
      }
      function flip() { flipped = !flipped; fc.classList.toggle("flipped", flipped); Sound.play("click"); if (flipped) showJudgeButtons(); }
      fc.addEventListener("click", flip);
      $("#flipBtn").addEventListener("click", e => { e.stopPropagation(); flip(); });
      $("#mapC").addEventListener("click", () => screenMap(topicId));
      $("#resetC").addEventListener("click", () => { if (confirm("Reset flashcard progress for this topic?")) { prog.mastery = {}; save(); screenFlashcards(topicId); } });
      window.scrollTo(0, 0);
    }
    render();
  }

  /* ============================================================
     CHAMPION SUMMARY (per topic)
     ============================================================ */
  function screenChampion(topicId) {
    const topic = getTopic(topicId); const prog = topicProgress(topicId);
    renderHUD(); app.innerHTML = "";
    const st = starterObj();
    const rows = topic.gyms.map(g => { const b = prog.bestScores[g.id]; return `<div class="term"><b>${esc(g.badge)}</b> — ${esc(g.name)} ${b ? ('· best ' + b.score + '/' + b.total) : ''}</div>`; }).join("");
    const p = el("div", "panel center");
    p.innerHTML = `<h2 class="section">🏅 ${esc(topic.name)} Champion!</h2>
      <div style="font-size:3.4rem">${st.emoji}🏆</div>
      <p class="lead">Amazing, <b>${esc(state.trainer)}</b> — every badge in ${esc(topic.name)} collected!</p>
      <div class="terms" style="text-align:left;max-width:520px;margin:0 auto">${rows}</div>
      <div class="btnrow center" style="justify-content:center;margin-top:16px">
        <button class="btn blue" id="flashX">🃏 Keep revising</button>
        <button class="btn grass" id="regionsX">🗺️ Other regions</button>
        <button class="btn ghost" id="mapX">← Map</button>
      </div>`;
    app.appendChild(p);
    $("#flashX").addEventListener("click", () => screenFlashcards(topicId));
    $("#regionsX").addEventListener("click", screenTopics);
    $("#mapX").addEventListener("click", () => screenMap(topicId));
    confetti(); Sound.play("win"); window.scrollTo(0, 0);
  }

  /* ---------- boot ---------- */
  function boot() {
    renderHUD();
    if (state.trainer && state.starter) screenTopics(); else screenStart();
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
