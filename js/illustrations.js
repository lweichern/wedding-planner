/* ------------------------------------------------------------------
   Procedural embroidery
   The repetitive illustrations (wisteria canopies, rose borders, the
   floral arch) are generated here so each blossom can vary slightly,
   the way hand-stitched work does. A seeded random keeps the result
   identical on every load.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return (s >>> 0) / 4294967296;
    };
  }

  function el(name, attrs, children) {
    const n = document.createElementNS(SVG_NS, name);
    for (const k in attrs) {
      if (k === "href") n.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", attrs[k]), n.setAttribute("href", attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach((c) => n.appendChild(c));
    return n;
  }

  function svgRoot(vbW, vbH, extra) {
    const s = el("svg", Object.assign({ viewBox: `0 0 ${vbW} ${vbH}`, "aria-hidden": "true", focusable: "false" }, extra || {}));
    return s;
  }

  const f2 = (n) => Math.round(n * 100) / 100;

  /* ---------------- wisteria ---------------- */
  let racemeIndex = 0;
  function wisteriaRaceme(rand, x, y, len, scale) {
    const outer = el("g", { transform: `translate(${f2(x)} ${f2(y)}) scale(${f2(scale)})` });
    const g = el("g", { class: "sway", style: `--i:${racemeIndex++ % 9};--d:${f2(4.2 + rand() * 2.4)}s` });
    outer.appendChild(g);
    // stem
    g.appendChild(el("path", { d: `M0 0 q ${f2(rand() * 4 - 2)} ${f2(len * 0.5)} ${f2(rand() * 3 - 1.5)} ${f2(len * 0.96)}`, fill: "none", stroke: "#5f4a6e", "stroke-width": "1.1", "stroke-linecap": "round" }));
    // leaflets at the top
    g.appendChild(el("path", { d: "M-1 3c-5-2-10 0-12 5 4 2 9 0 12-5zM1 3c5-2 10 0 12 5-4 2-9 0-12-5z", fill: "url(#g-leaf)", stroke: "#3f5238", "stroke-width": ".4", "stroke-opacity": ".6" }));
    const buds = el("g", { fill: "url(#g-wist-bud)", stroke: "#4d3663", "stroke-opacity": ".45", "stroke-width": ".35" });
    const rows = Math.max(5, Math.round(len / 5));
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);
      const cy = 7 + t * (len - 9);
      const width = (1 - t) * 14 + 3;
      const count = t < 0.75 ? 3 : t < 0.92 ? 2 : 1;
      const rx = 3.4 - t * 1.6;
      const ry = rx * 0.72;
      for (let i = 0; i < count; i++) {
        const cx = count === 1 ? rand() * 2 - 1 : (i / (count - 1) - 0.5) * width + (rand() * 2.4 - 1.2);
        const jy = cy + rand() * 2 - 1;
        buds.appendChild(el("ellipse", { cx: f2(cx), cy: f2(jy), rx: f2(rx + rand() * 0.5), ry: f2(ry + rand() * 0.3), transform: `rotate(${f2(rand() * 30 - 15)} ${f2(cx)} ${f2(jy)})` }));
      }
    }
    g.appendChild(buds);
    // satin highlight on the buds
    const hl = buds.cloneNode(true);
    hl.setAttribute("fill", "url(#p-stitch)");
    hl.setAttribute("stroke", "none");
    g.appendChild(hl);
    return outer;
  }

  function wisteriaCanopy(container, opts) {
    const o = Object.assign({ width: 400, height: 150, clusters: 9, seed: 11, vine: true, minLen: 50, maxLen: 110 }, opts || {});
    const rand = rng(o.seed);
    const svg = svgRoot(o.width, o.height);
    const root = el("g", { filter: "url(#f-raise)" });
    if (o.vine) {
      root.appendChild(el("path", { d: `M-4 10 C ${o.width * 0.25} 2 ${o.width * 0.75} 18 ${o.width + 4} 8`, fill: "none", stroke: "#5f4a6e", "stroke-width": "1.8", "stroke-linecap": "round" }));
      root.appendChild(el("path", { d: `M-4 14 C ${o.width * 0.3} 6 ${o.width * 0.7} 22 ${o.width + 4} 12`, fill: "none", stroke: "#7a6488", "stroke-width": "1", "stroke-linecap": "round", opacity: ".7" }));
      // leaves along the vine
      for (let i = 0; i < Math.round(o.width / 34); i++) {
        const x = 10 + i * 34 + rand() * 10;
        const y = 8 + Math.sin(i) * 3;
        const rot = -40 + rand() * 80 + (i % 2 ? 160 : 0);
        root.appendChild(el("use", { href: "#s-leaf", x: f2(x - 11), y: f2(y - 7), width: 22, height: 14, transform: `rotate(${f2(rot)} ${f2(x)} ${f2(y)})` }));
      }
    }
    for (let i = 0; i < o.clusters; i++) {
      const x = (i + 0.5) * (o.width / o.clusters) + (rand() * 20 - 10);
      const len = o.minLen + rand() * (o.maxLen - o.minLen) * (i % 2 ? 1 : 0.75);
      const scale = 0.9 + rand() * 0.35;
      root.appendChild(wisteriaRaceme(rand, x, 10 + rand() * 6, len, scale));
    }
    svg.appendChild(root);
    container.replaceChildren(svg);
  }

  /* ---------------- roses ---------------- */
  const ROSES = ["#s-rose-pink", "#s-rose-wine", "#s-rose-cream", "#s-rose-pink"];

  let bloomIndex = 0;
  function roseCluster(rand, cx, cy, size, variant) {
    const g = el("g", { class: "bloom", style: `--i:${bloomIndex++ % 12}` });
    // leaves fanning out behind
    const leaves = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < leaves; i++) {
      const a = -150 + i * (120 / leaves) + rand() * 40;
      const lw = size * 0.9;
      g.appendChild(el("use", { href: "#s-leaf", x: f2(cx), y: f2(cy - lw * 0.33), width: f2(lw), height: f2(lw * 0.66), transform: `rotate(${f2(a)} ${f2(cx)} ${f2(cy)})` }));
    }
    g.appendChild(el("use", { href: variant, x: f2(cx - size / 2), y: f2(cy - size / 2), width: f2(size), height: f2(size), transform: `rotate(${f2(rand() * 60 - 30)} ${f2(cx)} ${f2(cy)})` }));
    return g;
  }

  function roseBorder(container, opts) {
    const o = Object.assign({ width: 400, height: 76, count: 9, seed: 23 }, opts || {});
    const rand = rng(o.seed);
    const svg = svgRoot(o.width, o.height);
    const root = el("g");
    // trailing stem through the border
    root.appendChild(el("path", { d: `M-4 ${o.height * 0.55} C ${o.width * 0.2} ${o.height * 0.3} ${o.width * 0.5} ${o.height * 0.8} ${o.width + 4} ${o.height * 0.5}`, fill: "none", stroke: "#5c7052", "stroke-width": "1.6", "stroke-linecap": "round" }));
    // back row (smaller, cream/pink), front row larger
    for (let i = 0; i < o.count + 1; i++) {
      const cx = i * (o.width / o.count) + rand() * 10 - 5;
      const cy = o.height * 0.36 + rand() * 8;
      root.appendChild(roseCluster(rand, cx, cy, 26 + rand() * 8, ROSES[(i + 2) % ROSES.length]));
    }
    for (let i = 0; i < o.count; i++) {
      const cx = (i + 0.5) * (o.width / o.count) + rand() * 8 - 4;
      const cy = o.height * 0.6 + rand() * 8;
      root.appendChild(roseCluster(rand, cx, cy, 34 + rand() * 12, ROSES[i % ROSES.length]));
    }
    // a few pearls scattered between blooms
    const pearls = el("g", { fill: "url(#g-pearl)", stroke: "#9c8088", "stroke-width": ".3" });
    for (let i = 0; i < o.count * 2; i++) pearls.appendChild(el("circle", { cx: f2(rand() * o.width), cy: f2(o.height * 0.3 + rand() * o.height * 0.5), r: f2(1.6 + rand() * 1.2) }));
    root.appendChild(pearls);
    svg.appendChild(root);
    container.replaceChildren(svg);
  }

  function roseColumn(container, opts) {
    const o = Object.assign({ width: 40, height: 300, count: 5, seed: 41 }, opts || {});
    const rand = rng(o.seed);
    const svg = svgRoot(o.width, o.height, { preserveAspectRatio: "xMidYMid meet" });
    const root = el("g");
    root.appendChild(el("path", { d: `M${o.width * 0.5} -4 C ${o.width * 0.1} ${o.height * 0.25} ${o.width * 0.9} ${o.height * 0.6} ${o.width * 0.5} ${o.height + 4}`, fill: "none", stroke: "#5c7052", "stroke-width": "1.4", "stroke-linecap": "round" }));
    for (let i = 0; i < o.count; i++) {
      const cy = (i + 0.5) * (o.height / o.count) + rand() * 10 - 5;
      const cx = o.width * 0.5 + (i % 2 ? 6 : -6);
      root.appendChild(roseCluster(rand, cx, cy, 22 + rand() * 8, ROSES[(i * 2 + 1) % ROSES.length]));
    }
    svg.appendChild(root);
    container.replaceChildren(svg);
  }

  /* ---------------- floral arch (Our Story) ---------------- */
  function floralArch(container, opts) {
    const o = Object.assign({ width: 420, height: 360, seed: 77 }, opts || {});
    const rand = rng(o.seed);
    const svg = svgRoot(o.width, o.height);
    const root = el("g");
    const cx = o.width / 2, r = o.width * 0.38, baseY = o.height - 8, topY = r + 24;
    // the arch itself: stitched double line
    const arch = `M${cx - r} ${baseY} V${topY} A${r} ${r} 0 0 1 ${cx + r} ${topY} V${baseY}`;
    root.appendChild(el("path", { d: arch, fill: "none", stroke: "#5c7052", "stroke-width": "2.2", "stroke-linecap": "round" }));
    root.appendChild(el("path", { d: arch, fill: "none", stroke: "#b3bf9e", "stroke-width": ".9", "stroke-dasharray": "3 3", transform: "translate(0 -3)" }));
    // leaves and roses along the curve + a little way down the legs
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI + (i / steps) * Math.PI; // left to right over the top
      const px = cx + r * Math.cos(a), py = topY + r * Math.sin(a);
      const deg = (a * 180) / Math.PI + 90;
      const lw = 20 + rand() * 8;
      root.appendChild(el("use", { href: "#s-leaf", x: f2(px), y: f2(py - lw * 0.33), width: f2(lw), height: f2(lw * 0.66), transform: `rotate(${f2(deg - 30 + rand() * 20)} ${f2(px)} ${f2(py)})` }));
      root.appendChild(el("use", { href: "#s-leaf", x: f2(px), y: f2(py - lw * 0.33), width: f2(lw), height: f2(lw * 0.66), transform: `rotate(${f2(deg + 150 + rand() * 20)} ${f2(px)} ${f2(py)})` }));
      if (i % 2 === 0) {
        const size = 24 + rand() * 14;
        const b = el("g", { class: "bloom", style: `--i:${bloomIndex++ % 12}` });
        b.appendChild(el("use", { href: ROSES[i % ROSES.length], x: f2(px - size / 2), y: f2(py - size / 2), width: f2(size), height: f2(size), transform: `rotate(${f2(rand() * 60)} ${f2(px)} ${f2(py)})` }));
        root.appendChild(b);
      }
    }
    // roses climbing the legs
    for (let side = -1; side <= 1; side += 2) {
      for (let j = 0; j < 4; j++) {
        const py = topY + 30 + j * 50 + rand() * 10;
        const px = cx + side * r + (j % 2 ? side * 8 : -side * 6);
        root.appendChild(roseCluster(rand, px, py, 22 + rand() * 12, ROSES[(j + (side > 0 ? 1 : 0)) % ROSES.length]));
      }
    }
    // wisteria hanging from the crown of the arch
    for (let k = -2; k <= 2; k++) {
      const a = -Math.PI / 2 + k * 0.24;
      const px = cx + (r - 6) * Math.cos(a), py = topY + (r - 6) * Math.sin(a);
      root.appendChild(wisteriaRaceme(rand, px, py, 50 + (2 - Math.abs(k)) * 16 + rand() * 10, 0.95));
    }
    svg.appendChild(root);
    container.replaceChildren(svg);
  }

  window.Embroidery = { wisteriaCanopy, roseBorder, roseColumn, floralArch };
})();
