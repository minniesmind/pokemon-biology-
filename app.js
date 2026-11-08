/* ============================================================
   POKÉ-PROFESSOR — app logic
   Pure vanilla JS, no build tools, works from file://
   ============================================================ */

(function () {
  "use strict";

  const SAVE_KEY = "pokeProfessor_plantHormones_v1";

  /* ---------- Save / load progress ---------- */
  const defaultState = {
    trainer: "",
    starter: null,
    xp: 0,
    badges: {},        // gymId -> true
    bestScores: {}     // gymId -> {score,total}
  };
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return Object.assign({}, defaultState, JSON.parse(raw));
    } catch (e) {}
    return Object.assign({}, defaultState);
  }
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- Level maths ---------- */
  function level() { return Math.floor(state.xp / 100) + 1; }
  function xpIntoLevel() { return state.xp % 100; }

  /* ---------- DOM helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const app = $("#app");
  const hud = $("#hud");

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s){ return String(s).replace(/[&<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

  /* ---------- Toast + confetti ---------- */
  function toast(msg, ms) {
    const t = $("#toast");
    t.innerHTML = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), ms || 2600);
  }
  function confetti() {
    const box = el("div", "confetti");
    const colors = ["#ffcb05", "#e3350d", "#3b5ba5", "#4caf50", "#ff7a5c", "#8e2de2"];
    for (let i = 0; i < 70; i++) {
      const c = el("i");
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (1.6 + Math.random() * 1.6) + "s";
      c.style.animationDelay = (Math.random() * 0.4) + "s";
      box.appendChild(c);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3600);
  }

  function addXP(amount, reason) {
    const before = level();
    state.xp += amount;
    save();
    renderHUD();
    const after = level();
    if (after > before) {
      toast("⭐ LEVEL UP! You're now Lv." + after, 3000);
      confetti();
    } else if (reason) {
      toast("+" + amount + " XP — " + reason);
    }
  }

  /* ---------- HUD (level, xp, badges) ---------- */
  function renderHUD() {
    if (!state.trainer) { hud.classList.add("hidden"); return; }
    hud.classList.remove("hidden");
    const badges = GAME_DATA.gyms.map(g => {
      const earned = state.badges[g.id] ? " earned" : "";
      const sym = g.badge.split(" ")[0];
      return `<span class="b${earned}" title="${esc(g.badge)}">${sym}</span>`;
    }).join("");
    hud.innerHTML =
      `<span class="lvl">Lv.${level()}</span>
       <div class="xpbar"><span style="width:${xpIntoLevel()}%"></span></div>
       <div class="badgestrip">${badges}</div>`;
  }

  /* ============================================================
     SCREENS
     ============================================================ */

  /* ---- Start screen ---- */
  function screenStart() {
    renderHUD();
    const p = el("div", "panel hero");
    p.innerHTML = `
      <div class="pokeball" style="margin:0 auto 10px;width:46px;height:46px"></div>
      <div class="big">PLANT HORMONES</div>
      <div class="sub">A Pokémon-style GCSE Biology adventure 🌿⚡</div>
      <p class="lead center">Professor Oak: <i>"Hello! The world of plants is full of hidden moves and
      type match-ups. Catch the knowledge, battle the quizzes, and collect all 5 Gym Badges to
      become a Plant Hormone Champion!"</i></p>
      <p class="center" style="margin-top:16px"><b>What's your trainer name?</b></p>
      <div class="center"><input id="nameInput" class="input" placeholder="e.g. Ash" maxlength="16" value="${esc(state.trainer||"")}"></div>
      <p class="center" style="margin:18px 0 6px"><b>Choose your starter Grass-Pokémon:</b></p>
      <div class="starters" id="starters"></div>
      <div class="center"><button class="btn grass" id="beginBtn">START ADVENTURE ▶</button></div>
      <div class="footnote">Content: AQA GCSE Biology — Plant Hormones. Your progress saves automatically on this device.</div>
    `;
    app.innerHTML = "";
    app.appendChild(p);

    const sc = $("#starters");
    let chosen = state.starter;
    GAME_DATA.starters.forEach(s => {
      const c = el("div", "starter" + (chosen === s.id ? " sel" : ""));
      c.innerHTML = `<div class="face">${s.emoji}</div><div class="nm">${esc(s.name)}</div><div class="bl">${esc(s.blurb)}</div>`;
      c.addEventListener("click", () => {
        chosen = s.id;
        [...sc.children].forEach(ch => ch.classList.remove("sel"));
        c.classList.add("sel");
      });
      sc.appendChild(c);
    });

    $("#beginBtn").addEventListener("click", () => {
      const nm = $("#nameInput").value.trim() || "Trainer";
      if (!chosen) { toast("Pick a starter Pokémon first!"); return; }
      state.trainer = nm;
      state.starter = chosen;
      save();
      screenMap();
    });
  }

  function starterObj() {
    return GAME_DATA.starters.find(s => s.id === state.starter) || GAME_DATA.starters[0];
  }

  /* ---- Gym map ---- */
  function screenMap() {
    renderHUD();
    app.innerHTML = "";

    const bar = el("div", "panel");
    const earnedCount = Object.keys(state.badges).length;
    const st = starterObj();
    bar.innerHTML = `
      <h2 class="section">🗺️ Gym Map</h2>
      <p class="lead">Welcome, <b>${esc(state.trainer)}</b>! ${st.emoji} ${esc(st.name)} is at your side.
      You've earned <b>${earnedCount}/5</b> badges. Pick a gym to train, then battle its quiz to win the badge.</p>
      <div class="btnrow">
        <button class="btn blue" id="flashBtn">🃏 Flashcard Battle Deck</button>
        ${earnedCount===5 ? '<button class="btn grass" id="champBtn">🏅 Champion Summary</button>' : ''}
        <button class="btn ghost" id="resetBtn">↺ Reset progress</button>
      </div>
    `;
    app.appendChild(bar);

    const grid = el("div", "gymgrid");
    GAME_DATA.gyms.forEach((g, i) => {
      const done = state.badges[g.id];
      const best = state.bestScores[g.id];
      const card = el("div", "gymcard g" + i);
      card.innerHTML = `
        ${done ? '<div class="done">✅</div>' : ''}
        <div class="glabel">${esc(g.name)}</div>
        <div class="gleader">${esc(g.leader)} · ${esc(g.type)}-type</div>
        <div class="gtag">"${esc(g.tagline)}"</div>
        <div class="gmeta">
          <span class="chip">${esc(g.badge)}</span>
          <span>${best ? ('Best '+best.score+'/'+best.total) : (done?'':'Not cleared')}</span>
        </div>
        <div style="margin-top:8px"><span class="tierflag">${esc(g.tier)}</span></div>
      `;
      card.addEventListener("click", () => screenGym(g.id));
      grid.appendChild(card);
    });
    app.appendChild(grid);

    $("#flashBtn").addEventListener("click", () => screenFlashcards());
    const champ = $("#champBtn"); if (champ) champ.addEventListener("click", screenChampion);
    $("#resetBtn").addEventListener("click", () => {
      if (confirm("Reset ALL progress and start a new adventure?")) {
        state = Object.assign({}, defaultState, { badges:{}, bestScores:{} });
        save(); screenStart();
      }
    });
    window.scrollTo(0, 0);
  }

  /* ---- Gym intro ---- */
  function screenGym(gymId) {
    const g = GAME_DATA.gyms.find(x => x.id === gymId);
    renderHUD();
    app.innerHTML = "";
    const p = el("div", "panel");
    const done = state.badges[g.id];
    p.innerHTML = `
      <h2 class="section">${esc(g.name)}</h2>
      <p class="small">${esc(g.leader)} · ${esc(g.type)}-type · <b>${esc(g.tier)}</b> · Prize: ${esc(g.badge)} ${done?'(earned ✅)':''}</p>
      <div class="poke-note">👟 <b>${esc(g.leader)}:</b> ${esc(g.intro)}</div>
      <p class="lead">This gym has <b>${g.lessons.length}</b> training cards and a <b>${g.quiz.length}-question</b> battle.</p>
      <div class="btnrow">
        <button class="btn grass" id="learnBtn">📚 Train (learn)</button>
        <button class="btn red" id="fightBtn">⚔️ Battle the quiz</button>
        <button class="btn ghost" id="backBtn">← Map</button>
      </div>
    `;
    app.appendChild(p);
    $("#learnBtn").addEventListener("click", () => screenLesson(gymId, 0));
    $("#fightBtn").addEventListener("click", () => screenQuiz(gymId));
    $("#backBtn").addEventListener("click", screenMap);
    window.scrollTo(0, 0);
  }

  /* ---- Lesson (Pokédex cards) ---- */
  function screenLesson(gymId, idx) {
    const g = GAME_DATA.gyms.find(x => x.id === gymId);
    const lesson = g.lessons[idx];
    renderHUD();
    app.innerHTML = "";

    const dots = g.lessons.map((_, i) => `<i class="${i===idx?'on':''}"></i>`).join("");
    const terms = (lesson.terms || []).map(t =>
      `<div class="term"><b>${esc(t[0])}:</b> ${esc(t[1])}</div>`).join("");
    const facts = lesson.facts.map(f => `<li>${f}</li>`).join("");

    const p = el("div", "panel");
    p.innerHTML = `
      <h2 class="section">📚 ${esc(g.name)}</h2>
      <div class="dexcard">
        <div class="head">#${idx+1} · ${esc(lesson.title)}</div>
        <div class="body">
          <div class="poke-note">🎮 <b>Pokémon link:</b> ${esc(lesson.poke)}</div>
          <ul class="facts">${facts}</ul>
          ${terms ? `<div class="terms">${terms}</div>` : ''}
        </div>
      </div>
      <div class="progressdots">${dots}</div>
      <div class="btnrow">
        ${idx>0 ? '<button class="btn ghost" id="prevBtn">← Back</button>' : '<button class="btn ghost" id="gymBtn">← Gym</button>'}
        ${idx < g.lessons.length-1
            ? '<button class="btn blue" id="nextBtn">Next card →</button>'
            : '<button class="btn red" id="toFightBtn">⚔️ I\'m ready — Battle!</button>'}
      </div>
    `;
    app.appendChild(p);

    if ($("#prevBtn")) $("#prevBtn").addEventListener("click", () => screenLesson(gymId, idx-1));
    if ($("#gymBtn")) $("#gymBtn").addEventListener("click", () => screenGym(gymId));
    if ($("#nextBtn")) $("#nextBtn").addEventListener("click", () => screenLesson(gymId, idx+1));
    if ($("#toFightBtn")) $("#toFightBtn").addEventListener("click", () => screenQuiz(gymId));
    window.scrollTo(0, 0);
  }

  /* ---- Quiz battle ---- */
  function screenQuiz(gymId) {
    const g = GAME_DATA.gyms.find(x => x.id === gymId);
    const questions = g.quiz;
    let qi = 0, score = 0, locked = false;
    const st = starterObj();
    const total = questions.length;
    const enemyMaxHp = total;      // each correct answer = 1 damage
    let enemyHp = total;
    let yourHp = 3;                // 3 lives

    renderHUD();
    app.innerHTML = "";
    const p = el("div", "panel battle");
    app.appendChild(p);

    function hpBar(id, cls) {
      return `<div class="hpwrap"><div class="hplabel">HP</div>
        <div class="hp ${cls}" id="${id}"><span></span></div></div>`;
    }

    function drawArena() {
      return `
        <div class="arena">
          <div class="mon">
            <div class="face">${st.emoji}</div>
            <div class="nm">${esc(st.name)} (you)</div>
            ${hpBar("youHp","")}
          </div>
          <div class="vs">VS</div>
          <div class="mon">
            <div class="face">🌵</div>
            <div class="nm">${esc(g.leader)}</div>
            ${hpBar("foeHp","")}
          </div>
        </div>`;
    }

    function setHp(id, val, max) {
      const bar = document.getElementById(id);
      if (!bar) return;
      const pct = Math.max(0, (val / max) * 100);
      bar.querySelector("span").style.width = pct + "%";
      bar.classList.toggle("low", pct <= 34);
    }

    function render() {
      const q = questions[qi];
      p.innerHTML = `
        <h2 class="section">⚔️ ${esc(g.name)}</h2>
        ${drawArena()}
        <div class="qcount">Question ${qi+1} / ${total} · Lives: ${"❤️".repeat(yourHp)||"💀"}</div>
        <div class="qbox">
          <div class="qtext">${esc(q.q)}</div>
          <div class="opts" id="opts"></div>
          <div class="feedback" id="fb"></div>
        </div>
        <div class="btnrow" id="qnav"></div>
      `;
      setHp("foeHp", enemyHp, enemyMaxHp);
      setHp("youHp", yourHp, 3);

      const opts = $("#opts");
      q.options.forEach((opt, i) => {
        const b = el("button", "opt");
        b.innerHTML = esc(opt);
        b.addEventListener("click", () => choose(i, b));
        opts.appendChild(b);
      });
      window.scrollTo(0, 0);
    }

    function choose(i, btn) {
      if (locked) return;
      locked = true;
      const q = questions[qi];
      const fb = $("#fb");
      const buttons = [...$("#opts").children];
      buttons.forEach(b => b.disabled = true);

      if (i === q.answer) {
        btn.classList.add("correct");
        score++;
        enemyHp--;
        setHp("foeHp", enemyHp, enemyMaxHp);
        fb.className = "feedback show good";
        fb.innerHTML = "✅ Super effective! " + q.explain;
      } else {
        btn.classList.add("wrong");
        buttons[q.answer].classList.add("correct");
        yourHp--;
        setHp("youHp", yourHp, 3);
        fb.className = "feedback show meh";
        fb.innerHTML = "❌ Not quite. " + q.explain;
      }

      const nav = $("#qnav");
      nav.innerHTML = "";
      if (yourHp <= 0) {
        const b = el("button", "btn red", "💫 You fainted — Try again");
        b.addEventListener("click", () => screenQuiz(gymId));
        nav.appendChild(b);
        return;
      }
      const isLast = qi === total - 1;
      const b = el("button", "btn blue", isLast ? "See result →" : "Next →");
      b.addEventListener("click", () => {
        if (isLast) { finish(); }
        else { qi++; locked = false; render(); }
      });
      nav.appendChild(b);
    }

    function finish() {
      const pass = score >= Math.ceil(total * 0.6); // 60% to win badge
      const prevBest = state.bestScores[gymId];
      if (!prevBest || score > prevBest.score) state.bestScores[gymId] = { score, total };

      let gainedBadge = false;
      if (pass && !state.badges[gymId]) { state.badges[gymId] = true; gainedBadge = true; }
      save();

      addXP(score * 10, "quiz answers");
      if (gainedBadge) { addXP(50, "new badge!"); }

      renderHUD();
      p.innerHTML = `
        <h2 class="section">${pass ? "🏆 Victory!" : "😓 So close!"}</h2>
        <div class="arena">
          <div class="mon"><div class="face">${st.emoji}</div><div class="nm">${esc(st.name)}</div></div>
          <div class="vs">${pass?"WIN":"—"}</div>
          <div class="mon"><div class="face">${pass?"😵 🌵":"🌵"}</div><div class="nm">${esc(g.leader)}</div></div>
        </div>
        <p class="lead center">You scored <b>${score}/${total}</b>.</p>
        ${pass
          ? `<p class="center" style="font-size:1.2rem">You won the <b>${esc(g.badge)}</b>! ${gainedBadge?"(NEW)":"(already had it)"}</p>`
          : `<p class="center">You need <b>${Math.ceil(total*0.6)}/${total}</b> to win the badge. Re-read the training cards and battle again!</p>`}
        <div class="btnrow center" style="justify-content:center">
          <button class="btn grass" id="againBtn">↺ Battle again</button>
          <button class="btn blue" id="learnAgainBtn">📚 Review cards</button>
          <button class="btn ghost" id="mapBtn">🗺️ Gym Map</button>
        </div>
      `;
      if (pass) confetti();
      $("#againBtn").addEventListener("click", () => screenQuiz(gymId));
      $("#learnAgainBtn").addEventListener("click", () => screenLesson(gymId, 0));
      $("#mapBtn").addEventListener("click", screenMap);
      window.scrollTo(0, 0);
    }

    render();
  }

  /* ---- Flashcard battle deck ---- */
  function screenFlashcards() {
    renderHUD();
    let idx = 0, flipped = false;
    const cards = GAME_DATA.flashcards;

    app.innerHTML = "";
    const p = el("div", "panel");
    app.appendChild(p);

    function render() {
      const c = cards[idx];
      const tierTxt = c.tier === "H" ? "Higher Tier" : "Foundation";
      p.innerHTML = `
        <h2 class="section">🃏 Flashcard Battle Deck</h2>
        <p class="small center">Card ${idx+1} / ${cards.length} — tap the card to flip. Test yourself before you look!</p>
        <div class="flashwrap">
          <div class="flashcard${flipped?' flipped':''}" id="fc">
            <div class="flashinner">
              <div class="flashface flashfront">
                <span class="lab">❔ QUESTION</span>
                <span class="tierpill">${tierTxt}</span>
                <span class="txt">${esc(c.q)}</span>
                <span class="hint">tap to reveal ▸</span>
              </div>
              <div class="flashface flashback">
                <span class="lab">💡 ANSWER</span>
                <span class="txt">${esc(c.a)}</span>
                <span class="hint">◂ tap to flip back</span>
              </div>
            </div>
          </div>
          <div class="btnrow center" style="justify-content:center">
            <button class="btn ghost" id="prevC">← Prev</button>
            <button class="btn yellow" id="flipC">🔄 Flip</button>
            <button class="btn blue" id="nextC">Next →</button>
          </div>
          <div class="btnrow center" style="justify-content:center">
            <button class="btn grass" id="shuffleC">🔀 Shuffle deck</button>
            <button class="btn ghost" id="mapC">🗺️ Gym Map</button>
          </div>
        </div>
      `;
      const fc = $("#fc");
      fc.addEventListener("click", () => { flipped = !flipped; fc.classList.toggle("flipped"); });
      $("#flipC").addEventListener("click", (e) => { e.stopPropagation(); flipped = !flipped; fc.classList.toggle("flipped"); });
      $("#prevC").addEventListener("click", () => { idx = (idx - 1 + cards.length) % cards.length; flipped = false; render(); });
      $("#nextC").addEventListener("click", () => { idx = (idx + 1) % cards.length; flipped = false; render(); addXP(2); });
      $("#shuffleC").addEventListener("click", () => {
        for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [cards[i],cards[j]]=[cards[j],cards[i]]; }
        idx = 0; flipped = false; render(); toast("Deck shuffled! 🔀");
      });
      $("#mapC").addEventListener("click", screenMap);
      window.scrollTo(0, 0);
    }
    render();
  }

  /* ---- Champion summary ---- */
  function screenChampion() {
    renderHUD();
    app.innerHTML = "";
    const st = starterObj();
    const rows = GAME_DATA.gyms.map(g => {
      const b = state.bestScores[g.id];
      return `<div class="term"><b>${esc(g.badge)}</b> — ${esc(g.name)} ${b?('· best '+b.score+'/'+b.total):''}</div>`;
    }).join("");
    const p = el("div", "panel center");
    p.innerHTML = `
      <h2 class="section">🏅 Plant Hormone Champion!</h2>
      <div style="font-size:3.4rem">${st.emoji}🏆</div>
      <p class="lead">Congratulations <b>${esc(state.trainer)}</b> — all 5 badges collected and Lv.${level()} reached!
      You can now explain tropisms, auxin, gibberellins, ethene, the required practical and real-world uses.</p>
      <div class="terms" style="text-align:left;max-width:520px;margin:0 auto">${rows}</div>
      <div class="btnrow center" style="justify-content:center;margin-top:16px">
        <button class="btn blue" id="flashX">🃏 Keep revising (flashcards)</button>
        <button class="btn ghost" id="mapX">🗺️ Gym Map</button>
      </div>
    `;
    app.appendChild(p);
    $("#flashX").addEventListener("click", screenFlashcards);
    $("#mapX").addEventListener("click", screenMap);
    confetti();
    window.scrollTo(0, 0);
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHUD();
    if (state.trainer && state.starter) screenMap();
    else screenStart();
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
