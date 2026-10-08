/* ------------------------------------------------------------------
   Procedural watercolour
   Waves, stars, footprints and shell scatters are generated so they
   can vary like brushwork while staying identical on every load.
   Anything that moves is its own element so the watercolour filter is
   rendered once and motion stays on the compositor.
   ------------------------------------------------------------------ */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const f2 = (n) => Math.round(n * 100) / 100;

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; };
  }
  function el(name, attrs, children) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) {
      if (k === "href") { n.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", attrs[k]); n.setAttribute("href", attrs[k]); }
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach((c) => n.appendChild(c));
    return n;
  }

  /* ---------------- waves ----------------
     Each layer is one svg twice the container width, holding the same
     wave twice, so a translateX(-50%) loop is seamless. */
  function wavePath(rand, W, H, amp, period) {
    let d = `M0 ${H} L0 ${H / 2}`;
    const n = Math.round(W / period);
    const step = W / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * step, x1 = (i + 1) * step;
      const a = amp * (0.7 + rand() * 0.6);
      d += ` C ${f2(x0 + step * 0.3)} ${f2(H / 2 - a)} ${f2(x0 + step * 0.5)} ${f2(H / 2 - a)} ${f2(x0 + step * 0.62)} ${f2(H / 2)}`;
      d += ` C ${f2(x0 + step * 0.75)} ${f2(H / 2 + a * 0.55)} ${f2(x0 + step * 0.9)} ${f2(H / 2 + a * 0.55)} ${f2(x1)} ${f2(H / 2)}`;
    }
    d += ` L${W} ${H} Z`;
    return d;
  }
  function waves(container, opts) {
    const o = Object.assign({ width: 400, seed: 5 }, opts || {});
    const rand = rng(o.seed);
    container.replaceChildren();
    const layers = [
      { h: 44, amp: 5, period: 100, cls: "wave w1", filter: "wc-soft" },
      { h: 50, amp: 7, period: 80, cls: "wave w2", filter: "wc-soft" },
      { h: 58, amp: 9, period: 66, cls: "wave w3", filter: "wc" },
    ];
    layers.forEach((L, idx) => {
      const svg = el("svg", { viewBox: `0 0 ${o.width * 2} ${L.h}`, class: L.cls, "aria-hidden": "true", focusable: "false" });
      const d = wavePath(rand, o.width, L.h, L.amp, L.period);
      const g = el("g", { filter: `url(#${L.filter})` });
      g.appendChild(el("path", { d, fill: "currentColor" }));
      g.appendChild(el("path", { d, fill: "currentColor", transform: `translate(${o.width} 0)` }));
      svg.appendChild(g);
      if (idx === 2) {
        // foam along the crest of the nearest wave
        const foam = el("g", { class: "foam", filter: "url(#wc-soft)", fill: "none", stroke: "#fff", "stroke-width": "3", "stroke-linecap": "round", "stroke-dasharray": "14 9 5 11", opacity: ".85" });
        const crest = d.replace(/^M0 \d+(\.\d+)? L0/, "M0").replace(/ L\d+(\.\d+)? \d+(\.\d+)? Z$/, "");
        foam.appendChild(el("path", { d: crest, transform: "translate(0 1.5)" }));
        foam.appendChild(el("path", { d: crest, transform: `translate(${o.width} 1.5)` }));
        svg.appendChild(foam);
      }
      container.appendChild(svg);
    });
  }

  /* ---------------- stars ---------------- */
  function stars(container, opts) {
    const o = Object.assign({ count: 46, seed: 17 }, opts || {});
    const rand = rng(o.seed);
    container.replaceChildren();
    for (let i = 0; i < o.count; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const size = 1 + rand() * 2.2;
      s.style.cssText = `left:${f2(rand() * 100)}%;top:${f2(rand() * 70)}%;width:${f2(size)}px;height:${f2(size)}px;--d:${f2(2 + rand() * 3)}s;--delay:${f2(-rand() * 5)}s;--o:${f2(0.4 + rand() * 0.6)}`;
      container.appendChild(s);
    }
    const shoot = document.createElement("span");
    shoot.className = "shooting-star";
    container.appendChild(shoot);
  }

  /* ---------------- footprints ----------------
     Two rows of bare footprints wandering up the sand towards the arch. */
  function footprints(container, opts) {
    const o = Object.assign({ width: 400, height: 190, seed: 29 }, opts || {});
    const rand = rng(o.seed);
    const svg = el("svg", { viewBox: `0 0 ${o.width} ${o.height}`, "aria-hidden": "true", focusable: "false", preserveAspectRatio: "none" });
    const g = el("g", { fill: "#b8976a", opacity: ".55", filter: "url(#wc-soft)" });
    const steps = 9;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const x = 40 + t * 150 + rand() * 6;
      const y = o.height - 14 - t * 110;
      const side = i % 2 ? 7 : -7;
      const scale = 1 - t * 0.45;
      const foot = el("g", { transform: `translate(${f2(x + side)} ${f2(y)}) rotate(${f2(-28 + rand() * 10)}) scale(${f2(scale)})` });
      foot.appendChild(el("ellipse", { cx: 0, cy: 0, rx: 4.2, ry: 7.5 }));
      foot.appendChild(el("ellipse", { cx: -2.2, cy: -10, rx: 1.6, ry: 2 }));
      foot.appendChild(el("ellipse", { cx: 0.4, cy: -10.6, rx: 1.2, ry: 1.6 }));
      foot.appendChild(el("ellipse", { cx: 2.6, cy: -10, rx: 1, ry: 1.4 }));
      g.appendChild(foot);
    }
    svg.appendChild(g);
    container.replaceChildren(svg);
  }

  /* ---------------- shells scattered on the sand ---------------- */
  const SHELLS = ["#s-shell", "#s-spiral", "#s-starfish", "#s-shell"];
  function shells(container, opts) {
    const o = Object.assign({ width: 400, height: 80, count: 7, seed: 37, row: false }, opts || {});
    const rand = rng(o.seed);
    const svg = el("svg", { viewBox: `0 0 ${o.width} ${o.height}`, "aria-hidden": "true", focusable: "false" });
    for (let i = 0; i < o.count; i++) {
      const size = o.row ? 26 + rand() * 14 : 14 + rand() * 16;
      const x = o.row ? (i + 0.5) * (o.width / o.count) - size / 2 : rand() * (o.width - size);
      const y = o.row ? (o.height - size) / 2 + rand() * 8 - 4 : rand() * (o.height - size);
      const sym = SHELLS[(i + (o.row ? 1 : 0)) % SHELLS.length];
      svg.appendChild(el("use", { href: sym, x: f2(x), y: f2(y), width: f2(size), height: f2(size), transform: `rotate(${f2(rand() * 360)} ${f2(x + size / 2)} ${f2(y + size / 2)})` }));
    }
    container.replaceChildren(svg);
  }

  window.Watercolour = { waves, stars, footprints, shells };
})();
