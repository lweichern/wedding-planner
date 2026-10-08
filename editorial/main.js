/* ------------------------------------------------------------------
   Editorial variant page logic: printing pass, language, bindings,
   split-flap countdown, schedule, line art drawn on scroll, living
   folio, barcode, RSVP, guided tour.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  const W = window.WEDDING;
  const T = window.I18N;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const get = (path, obj) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj || W);

  let lang = "en";
  const t = (key) => (T[lang] && T[lang][key]) || T.en[key] || key;
  const locale = () => (lang === "da" ? "da-DK" : "en-GB");
  const fmtTime = (iso) => new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: W.timeZone }).format(new Date(iso));
  const fmtDate = (iso, o) => new Intl.DateTimeFormat(locale(), Object.assign({ day: "numeric", month: "long", year: "numeric", timeZone: W.timeZone }, o || {})).format(new Date(iso));
  const wordCount = () => t("story.body").trim().split(/\s+/).length;

  /* ---------------- language ---------------- */
  function applyLang(next) {
    lang = T[next] ? next : "en";
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    $$("[data-i18n]").forEach((n) => (n.textContent = t(n.dataset.i18n)));
    $$("[data-i18n-n]").forEach((n) => (n.textContent = t(n.dataset.i18nN).replace("{n}", String(wordCount()))));
    $$("[data-i18n-ph]").forEach((n) => (n.placeholder = t(n.dataset.i18nPh)));
    $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    $$("[data-bind-lang]").forEach((n) => { const v = get(n.dataset.bindLang); n.textContent = typeof v === "object" ? v[lang] || v.en : v; });
    $$("[data-time]").forEach((n) => (n.textContent = fmtTime(get(n.dataset.time))));
    $$("[data-date]").forEach((n) => (n.textContent = fmtDate(get(n.dataset.date))));
    $$("[data-date-long]").forEach((n) => (n.textContent = fmtDate(get(n.dataset.dateLong), { weekday: "long" })));
    renderSchedule();
    updateFolio();
    tourLabel();
    try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
  }
  function initialLang() {
    try { const s = localStorage.getItem("lang"); if (s && T[s]) return s; } catch (e) { /* ignore */ }
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return T[nav] ? nav : "en";
  }

  /* ---------------- bindings ---------------- */
  function bindConfig() {
    $$("[data-bind]").forEach((n) => { const v = get(n.dataset.bind); if (v != null) n.textContent = v; });
    $$("[data-maps]").forEach((a) => { const p = W[a.dataset.maps]; a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.venue + ", " + p.address); });
    $$("[data-ics]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); downloadIcs(a.dataset.ics); }));
    if (W.credit && W.credit.name) { $("#credit-link").textContent = W.credit.name; $("#credit-link").href = W.credit.url || "#"; $("#credit").hidden = false; }
    drawBarcode();
  }

  /* ---------------- barcode: the date, as bars ---------------- */
  function drawBarcode() {
    const svg = $("#barcode");
    const d = W.date.slice(0, 10).replace(/-/g, "");
    $("#barcode-text").textContent = `${d.slice(6, 8)} ${d.slice(4, 6)} ${d.slice(0, 4)}`;
    let x = 2, seed = 7;
    const bars = [];
    for (let i = 0; i < 44; i++) {
      seed = (seed * 1103515245 + 12345 + parseInt(d[i % d.length], 10)) & 0x7fffffff;
      const w = 1 + (seed % 3);
      const gap = 1 + ((seed >> 4) % 2);
      bars.push(`<rect x="${x}" y="0" width="${w}" height="${i % 11 === 0 ? 40 : 34}" fill="currentColor"/>`);
      x += w + gap;
    }
    svg.setAttribute("viewBox", `0 0 ${x + 2} 40`);
    svg.innerHTML = bars.join("");
  }

  /* ---------------- calendar ---------------- */
  function icsStamp(iso) {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: W.timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso)).reduce((o, x) => ((o[x.type] = x.value), o), {});
    return `${p.year}${p.month}${p.day}T${p.hour === "24" ? "00" : p.hour}${p.minute}00`;
  }
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  function downloadIcs(which) {
    const place = W[which];
    const summary = `${W.couple.first} & ${W.couple.partnerFirst} · ${t(which === "ceremony" ? "toc.ceremony" : "toc.after")}`;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
      `UID:${which}-${W.date.slice(0, 10)}@${location.hostname || "invitation"}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;TZID=${W.timeZone}:${icsStamp(place.start)}`, `DTEND;TZID=${W.timeZone}:${icsStamp(place.end)}`,
      `SUMMARY:${esc(summary)}`, `LOCATION:${esc(place.venue + ", " + place.address)}`, `DESCRIPTION:${esc(t(which === "ceremony" ? "ceremony.lede" : "after.body"))}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(summary)}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${which}-${W.couple.first}-${W.couple.partnerFirst}.ics`.toLowerCase();
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ---------------- split-flap countdown ---------------- */
  const board = { groups: {}, timer: null, settled: false };
  function buildBoard() {
    $$(".flap-group").forEach((g) => {
      const n = g.dataset.count === "days" ? 3 : 2;
      const wrap = $(".flaps", g);
      wrap.replaceChildren(...Array.from({ length: n }, () => {
        const f = document.createElement("div");
        f.className = "flap";
        f.innerHTML = '<div class="half top"><span>0</span></div><div class="half bottom"><span>0</span></div><div class="half fold fold-top"><span>0</span></div><div class="half fold fold-bottom"><span>0</span></div>';
        f.dataset.digit = "0";
        return f;
      }));
      board.groups[g.dataset.count] = $$(".flap", wrap);
    });
  }
  function setDigit(flap, next) {
    const cur = flap.dataset.digit;
    if (cur === next) return;
    if (reduceMotion) {
      flap.dataset.digit = next;
      $(".top span", flap).textContent = next; $(".bottom span", flap).textContent = next;
      return;
    }
    if (flap.classList.contains("flipping")) { flap.dataset.digit = next; $(".top span", flap).textContent = next; return; }
    $(".top span", flap).textContent = next;
    $(".fold-top span", flap).textContent = cur;
    $(".fold-bottom span", flap).textContent = next;
    flap.classList.add("flipping");
    flap.dataset.digit = next;
    // read the digit back from the element: a later call may have moved it on while this flip ran
    const done = () => { const d = flap.dataset.digit; $(".top span", flap).textContent = d; $(".bottom span", flap).textContent = d; flap.classList.remove("flipping"); };
    $(".fold-bottom", flap).addEventListener("animationend", done, { once: true });
    setTimeout(() => { if (flap.classList.contains("flipping")) done(); }, 800);
  }
  function values() {
    const diff = new Date(W.date).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, past: true, sameDay: diff > -43200000 };
    return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), past: false };
  }
  function showBoard(v) {
    const pad = (n, len) => String(n).padStart(len, "0");
    const digits = { days: pad(Math.min(v.days, 999), 3), hours: pad(v.hours, 2), mins: pad(v.mins, 2) };
    Object.keys(board.groups).forEach((k) => board.groups[k].forEach((f, i) => setDigit(f, digits[k][i])));
    const note = $("#count-note");
    note.hidden = !v.past;
    if (v.past) note.textContent = v.sameDay ? t("count.today") : t("count.past");
  }
  function settleBoard() {
    if (board.settled) return;
    board.settled = true;
    const target = values();
    if (reduceMotion) { showBoard(target); return; }
    // every flap spins through a few random digits before landing, left to right
    const all = Object.keys(board.groups).flatMap((k) => board.groups[k].map((f, i) => ({ f, k, i })));
    const pad = (n, len) => String(n).padStart(len, "0");
    const finals = { days: pad(Math.min(target.days, 999), 3), hours: pad(target.hours, 2), mins: pad(target.mins, 2) };
    all.forEach(({ f, k, i }, idx) => {
      const spins = 2 + (idx % 2);
      for (let s = 0; s < spins; s++) setTimeout(() => setDigit(f, String((parseInt(f.dataset.digit, 10) + 3 + s) % 10)), idx * 110 + s * 640);
      setTimeout(() => setDigit(f, finals[k][i]), idx * 110 + spins * 640 + 40);
    });
    setTimeout(() => showBoard(values()), all.length * 110 + 3 * 640 + 900);
    board.timer = setInterval(() => showBoard(values()), 30000);
  }

  /* ---------------- schedule ---------------- */
  function renderSchedule() {
    const list = $("#schedule-list");
    const day = W.date.slice(0, 10), offset = W.date.slice(19) || "+02:00";
    list.replaceChildren(...W.timeline.map((item, idx) => {
      const li = document.createElement("li");
      li.style.setProperty("--i", String(idx));
      const tm = document.createElement("span"); tm.className = "t";
      // times after midnight belong to the next calendar day
      const h = parseInt(item.time, 10);
      const dayIso = h < 6 ? new Date(new Date(day).getTime() + 86400000).toISOString().slice(0, 10) : day;
      tm.textContent = fmtTime(`${dayIso}T${item.time}:00${offset}`);
      const ev = document.createElement("span"); ev.className = "e"; ev.textContent = t(`schedule.${item.key}`);
      li.append(tm, ev);
      return li;
    }));
  }

  /* ---------------- line art drawn by scroll ---------------- */
  const art = [];
  function initLineArt() {
    $$("svg.draw").forEach((svg) => {
      const paths = $$("path", svg).map((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L}`; return { p, L }; });
      const total = paths.reduce((a, x) => a + x.L, 0);
      art.push({ svg, paths, total, best: 0 });
    });
    if (reduceMotion) { art.forEach((a) => a.paths.forEach(({ p }) => (p.style.strokeDashoffset = "0"))); return; }
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      art.forEach((a) => {
        const r = a.svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // 0 when the drawing enters at the bottom, 1 when it is a third of the way up
        const prog = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.62 + r.height * 0.3)));
        if (prog <= a.best) return;
        a.best = prog;
        let budget = prog * a.total;
        a.paths.forEach(({ p, L }) => { const drawn = Math.max(0, Math.min(L, budget)); budget -= drawn; p.style.strokeDashoffset = `${L - drawn}`; });
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------- folio and progress ---------------- */
  let currentPage = null;
  function updateFolio() {
    if (!currentPage) return;
    $("#folio-page").textContent = currentPage.dataset.page;
    $("#folio-title").textContent = t(currentPage.dataset.folio);
  }
  function initFolio() {
    const pages = $$("[data-page]");
    $("#folio-total").textContent = String(pages.length);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { currentPage = en.target; updateFolio(); } });
    }, { rootMargin: "-45% 0px -45% 0px" });
    pages.forEach((p) => io.observe(p));
    currentPage = pages[0]; updateFolio();
    const bar = $("#progress-bar");
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`; ticking = false; });
    }, { passive: true });
  }

  /* ---------------- printing pass ---------------- */
  function initPress() {
    const press = $("#press"), skip = $("#press-skip"), cover = $("#cover");
    const deepLink = location.hash && location.hash !== "#cover" && location.hash !== "#";
    const finish = () => {
      press.classList.add("gone"); press.setAttribute("aria-hidden", "true");
      document.body.classList.remove("intro-locked");
      cover.classList.add("open");
      $("#folio").classList.add("show");
      startReveal(); settleBoard();
      if (!reduceMotion && !deepLink) setTimeout(startTour, 5200);
    };
    if (reduceMotion || deepLink) { finish(); return; }
    document.body.classList.add("intro-locked");
    // the cover is visible under the print head as it passes
    cover.classList.add("open");
    let opened = false, auto;
    const open = () => { if (opened) return; opened = true; clearTimeout(auto); press.classList.add("open"); setTimeout(finish, 2250); };
    const arm = () => { auto = setTimeout(open, (W.intro && W.intro.autoOpenAfter) || 900); };
    if (document.readyState === "complete") arm(); else window.addEventListener("load", arm, { once: true });
    press.addEventListener("click", open);
    press.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    skip.addEventListener("click", (e) => { e.stopPropagation(); clearTimeout(auto); opened = true; finish(); });
    press.focus({ preventScroll: true });
  }

  /* ---------------- reveal + nav ---------------- */
  function startReveal() {
    const sections = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) sections.forEach((s) => s.classList.add("in"));
    else {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
      sections.forEach((s) => io.observe(s));
    }
    const nav = $("#nav"), cover = $("#cover"), links = $$("a[href^='#']", nav);
    new IntersectionObserver((entries) => nav.classList.toggle("show", !entries[0].isIntersecting), { threshold: 0.05 }).observe(cover);
    const targets = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    const activeIo = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id)); }), { rootMargin: "-40% 0px -50% 0px" });
    targets.forEach((s) => activeIo.observe(s));
  }

  /* ---------------- guided tour ---------------- */
  const tour = { running: false, pos: 0, last: 0, speed: 44, raf: 0, btn: null, started: false };
  function tourLabel() {
    if (!tour.btn) return;
    $(".tour-label", tour.btn).textContent = tour.running ? t("tour.pause") : t("tour.play");
    tour.btn.setAttribute("aria-label", t("tour.aria")); tour.btn.setAttribute("aria-pressed", tour.running ? "true" : "false");
    tour.btn.classList.toggle("paused", !tour.running);
  }
  function tourStep(now) {
    if (!tour.running) return;
    const dt = Math.min(64, now - tour.last); tour.last = now;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    tour.pos = Math.min(max, tour.pos + (tour.speed * dt) / 1000);
    window.scrollTo({ top: Math.round(tour.pos), behavior: "instant" });
    if (tour.pos >= max - 1) { tourStop(); tour.btn.hidden = true; return; }
    tour.raf = requestAnimationFrame(tourStep);
  }
  function tourStart() { if (reduceMotion || tour.running) return; tour.running = true; tour.pos = window.scrollY; tour.last = performance.now(); tour.btn.hidden = false; tourLabel(); tour.raf = requestAnimationFrame(tourStep); }
  function tourStop() { if (!tour.running) return; tour.running = false; cancelAnimationFrame(tour.raf); tourLabel(); }
  function startTour() {
    if (tour.started || reduceMotion) return;
    tour.started = true; tour.btn = $("#tour");
    tour.btn.addEventListener("click", () => (tour.running ? tourStop() : tourStart()));
    const pause = (e) => { if (tour.btn.contains(e.target)) return; tourStop(); };
    window.addEventListener("wheel", pause, { passive: true }); window.addEventListener("touchstart", pause, { passive: true }); window.addEventListener("pointerdown", pause, { passive: true });
    window.addEventListener("keydown", (e) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End", "Tab"].includes(e.key)) tourStop(); });
    document.addEventListener("focusin", (e) => { if (e.target.matches("input, textarea, select")) tourStop(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) tourStop(); });
    tourStart();
  }

  /* ---------------- RSVP ---------------- */
  function initRsvp() {
    const form = $("#rsvp-form"), status = $("#rsvp-status"), submit = $("#rsvp-submit"), done = $("#rsvp-done");
    const setErr = (name, msg) => { const f = form.querySelector(`[name="${name}"]`).closest(".field"); f.classList.toggle("invalid", !!msg); $(`[data-err="${name}"]`, f).textContent = msg || ""; };
    const DRAFT = "rsvpDraftEditorial";
    try { const d = JSON.parse(localStorage.getItem(DRAFT) || "null"); if (d) Object.keys(d).forEach((k) => form.querySelectorAll(`[name="${k}"]`).forEach((i) => { if (i.type === "radio") i.checked = i.value === d[k]; else i.value = d[k]; })); } catch (e) { /* ignore */ }
    const collect = () => { const o = {}; new FormData(form).forEach((v, k) => { if (k !== "_gotcha") o[k] = String(v).trim(); }); return o; };
    form.addEventListener("input", () => { try { localStorage.setItem(DRAFT, JSON.stringify(collect())); } catch (e) { /* ignore */ } });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = collect(); let ok = true;
      setErr("name", data.name ? "" : t("rsvp.err.name")); if (!data.name) ok = false;
      setErr("attending", data.attending ? "" : t("rsvp.err.attending")); if (!data.attending) ok = false;
      const emailOk = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      setErr("email", emailOk ? "" : t("rsvp.err.email")); if (!emailOk) ok = false;
      if (!ok) { $(".field.invalid", form).scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      if (form.querySelector("[name=_gotcha]").value) return;
      status.className = "form-status"; status.textContent = ""; submit.disabled = true; $("span", submit).textContent = t("rsvp.sending");
      const payload = Object.assign({ lang, wedding: `${W.couple.first} & ${W.couple.partnerFirst} ${W.date.slice(0, 10)}`, submittedAt: new Date().toISOString() }, data);
      try {
        if (W.rsvp.endpoint) {
          const res = await fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          showDone(data);
        } else {
          const yes = data.attending === "yes";
          const subject = `RSVP · ${data.name} · ${yes ? t("rsvp.yes") : t("rsvp.no")}`;
          const body = [`${t("rsvp.name")}: ${data.name}`, `${t("rsvp.email")}: ${data.email || "—"}`, `${t("rsvp.attending")}: ${yes ? t("rsvp.yes") : t("rsvp.no")}`, `${t("rsvp.diet")}: ${data.diet || "—"}`, `${t("rsvp.shuttle")}: ${data.shuttle ? (data.shuttle === "yes" ? t("rsvp.shuttle.yes") : t("rsvp.shuttle.no")) : "—"}`, "", `${t("rsvp.message")}:`, data.message || "—"].join("\n");
          location.href = `mailto:${W.rsvp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          status.innerHTML = `<strong>${t("rsvp.mail.title")}</strong> ${t("rsvp.mail.body")} <a href="mailto:${W.rsvp.email}">${W.rsvp.email}</a>.`;
          submit.disabled = false; $("span", submit).textContent = t("rsvp.send");
        }
      } catch (err) {
        status.className = "form-status error"; status.innerHTML = `${t("rsvp.error")} <a href="mailto:${W.rsvp.email}">${W.rsvp.email}</a>.`;
        submit.disabled = false; $("span", submit).textContent = t("rsvp.send");
      }
    });
    function showDone(data) {
      try { localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ }
      form.hidden = true; $("#rsvp-done-text").textContent = data.attending === "yes" ? t("rsvp.done.body") : t("rsvp.done.declined");
      done.hidden = false; done.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindConfig();
    buildBoard();
    applyLang(initialLang());
    $("#lang-toggle").addEventListener("click", () => applyLang(lang === "en" ? "da" : "en"));
    initFolio();
    initLineArt();
    initRsvp();
    initPress();
  });
})();
