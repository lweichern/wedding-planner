/* ------------------------------------------------------------------
   Wax seal variant page logic: seals and parchment, hold-to-break
   intro, language, bindings, countdown, timeline, RSVP sealed with a
   press, guided tour.
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
  const locale = () => (lang === "it" ? "it-IT" : "en-GB");
  const fmtTime = (iso) => new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: W.timeZone }).format(new Date(iso));
  const fmtDate = (iso, o) => new Intl.DateTimeFormat(locale(), Object.assign({ day: "numeric", month: "long", year: "numeric", timeZone: W.timeZone }, o || {})).format(new Date(iso));

  /* ---------------- language ---------------- */
  function applyLang(next) {
    lang = T[next] ? next : "en";
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    $$("[data-i18n]").forEach((n) => (n.textContent = t(n.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((n) => (n.placeholder = t(n.dataset.i18nPh)));
    $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    $$("[data-bind-lang]").forEach((n) => { const v = get(n.dataset.bindLang); n.textContent = typeof v === "object" ? v[lang] || v.en : v; });
    $$("[data-time]").forEach((n) => (n.textContent = fmtTime(get(n.dataset.time))));
    $$("[data-date]").forEach((n) => (n.textContent = fmtDate(get(n.dataset.date))));
    $$("[data-date-long]").forEach((n) => (n.textContent = fmtDate(get(n.dataset.dateLong), { weekday: "long" })));
    renderTimeline(); renderCountdown(false); tourLabel();
    try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
  }
  function initialLang() {
    try { const s = localStorage.getItem("lang"); if (s && T[s]) return s; } catch (e) { /* ignore */ }
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return T[nav] ? nav : "en";
  }

  /* ---------------- seals and parchment ---------------- */
  function pressSeals() {
    document.documentElement.style.setProperty("--deckle", window.Wax.deckleMask(5));
    $$("[data-seal]").forEach((n) => {
      let o = {};
      try { o = JSON.parse(n.dataset.seal); } catch (e) { /* ignore */ }
      if (o.motif === "monogram" && !o.text) o.text = W.couple.monogram;
      window.Wax.seal(n, o);
    });
  }

  /* ---------------- ink drawings: inline the symbol so each path can draw itself ---------------- */
  function inkInk() {
    $$("svg.ink").forEach((svg) => {
      const use = $("use", svg);
      if (!use) return;
      const sym = document.querySelector(use.getAttribute("href"));
      if (!sym) return;
      svg.replaceChildren(...Array.from(sym.childNodes).map((n) => n.cloneNode(true)));
      const paths = $$("path", svg);
      const total = paths.reduce((a, p) => a + p.getTotalLength(), 0);
      let acc = 0;
      paths.forEach((p) => {
        const L = p.getTotalLength();
        p.style.setProperty("--len", L.toFixed(1));
        // each stroke starts when the previous one is mostly done, so the pen moves on
        p.style.setProperty("--d", (0.15 + (acc / total) * 1.1).toFixed(2) + "s");
        p.style.setProperty("--draw", (0.4 + (L / total) * 1.2).toFixed(2) + "s");
        acc += L;
      });
    });
  }
  function stagger() {
    $$(".reveal").forEach((sec) => Array.from(sec.children).forEach((c, i) => c.style.setProperty("--i", String(i))));
    $$(".facts div, .swatches li, .rsvp-form .field").forEach((n, i, arr) => {
      const parent = n.parentElement;
      n.style.setProperty("--j", String(Array.from(parent.children).indexOf(n)));
    });
  }

  /* ---------------- bindings ---------------- */
  function bindConfig() {
    $$("[data-bind]").forEach((n) => { const v = get(n.dataset.bind); if (v != null) n.textContent = v; });
    $$("[data-maps]").forEach((a) => { const p = W[a.dataset.maps]; a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.venue + ", " + p.address); });
    $$("[data-ics]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); downloadIcs(a.dataset.ics); }));
    if (W.credit && W.credit.name) { $("#credit-link").textContent = W.credit.name; $("#credit-link").href = W.credit.url || "#"; $("#credit").hidden = false; }
  }

  /* ---------------- calendar ---------------- */
  function icsStamp(iso) {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: W.timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso)).reduce((o, x) => ((o[x.type] = x.value), o), {});
    return `${p.year}${p.month}${p.day}T${p.hour === "24" ? "00" : p.hour}${p.minute}00`;
  }
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  function downloadIcs(which) {
    const place = W[which];
    const summary = `${W.couple.first} & ${W.couple.partnerFirst} · ${t(which === "ceremony" ? "ceremony.kicker" : "after.kicker")}`;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
      `UID:${which}-${W.date.slice(0, 10)}@${location.hostname || "invitation"}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;TZID=${W.timeZone}:${icsStamp(place.start)}`, `DTEND;TZID=${W.timeZone}:${icsStamp(place.end)}`,
      `SUMMARY:${esc(summary)}`, `LOCATION:${esc(place.venue + ", " + place.address)}`, `DESCRIPTION:${esc(t(which === "ceremony" ? "ceremony.body" : "after.body"))}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(summary)}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${which}-${W.couple.first}-${W.couple.partnerFirst}.ics`.toLowerCase();
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ---------------- countdown ---------------- */
  let countTimer, counted = false;
  function tween(el, to, pad, dur) {
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(to * e)).padStart(pad, "0");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function renderCountdown(animate) {
    const box = $("#countdown"), diff = new Date(W.date).getTime() - Date.now(), until = $(".count-until", box);
    if (diff <= 0) { $$("[data-count]", box).forEach((n) => (n.textContent = "0")); until.textContent = diff > -43200000 ? t("count.today") : t("count.past"); clearInterval(countTimer); return; }
    const v = { days: [Math.floor(diff / 86400000), 1], hours: [Math.floor((diff % 86400000) / 3600000), 2], mins: [Math.floor((diff % 3600000) / 60000), 2] };
    Object.keys(v).forEach((k, i) => {
      const el = $(`[data-count=${k}]`, box);
      if (animate && !reduceMotion) setTimeout(() => tween(el, v[k][0], v[k][1], 1400), i * 160);
      else el.textContent = String(v[k][0]).padStart(v[k][1], "0");
    });
    until.textContent = t("count.until");
  }

  /* ---------------- timeline with a seal for every hour ---------------- */
  const COL = ["burgundy", "gold", "forest", "navy"];
  function renderTimeline() {
    const list = $("#tl-list"), day = W.date.slice(0, 10), offset = W.date.slice(19) || "+02:00";
    list.replaceChildren(...W.timeline.map((item, idx) => {
      const li = document.createElement("li");
      li.className = "tl-item"; li.style.setProperty("--i", String(idx));
      const h = parseInt(item.time, 10);
      const dayIso = h < 6 ? new Date(new Date(day).getTime() + 86400000).toISOString().slice(0, 10) : day;
      li.innerHTML = `<div class="tl-seal"></div><div class="tl-text"><p class="tl-time"></p><p class="tl-title"></p><p class="tl-note"></p></div>`;
      window.Wax.seal($(".tl-seal", li), { colour: COL[idx % COL.length], motif: item.motif, seed: 200 + idx * 7, drips: 1 });
      $(".tl-time", li).textContent = fmtTime(`${dayIso}T${item.time}:00${offset}`);
      $(".tl-title", li).textContent = t(`timeline.${item.key}.title`);
      $(".tl-note", li).textContent = t(`timeline.${item.key}.note`);
      return li;
    }));
  }

  /* ---------------- the sealed letter: press and hold ---------------- */
  function initIntro() {
    const env = $("#envelope"), skip = $("#env-skip"), sealBox = $("#intro-seal");
    const deepLink = location.hash && location.hash !== "#home" && location.hash !== "#";
    const sealSvg = window.Wax.seal(sealBox, { colour: "burgundy", motif: "monogram", text: W.couple.monogram, seed: 7, drips: 3, cracks: true });
    $(".half-l", env).appendChild(sealSvg.cloneNode(true));
    $(".half-r", env).appendChild(sealSvg.cloneNode(true));

    let heroDone = false;
    const openHeroOnce = () => { if (!heroDone) { heroDone = true; openHero(); } };
    const finish = () => {
      env.classList.add("gone"); env.setAttribute("aria-hidden", "true");
      document.body.classList.remove("intro-locked");
      document.documentElement.classList.add("lit");
      startReveal(); openHeroOnce();
    };
    if (reduceMotion || deepLink) { finish(); return; }
    document.body.classList.add("intro-locked");

    let progress = 0, holding = false, broken = false, raf = 0, last = 0, auto;
    const paint = () => { sealBox.style.setProperty("--crack", progress.toFixed(3)); env.style.setProperty("--hold", progress.toFixed(3)); };
    const breakSeal = () => {
      if (broken) return;
      broken = true; clearTimeout(auto); cancelAnimationFrame(raf);
      progress = 1; paint();
      env.classList.remove("holding");
      env.classList.add("broken");
      const glow = $(".candlelight.glow");
      glow.classList.add("flare"); setTimeout(() => glow.classList.remove("flare"), 1000);
      setTimeout(() => env.classList.add("unfold"), 450);
      setTimeout(() => env.classList.add("rise"), 1250);
      setTimeout(finish, 2100);
    };
    const tick = (now) => {
      const dt = Math.min(50, now - last); last = now;
      if (holding) progress = Math.min(1, progress + dt / 1100); else progress = Math.max(0, progress - dt / 700);
      env.classList.toggle("cracked", holding && progress > 0.15);
      paint();
      if (progress >= 1) { breakSeal(); return; }
      if (holding || progress > 0) raf = requestAnimationFrame(tick);
    };
    const hint = $(".env-hint", env);
    const start = (e) => {
      if (broken || (e && skip.contains(e.target))) return;
      holding = true; env.classList.add("holding"); hint.textContent = t("seal.holding"); last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    };
    const stop = () => { if (!holding) return; holding = false; env.classList.remove("cracked"); if (!broken) hint.textContent = t("seal.hold"); };
    env.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button !== 0) return; start(e); try { env.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } });
    env.addEventListener("pointerup", stop); env.addEventListener("pointercancel", stop); env.addEventListener("pointerleave", stop);
    env.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); breakSeal(); } });
    skip.addEventListener("click", (e) => { e.stopPropagation(); clearTimeout(auto); broken = true; finish(); });
    const arm = () => { auto = setTimeout(() => { holding = true; env.classList.add("holding"); last = performance.now(); raf = requestAnimationFrame(tick); }, (W.intro && W.intro.autoOpenAfter) || 2000); };
    if (document.readyState === "complete") arm(); else window.addEventListener("load", arm, { once: true });
    env.focus({ preventScroll: true });
  }

  function openHero() {
    const hero = $("#home");
    if (reduceMotion || (location.hash && location.hash !== "#home")) { hero.classList.add("open"); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("open")));
    setTimeout(() => { if (!counted) { counted = true; renderCountdown(true); } }, 3400);
    setTimeout(startTour, 6400);
  }

  /* ---------------- reveal + nav ---------------- */
  function startReveal() {
    const sections = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) sections.forEach((s) => s.classList.add("in"));
    else {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
      sections.forEach((s) => io.observe(s));
    }
    const nav = $("#nav"), hero = $("#home"), links = $$("a[href^='#']", nav);
    new IntersectionObserver((entries) => nav.classList.toggle("show", !entries[0].isIntersecting), { threshold: 0.05 }).observe(hero);
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

  /* ---------------- RSVP: press the seal ---------------- */
  function initRsvp() {
    const form = $("#rsvp-form"), status = $("#rsvp-status"), submit = $("#rsvp-submit"), done = $("#rsvp-done"), caption = $("#seal-caption span");
    const setErr = (name, msg) => { const f = form.querySelector(`[name="${name}"]`).closest(".field"); f.classList.toggle("invalid", !!msg); $(`[data-err="${name}"]`, f).textContent = msg || ""; };
    const DRAFT = "rsvpDraftWax";
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
      status.className = "form-status"; status.textContent = "";
      submit.disabled = true; submit.classList.add("pressing"); caption.textContent = t("rsvp.sending");
      setTimeout(() => { submit.classList.remove("pressing"); submit.classList.add("is-sealed"); caption.textContent = t("rsvp.sealed"); }, 350);
      const payload = Object.assign({ lang, wedding: `${W.couple.first} & ${W.couple.partnerFirst} ${W.date.slice(0, 10)}`, submittedAt: new Date().toISOString() }, data);
      try {
        if (W.rsvp.endpoint) {
          const res = await fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          setTimeout(() => showDone(data), 900);
        } else {
          const yes = data.attending === "yes";
          const subject = `RSVP · ${data.name} · ${yes ? t("rsvp.yes") : t("rsvp.no")}`;
          const body = [`${t("rsvp.name")}: ${data.name}`, `${t("rsvp.email")}: ${data.email || "—"}`, `${t("rsvp.attending")} ${yes ? t("rsvp.yes") : t("rsvp.no")}`, `${t("rsvp.diet")}: ${data.diet || "—"}`, `${t("rsvp.shuttle")} ${data.shuttle ? (data.shuttle === "yes" ? t("rsvp.shuttle.yes") : t("rsvp.shuttle.no")) : "—"}`, "", `${t("rsvp.message")}:`, data.message || "—"].join("\n");
          setTimeout(() => { location.href = `mailto:${W.rsvp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }, 700);
          status.innerHTML = `<strong>${t("rsvp.mail.title")}</strong> ${t("rsvp.mail.body")} <a href="mailto:${W.rsvp.email}">${W.rsvp.email}</a>.`;
          setTimeout(() => { submit.disabled = false; submit.classList.remove("is-sealed"); caption.textContent = t("rsvp.send"); }, 4000);
        }
      } catch (err) {
        status.className = "form-status error"; status.innerHTML = `${t("rsvp.error")} <a href="mailto:${W.rsvp.email}">${W.rsvp.email}</a>.`;
        submit.disabled = false; submit.classList.remove("is-sealed"); caption.textContent = t("rsvp.send");
      }
    });
    function showDone(data) {
      try { localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ }
      form.hidden = true; $("#rsvp-done-text").textContent = data.attending === "yes" ? t("rsvp.done.body") : t("rsvp.done.declined");
      done.hidden = false; done.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    pressSeals();
    inkInk();
    stagger();
    bindConfig();
    applyLang(initialLang());
    countTimer = setInterval(() => renderCountdown(false), 30000);
    $("#lang-toggle").addEventListener("click", () => {
      const next = lang === "en" ? "it" : "en";
      if (reduceMotion) { applyLang(next); return; }
      document.documentElement.classList.add("lang-switching");
      setTimeout(() => { applyLang(next); document.documentElement.classList.remove("lang-switching"); }, 230);
    });
    initRsvp();
    initIntro();
  });
})();
