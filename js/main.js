/* ------------------------------------------------------------------
   Page logic: envelope intro, language, bindings, countdown, timeline,
   maps / calendar links, RSVP.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  const W = window.WEDDING;
  const T = window.I18N;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const get = (path, obj) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj || W);

  let lang = "en";
  const t = (key) => (T[lang] && T[lang][key]) || T.en[key] || key;
  const locale = () => (lang === "fr" ? "fr-FR" : "en-GB");

  function fmtTime(iso) {
    return new Intl.DateTimeFormat(locale(), { hour: "numeric", minute: "2-digit", timeZone: W.timeZone }).format(new Date(iso));
  }
  function fmtDate(iso, opts) {
    return new Intl.DateTimeFormat(locale(), Object.assign({ day: "numeric", month: "long", year: "numeric", timeZone: W.timeZone }, opts || {})).format(new Date(iso));
  }

  /* ---------------- language ---------------- */
  function applyLang(next) {
    lang = T[next] ? next : "en";
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    $$("[data-i18n]").forEach((n) => (n.textContent = t(n.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((n) => (n.placeholder = t(n.dataset.i18nPh)));
    $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    $$("[data-bind-lang]").forEach((n) => {
      const v = get(n.dataset.bindLang);
      n.textContent = typeof v === "object" ? v[lang] || v.en : v;
    });
    $$("[data-time]").forEach((n) => (n.textContent = fmtTime(get(n.dataset.time))));
    $$("[data-date]").forEach((n) => (n.textContent = fmtDate(get(n.dataset.date))));
    $$("[data-date-long]").forEach((n) => (n.textContent = fmtDate(get(n.dataset.dateLong), { weekday: "long" })));
    renderTimeline();
    renderCountdown();
    try { localStorage.setItem("lang", lang); } catch (e) { /* private mode */ }
  }

  function initialLang() {
    try {
      const saved = localStorage.getItem("lang");
      if (saved && T[saved]) return saved;
    } catch (e) { /* ignore */ }
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return T[nav] ? nav : "en";
  }

  /* ---------------- static bindings from config ---------------- */
  function bindConfig() {
    $$("[data-bind]").forEach((n) => {
      const v = get(n.dataset.bind);
      if (v != null) n.textContent = v;
    });
    const seal = $("#seal-text");
    if (seal) seal.textContent = W.couple.monogram;

    $$("[data-maps]").forEach((a) => {
      const place = W[a.dataset.maps];
      a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place.venue + ", " + place.address);
    });
    $$("[data-ics]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        downloadIcs(a.dataset.ics);
      });
    });

    if (W.credit && W.credit.name) {
      const c = $("#credit"), l = $("#credit-link");
      l.textContent = W.credit.name;
      l.href = W.credit.url || "#";
      c.hidden = false;
    }
  }

  /* ---------------- calendar (.ics) ---------------- */
  function icsStamp(iso) {
    // Local wall-clock time in the wedding's time zone, written with TZID.
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: W.timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(d).reduce((o, p) => ((o[p.type] = p.value), o), {});
    return `${parts.year}${parts.month}${parts.day}T${parts.hour === "24" ? "00" : parts.hour}${parts.minute}00`;
  }
  function icsEscape(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

  function downloadIcs(which) {
    const place = W[which];
    const names = `${W.couple.first} & ${W.couple.partnerFirst}`;
    const summary = which === "ceremony" ? `${names} · ${t("ceremony.title")}` : `${names} · ${t("recovery.title")}`;
    const desc = which === "ceremony" ? t("ceremony.body") : t("recovery.body");
    const uid = `${which}-${W.date.slice(0, 10)}@${location.hostname || "invitation"}`;
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;TZID=${W.timeZone}:${icsStamp(place.start)}`,
      `DTEND;TZID=${W.timeZone}:${icsStamp(place.end)}`,
      `SUMMARY:${icsEscape(summary)}`,
      `LOCATION:${icsEscape(place.venue + ", " + place.address)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(summary)}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${which === "ceremony" ? "wedding" : "recovery-day"}-${W.couple.first}-${W.couple.partnerFirst}.ics`.toLowerCase();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ---------------- countdown (merged into the hero) ---------------- */
  let countTimer;
  function renderCountdown() {
    const box = $("#countdown");
    if (!box) return;
    const target = new Date(W.date).getTime();
    const diff = target - Date.now();
    const until = $(".count-until", box);
    if (diff <= 0) {
      const sameDay = diff > -1000 * 60 * 60 * 12;
      box.classList.add("past");
      $$("[data-count]", box).forEach((n) => (n.textContent = "0"));
      until.textContent = sameDay ? t("count.today") : t("count.past");
      clearInterval(countTimer);
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    $("[data-count=days]", box).textContent = String(days);
    $("[data-count=hours]", box).textContent = String(hours).padStart(2, "0");
    $("[data-count=mins]", box).textContent = String(mins).padStart(2, "0");
    until.textContent = t("count.until");
  }

  /* ---------------- timeline ---------------- */
  function renderTimeline() {
    const list = $("#tl-list");
    if (!list) return;
    const dayIso = W.date.slice(0, 10);
    const offset = W.date.slice(19) || "+02:00";
    list.replaceChildren(
      ...W.timeline.map((item, idx) => {
        const li = document.createElement("li");
        li.className = "tl-item";
        li.style.setProperty("--i", String(idx));
        li.innerHTML =
          `<div class="tl-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-${item.icon}"/></svg></div>` +
          `<div class="tl-pearl" aria-hidden="true"></div>` +
          `<div class="tl-text"><p class="tl-time"></p><p class="tl-title"></p><p class="tl-note"></p></div>`;
        $(".tl-time", li).textContent = fmtTime(`${dayIso}T${item.time}:00${offset}`);
        $(".tl-title", li).textContent = t(`timeline.${item.key}.title`);
        $(".tl-note", li).textContent = t(`timeline.${item.key}.note`);
        return li;
      })
    );
  }

  /* ---------------- envelope intro ---------------- */
  function initEnvelope() {
    const env = $("#envelope");
    const skip = $("#env-skip");
    let seen = false;
    try { seen = sessionStorage.getItem("envelopeSeen") === "1"; } catch (e) { /* ignore */ }

    const finish = () => {
      env.classList.add("gone");
      document.body.classList.remove("intro-locked");
      env.setAttribute("aria-hidden", "true");
      try { sessionStorage.setItem("envelopeSeen", "1"); } catch (e) { /* ignore */ }
      startReveal();
      openCurtainOnce();
    };
    let curtainDone = false;
    const openCurtainOnce = () => { if (!curtainDone) { curtainDone = true; openCurtain(); } };

    if (seen || reduceMotion || location.hash) {
      finish();
      return;
    }
    document.body.classList.add("intro-locked");

    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      clearTimeout(auto);
      env.classList.add("open");
      // the curtain starts parting while the box is still sliding away,
      // so the whole thing reads as one continuous reveal
      setTimeout(openCurtainOnce, 900);
      setTimeout(finish, 2950);
    };
    const auto = setTimeout(open, (W.intro && W.intro.autoOpenAfter) || 1800);

    env.addEventListener("click", open);
    env.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    skip.addEventListener("click", (e) => { e.stopPropagation(); clearTimeout(auto); opened = true; finish(); });
    env.focus({ preventScroll: true });
  }

  /* ---------------- curtain reveal + guided tour ---------------- */
  function openCurtain() {
    const hero = $("#home");
    if (reduceMotion || location.hash) {
      hero.classList.add("open");
      return;
    }
    // two frames so the closed state is painted before the transition starts
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("open")));
    setTimeout(startTour, 5200);
  }

  const tour = { running: false, pos: 0, last: 0, speed: 46, raf: 0, btn: null, started: false };
  function tourLabel() {
    if (!tour.btn) return;
    $(".tour-label", tour.btn).textContent = tour.running ? t("tour.pause") : t("tour.play");
    tour.btn.setAttribute("aria-label", t("tour.aria"));
    tour.btn.setAttribute("aria-pressed", tour.running ? "true" : "false");
    tour.btn.classList.toggle("paused", !tour.running);
  }
  function tourStep(now) {
    if (!tour.running) return;
    const dt = Math.min(64, now - tour.last);
    tour.last = now;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    tour.pos = Math.min(max, tour.pos + (tour.speed * dt) / 1000);
    window.scrollTo({ top: Math.round(tour.pos), behavior: "instant" });
    if (tour.pos >= max - 1) { tourStop(); tour.btn.hidden = true; return; }
    tour.raf = requestAnimationFrame(tourStep);
  }
  function tourStart() {
    if (reduceMotion || tour.running) return;
    tour.running = true;
    tour.pos = window.scrollY;
    tour.last = performance.now();
    tour.btn.hidden = false;
    tourLabel();
    tour.raf = requestAnimationFrame(tourStep);
  }
  function tourStop() {
    if (!tour.running) return;
    tour.running = false;
    cancelAnimationFrame(tour.raf);
    tourLabel();
  }
  function startTour() {
    if (tour.started || reduceMotion) return;
    tour.started = true;
    tour.btn = $("#tour");
    tour.btn.addEventListener("click", () => (tour.running ? tourStop() : tourStart()));
    // any gesture from the guest hands control back to them
    const pause = (e) => { if (tour.btn.contains(e.target)) return; tourStop(); };
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchstart", pause, { passive: true });
    window.addEventListener("pointerdown", pause, { passive: true });
    window.addEventListener("keydown", (e) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End", "Tab"].includes(e.key)) tourStop(); });
    document.addEventListener("focusin", (e) => { if (e.target.matches("input, textarea, select")) tourStop(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) tourStop(); });
    tourStart();
  }

  /* ---------------- scroll reveal + nav ---------------- */
  function startReveal() {
    const sections = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      sections.forEach((s) => s.classList.add("in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
      sections.forEach((s) => io.observe(s));
    }

    const nav = $("#nav");
    const hero = $("#home");
    const links = $$("a[href^='#']", nav);
    const navIo = new IntersectionObserver((entries) => {
      nav.classList.toggle("show", !entries[0].isIntersecting);
    }, { threshold: 0.05 });
    navIo.observe(hero);

    const targets = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    const activeIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    targets.forEach((s) => activeIo.observe(s));
  }

  /* ---------------- RSVP ---------------- */
  function initRsvp() {
    const form = $("#rsvp-form");
    const status = $("#rsvp-status");
    const submit = $("#rsvp-submit");
    const done = $("#rsvp-done");

    const setErr = (name, msg) => {
      const field = form.querySelector(`[name="${name}"]`).closest(".field");
      field.classList.toggle("invalid", !!msg);
      $(`[data-err="${name}"]`, field).textContent = msg || "";
    };

    // keep a draft so a guest who gets interrupted does not lose their message
    const DRAFT = "rsvpDraft";
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (d) Object.keys(d).forEach((k) => {
        const inputs = form.querySelectorAll(`[name="${k}"]`);
        inputs.forEach((i) => { if (i.type === "radio") i.checked = i.value === d[k]; else i.value = d[k]; });
      });
    } catch (e) { /* ignore */ }
    form.addEventListener("input", () => {
      try { localStorage.setItem(DRAFT, JSON.stringify(collect())); } catch (e) { /* ignore */ }
    });

    function collect() {
      const fd = new FormData(form);
      const o = {};
      fd.forEach((v, k) => { if (k !== "_gotcha") o[k] = String(v).trim(); });
      return o;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = collect();
      let ok = true;
      setErr("name", data.name ? "" : t("rsvp.err.name")); if (!data.name) ok = false;
      setErr("attending", data.attending ? "" : t("rsvp.err.attending")); if (!data.attending) ok = false;
      const emailOk = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      setErr("email", emailOk ? "" : t("rsvp.err.email")); if (!emailOk) ok = false;
      if (!ok) { $(".field.invalid input, .field.invalid", form).scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      if (form.querySelector("[name=_gotcha]").value) return; // bot

      status.className = "form-status";
      status.textContent = "";
      submit.disabled = true;
      $("span", submit).textContent = t("rsvp.sending");

      const payload = Object.assign({ lang, wedding: `${W.couple.first} & ${W.couple.partnerFirst} ${W.date.slice(0, 10)}`, submittedAt: new Date().toISOString() }, data);

      try {
        if (W.rsvp.endpoint) {
          const res = await fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          showDone(data);
        } else {
          const subject = `RSVP · ${data.name} · ${data.attending === "yes" ? t("rsvp.yes") : t("rsvp.no")}`;
          const body = [
            `${t("rsvp.name")}: ${data.name}`,
            `${t("rsvp.email")}: ${data.email || "—"}`,
            `${t("rsvp.attending")} ${data.attending === "yes" ? t("rsvp.yes") : t("rsvp.no")}`,
            `${t("rsvp.diet")}: ${data.diet || "—"}`,
            `${t("rsvp.shuttle")} ${data.shuttle ? (data.shuttle === "yes" ? t("rsvp.shuttle.yes") : t("rsvp.shuttle.no")) : "—"}`,
            "", `${t("rsvp.message")}:`, data.message || "—",
          ].join("\n");
          location.href = `mailto:${W.rsvp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          status.innerHTML = `<strong>${t("rsvp.mail.title")}.</strong> ${t("rsvp.mail.body")} <a href="mailto:${W.rsvp.email}">${W.rsvp.email}</a>.`;
          submit.disabled = false;
          $("span", submit).textContent = t("rsvp.send");
        }
      } catch (err) {
        status.className = "form-status error";
        status.innerHTML = `${t("rsvp.error")} <a href="mailto:${W.rsvp.email}">${W.rsvp.email}</a>.`;
        submit.disabled = false;
        $("span", submit).textContent = t("rsvp.send");
      }
    });

    function showDone(data) {
      try { localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ }
      form.hidden = true;
      $("#rsvp-done-text").textContent = data.attending === "yes" ? t("rsvp.done.body") : t("rsvp.done.declined");
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------------- illustrations ---------------- */
  function drawIllustrations() {
    const E = window.Embroidery;
    $$("[data-roses]").forEach((n, i) => {
      if (n.dataset.roses === "column") E.roseColumn(n, { seed: 41 + i * 7 });
      else E.roseBorder(n, { seed: 23 });
    });
    $$("[data-wisteria]").forEach((n) => {
      if (n.dataset.wisteria === "card") E.wisteriaCanopy(n, { width: 400, height: 96, clusters: 6, seed: 19, minLen: 34, maxLen: 72 });
      else E.wisteriaCanopy(n, { width: 400, height: 160, clusters: 9, seed: 11, minLen: 60, maxLen: 130 });
    });
    $$("[data-arch]").forEach((n) => E.floralArch(n));
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    bindConfig();
    drawIllustrations();
    applyLang(initialLang());
    countTimer = setInterval(renderCountdown, 30000);
    $("#lang-toggle").addEventListener("click", () => applyLang(lang === "en" ? "fr" : "en"));
    initRsvp();
    initEnvelope();
    if (reduceMotion) { const sp = $(".sprite"); if (sp && sp.pauseAnimations) sp.pauseAnimations(); }
    $("#lang-toggle").addEventListener("click", tourLabel);
  });
})();
